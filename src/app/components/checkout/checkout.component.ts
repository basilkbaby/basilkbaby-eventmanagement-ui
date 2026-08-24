import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom, Subscription } from 'rxjs';

// Stripe imports
import { 
  loadStripe,
  Stripe,
  StripeElements,
  StripePaymentElement,
  PaymentIntent
} from '@stripe/stripe-js';

// Services
import { environment } from '../../../environments/environment';
import { CartService } from '../../core/services/cart.service';
import { CartSummaryDto, CartDetailsResponse } from '../../core/models/DTOs/cart.DTO.model';
import { emailMatchValidator } from '../../core/validators/email-match-validator';
import { CouponData, CouponResponse } from '../../core/models/DTOs/checkout.DTo.model';
import { NotificationService } from '../../core/services/notification.service';
import { AnalyticsService } from '../../core/services/analytics.service';
import { PixelService } from '../../core/services/pixel.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule,
    RouterModule,
    FormsModule
  ],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit, OnDestroy {
  checkoutForm: FormGroup;
  cartSummary: CartSummaryDto = { 
    cartId: '', 
    eventId: '', 
    subtotal: 0, 
    serviceFee: 0, 
    total: 0, 
    totalDiscount : 0,
    seatCount: 0, 
    cartItems: [] ,
    couponCode: '',
    couponDiscount: 0,
    discount: 0
  };
  loading: boolean = true;
  processing: boolean = false;
  orderComplete: boolean = false;
  orderId: string = '';
  showFormErrors: boolean = false;
  showPrivacyPolicy = false;
  loadError: string = '';

  // Stripe properties
  stripe: Stripe | null = null;
  elements: StripeElements | null = null;
  paymentElement: StripePaymentElement | null = null;
  stripeError: string = '';
  soldSeatsMessage: string = '';
  
  // Payment intent data
  private clientSecret: string = '';
  private paymentIntentId: string = '';
  // Set once a payment has actually succeeded — never re-charge; only complete the order.
  private paidPaymentIntentId: string = '';
  
  private checkoutSubscription: Subscription | undefined;
  private cartStateSubscription: Subscription | undefined;
  private cartDetailsSubscription: Subscription | undefined;

   // Coupon properties
  couponCode: string = '';
  couponApplied: boolean = false;
  couponLoading: boolean = false;
  couponError: string = '';
  couponData: CouponData | null = null;
  
  showPaymentSection: boolean = false;
  // Set when payment was already taken via redirect but session data was lost —
  // skips creating a new payment intent so the user isn't double-charged
  recoveryPaymentIntentId: string = '';
  
  constructor(
    private fb: FormBuilder,
    private cartService: CartService,
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private notificationService: NotificationService,
    private analytics: AnalyticsService,
    private pixel: PixelService
  ) {
    this.checkoutForm = this.createCheckoutForm();
    
    // Add this ONE listener
    this.checkoutForm.get('customer')?.statusChanges.subscribe(status => {
      if (status === 'VALID' && !this.showPaymentSection && this.cartSummary.seatCount > 0) {
        this.showPaymentSection = true;
        this.pixel.initiateCheckout(this.cartSummary.eventId ?? '', this.cartSummary.total, this.cartSummary.seatCount);
        this.cdr.detectChanges();
        // In recovery mode the payment was already taken — don't create a new payment intent
        if (!this.recoveryPaymentIntentId) {
          setTimeout(() => this.initializePayment(), 100);
        }
      }
    });
  }

  ngOnInit(): void {
    // Subscribe to cart state for summary data
    this.cartStateSubscription = this.cartService.currentCartState$.subscribe({
      next: (state) => {
        this.cartSummary = state.summary;
        
        // REMOVED: Don't initialize payment here anymore
        this.couponApplied = this.cartSummary.couponDiscount > 0;
      }
    });

    // Subscribe to cart details API responses for loading/error states
    this.cartDetailsSubscription = this.cartService.cartDetails$.subscribe({
      next: (response: CartDetailsResponse) => {
        this.loading = false;
        if (!response.success) {
          this.loadError = response.error || 'Failed to load cart details. Please go back and try again.';
          this.cdr.detectChanges();
        }
      },
      error: () => {
        this.loading = false;
        this.loadError = 'Unable to load your cart. Please go back and try again.';
        this.cdr.detectChanges();
      }
    });

    // Subscribe to checkout results
    this.checkoutSubscription = this.cartService.checkout$.subscribe({
      next: (response) => {
        this.processing = false;
        if (response.success && response.data) {
          this.orderComplete = true;
          this.orderId = response.data.orderId;
          this.cdr.detectChanges();
          setTimeout(() => {
            this.router.navigate(['/confirmation', response.data!.orderId]);
          }, 2000);
        } else {
          let message = response.error || 'Checkout failed. Please contact support.';
          const ref = this.paidPaymentIntentId || this.paymentIntentId;
          // Legacy fallback: older API builds returned the raw code instead of a message.
          if (message.includes('SEATS_ALREADY_SOLD')) {
            const seats = message.split(':')[1] || '';
            message = `Sorry — these seats were just taken by another customer${seats ? ' (' + seats + ')' : ''}. Your payment has been received.`;
          }
          // We only get here after the payment succeeded, so money was taken — always give the
          // customer a reference so support can locate and refund the charge.
          if (ref && !message.includes(ref)) {
            message += ` Please contact support with reference ${ref} for a refund.`;
          }
          this.soldSeatsMessage = message;
          this.stripeError = message;
          this.notificationService.showError(message, 'Payment Error', 8000);
          this.cdr.detectChanges();
        }
      },
      error: () => {
        this.processing = false;
        const message = 'Checkout processing failed. Please contact support.';
        this.stripeError = message;
        this.notificationService.showError(message, 'Payment Error', 8000);
        this.cdr.detectChanges();
      }
    });

    // Handle return from async payment redirect (e.g. Klarna)
    const urlParams = new URLSearchParams(window.location.search);
    const redirectPaymentIntent = urlParams.get('payment_intent');
    const redirectStatus = urlParams.get('redirect_status');

    if (redirectPaymentIntent) {
      window.history.replaceState({}, '', window.location.pathname);

      // Payment explicitly failed on the redirect page
      if (redirectStatus === 'requires_payment_method' || redirectStatus === 'failed') {
        try { sessionStorage.removeItem('checkout_pending'); } catch {}
        this.notificationService.showError(
          'Your payment was not completed. Please try a different payment method.',
          'Payment Failed', 8000
        );
        this.loadCartSummary();
        return;
      }

      if (redirectStatus === 'succeeded' || redirectStatus === 'processing') {
        let pending: any = null;
        try {
          const raw = sessionStorage.getItem('checkout_pending');
          if (raw) { pending = JSON.parse(raw); }
          sessionStorage.removeItem('checkout_pending');
        } catch {}

        if (pending) {
          this.processing = true;
          this.loading = false;

          if (redirectStatus === 'succeeded') {
            // Status confirmed by Stripe redirect — complete order immediately
            this.cartService.checkout({
              cartId: pending.cartId,
              fullName: pending.fullName,
              email: pending.email,
              phone: pending.phone,
              postcode: pending.postcode,
              paymentIntentId: redirectPaymentIntent,
              eventId: pending.eventId
            });
          } else {
            // Still processing — poll before completing
            this.pollPaymentStatus(redirectPaymentIntent, pending.eventId).then(finalStatus => {
              if (finalStatus === 'succeeded') {
                this.cartService.checkout({
                  cartId: pending.cartId,
                  fullName: pending.fullName,
                  email: pending.email,
                  phone: pending.phone,
                  postcode: pending.postcode,
                  paymentIntentId: redirectPaymentIntent,
                  eventId: pending.eventId
                });
              } else if (finalStatus === 'timeout') {
                this.processing = false;
                this.notificationService.showInfo(
                  'Your payment is being processed. You will receive a confirmation email shortly.',
                  'Payment Pending', 0
                );
                this.loadCartSummary();
              } else {
                this.processing = false;
                this.notificationService.showError(
                  'Your payment was not completed. Please try again.',
                  'Payment Failed', 8000
                );
                this.loadCartSummary();
              }
              this.cdr.detectChanges();
            });
          }
          return;
        } else {
          // Session data was lost (tab switch, private browser) but payment was taken.
          // Enter recovery mode: load the cart, skip new payment intent, use existing one.
          this.recoveryPaymentIntentId = redirectPaymentIntent;
          this.notificationService.showInfo(
            'Your payment was received. Please fill in your details below to confirm your order.',
            'Payment Received', 0
          );
          // Fall through to loadCartSummary
        }
      }
    }

    this.loadCartSummary();
  }

  ngOnDestroy(): void {
    if (this.checkoutSubscription) {
      this.checkoutSubscription.unsubscribe();
    }
    if (this.cartStateSubscription) {
      this.cartStateSubscription.unsubscribe();
    }
    if (this.cartDetailsSubscription) {
      this.cartDetailsSubscription.unsubscribe();
    }
  }

  // Load cart summary only
  private loadCartSummary(): void {
    const cartId = this.cartService.getCurrentCartId();
    
    if (!cartId) {
      this.router.navigate(['/cart']);
      return;
    }
    
    this.loading = true;
    this.cartService.getCartDetails(cartId); // This triggers the API call
    this.verifySeatsAvailable(cartId); // warn early if a seat was already sold
  }

  // Checks the backend for seats in this cart that have already been sold. Returns true if
  // all seats are still available. Sets soldSeatsMessage (and stripeError) when some aren't.
  private async verifySeatsAvailable(cartId: string): Promise<boolean> {
    try {
      const sold = await lastValueFrom(this.cartService.checkSoldSeats(cartId));
      if (sold && sold.length) {
        this.soldSeatsMessage = `These seats have already been sold: ${sold.join(', ')}. Please return to your cart and remove them.`;
        this.cdr.detectChanges();
        return false;
      }
      this.soldSeatsMessage = '';
      return true;
    } catch {
      return true; // don't block checkout on a check failure
    }
  }

  // Initialize payment flow - KEPT AS IS but only called when customer info is valid
  private paymentInitInFlight = false;
  private async initializePayment(): Promise<void> {
    // Guard against concurrent re-entry creating duplicate intents before the id is stored.
    if (this.paymentInitInFlight) return;
    this.paymentInitInFlight = true;
    try {
      // Create payment intent (backend reuses this.paymentIntentId when present)
      const paymentIntentResponse = await this.createPaymentIntent(this.cartSummary.total);

      // Load Stripe
      this.stripe = await loadStripe(paymentIntentResponse.publishableKey);
      
      if (!this.stripe) {
        throw new Error('Failed to load Stripe');
      }

      this.clientSecret = paymentIntentResponse.clientSecret;
      this.paymentIntentId = paymentIntentResponse.paymentIntentId;
      
      // Initialize Payment Element
      await this.initializePaymentElement();
      
    } catch (error: any) {
      if (error?.alreadyPaid) {
        // The cart was already paid (e.g. an earlier attempt succeeded) — don't offer payment again.
        this.showPaymentSection = false;
        this.soldSeatsMessage = 'This cart has already been paid. Please check your email for your tickets, or contact support if you have not received them.';
        this.notificationService.showInfo(this.soldSeatsMessage, 'Already Paid', 0);
        this.cdr.detectChanges();
        return;
      }
      this.stripeError = error.message || 'Failed to initialize payment';
      this.cdr.detectChanges();
    } finally {
      this.paymentInitInFlight = false;
    }
  }

  // Initialize Payment Element - KEPT EXACTLY AS IS
  private async initializePaymentElement(): Promise<void> {
    if (!this.stripe || !this.clientSecret) return;
    
    try {
      // Create Elements instance
      this.elements = this.stripe.elements({
        clientSecret: this.clientSecret,
        appearance: {
          theme: 'stripe' as const,
          variables: {
            colorPrimary: '#10b981',
            colorBackground: '#ffffff',
            colorText: '#1f2937',
            colorDanger: '#ef4444'
          }
        }
      });
      
      // Create and mount Payment Element
      this.paymentElement = this.elements.create('payment', {
        layout: { type: 'tabs' },
        defaultValues: {
          billingDetails: {
            name: `${this.customerForm.get('firstName')?.value} ${this.customerForm.get('lastName')?.value}`,
            email: this.customerForm.get('email')?.value,
            phone: this.customerForm.get('phone')?.value
          }
        },
      });
      
      const container = document.getElementById('payment-element-container');
      if (container) {
        this.paymentElement.mount('#payment-element-container');
      }
      
      // Listen for changes
      this.paymentElement.on('change', (event: any) => {
        this.stripeError = event.error?.message || '';
        this.cdr.detectChanges();
      });
      
    } catch (error) {
      this.stripeError = 'Failed to load payment form';
      this.cdr.detectChanges();
    }
  }


  private extendCartSession(){
    // Extend cart session before initializing payment
    const cartId = this.cartSummary.cartId;
    if (cartId) {
      this.cartService.extendCartSession(cartId).subscribe({
        next: (response) => {
          if (!response.success) {
            console.warn('Failed to extend cart session:', response.error);
          }
        },
        error: (error) => {
          console.error('Error extending cart session:', error);
        }
      });
    }
  }
  // Main checkout submission - KEPT EXACTLY AS IS
  async onSubmit(): Promise<void> {
    this.showFormErrors = true;
    this.stripeError = '';
    
    if (this.checkoutForm.invalid) {
      this.markFormGroupTouched(this.checkoutForm);
      this.scrollToFirstError();
      return;
    }
    
    // Recovery mode: payment already taken via redirect, just complete the order
    if (this.recoveryPaymentIntentId) {
      this.processing = true;
      this.cdr.detectChanges();
      await this.processOrder(this.recoveryPaymentIntentId);
      return;
    }

    // Payment already succeeded this session — never re-charge; just (re)complete the
    // idempotent order. This stops the "pay again after 3DS success" double-charge.
    if (this.paidPaymentIntentId) {
      this.processing = true;
      this.cdr.detectChanges();
      await this.processOrder(this.paidPaymentIntentId);
      return;
    }

    if (!this.stripe || !this.elements) {
      this.stripeError = 'Payment form not ready';
      return;
    }
    
    this.processing = true;
    this.cdr.detectChanges();
    
    try {
      this.analytics.trackAddPaymentInfo(this.cartSummary, this.cartSummary.eventId ?? '');
      this.pixel.addPaymentInfo(this.cartSummary.eventId ?? '', this.cartSummary.total);

      // Final availability check right before charging — don't take money for a seat that
      // was just sold to someone else.
      const stillAvailable = await this.verifySeatsAvailable(this.cartSummary.cartId ?? '');
      if (!stillAvailable) {
        this.stripeError = this.soldSeatsMessage;
        this.notificationService.showError(this.soldSeatsMessage, 'Seats Unavailable', 8000);
        this.processing = false;
        this.cdr.detectChanges();
        return;
      }

      const { error: submitError } = await this.elements.submit();
      if (submitError) {
        this.stripeError = submitError.message || 'Payment submission failed';
        this.analytics.trackPaymentError(this.stripeError, this.cartSummary.eventId ?? '');
        this.processing = false;
        this.cdr.detectChanges();
        return;
      }

      // Save customer data before redirect in case Klarna (or similar) redirects the page
      try {
        sessionStorage.setItem('checkout_pending', JSON.stringify({
          cartId: this.cartSummary.cartId,
          eventId: this.cartSummary.eventId,
          fullName: `${this.customerForm.get('firstName')?.value} ${this.customerForm.get('lastName')?.value}`,
          email: this.customerForm.get('email')?.value,
          phone: this.customerForm.get('phone')?.value,
          postcode: this.customerForm.get('postcode')?.value
        }));
      } catch { /* sessionStorage unavailable — redirect recovery will fall back to re-entry mode */ }

      const { error, paymentIntent } = await this.stripe.confirmPayment({
        elements: this.elements,
        clientSecret: this.clientSecret,
        confirmParams: { return_url: `${window.location.origin}/checkout` },
        redirect: 'if_required'
      });

      const resolvedIntentId = paymentIntent?.id || this.paymentIntentId;

      if (error) {
        // confirmPayment can report an error even after the charge went through (e.g. the
        // intent already succeeded via 3DS). Verify with the server before failing so we
        // complete the order instead of prompting a re-charge.
        const verified = await this.checkPaymentStatusNow(resolvedIntentId);
        if (verified === 'succeeded') {
          this.paidPaymentIntentId = resolvedIntentId;
          sessionStorage.removeItem('checkout_pending');
          await this.processOrder(resolvedIntentId);
          return;
        }
        sessionStorage.removeItem('checkout_pending');
        this.stripeError = error.message || 'Payment failed';
        this.analytics.trackPaymentError(this.stripeError, this.cartSummary.eventId ?? '');
        this.processing = false;
        this.cdr.detectChanges();
      } else if (paymentIntent?.status === 'succeeded') {
        this.paidPaymentIntentId = paymentIntent.id;
        sessionStorage.removeItem('checkout_pending');
        await this.processOrder(paymentIntent.id);
      } else if (paymentIntent?.status === 'processing') {
        // Async method (e.g. Klarna) — poll until succeeded rather than assuming it will
        const finalStatus = await this.pollPaymentStatus(paymentIntent.id);
        sessionStorage.removeItem('checkout_pending');
        if (finalStatus === 'succeeded') {
          this.paidPaymentIntentId = paymentIntent.id;
          await this.processOrder(paymentIntent.id);
        } else if (finalStatus === 'timeout') {
          this.stripeError = 'Payment is still processing. You will receive a confirmation email once it completes.';
          this.notificationService.showInfo('Payment is being processed. Check your email for confirmation.', 'Payment Pending', 0);
          this.processing = false;
          this.cdr.detectChanges();
        } else {
          this.stripeError = 'Payment was not completed. Please try again.';
          this.notificationService.showError('Payment failed. Please try a different payment method.', 'Payment Failed', 8000);
          this.processing = false;
          this.cdr.detectChanges();
        }
      } else {
        // Unknown/absent status from confirmPayment — don't assume failure. Verify with the
        // server: the 3DS charge may have actually succeeded (or still be processing).
        const verified = await this.checkPaymentStatusNow(resolvedIntentId);
        if (verified === 'succeeded') {
          this.paidPaymentIntentId = resolvedIntentId;
          sessionStorage.removeItem('checkout_pending');
          await this.processOrder(resolvedIntentId);
          return;
        }
        if (verified === 'processing') {
          const finalStatus = await this.pollPaymentStatus(resolvedIntentId);
          if (finalStatus === 'succeeded') {
            this.paidPaymentIntentId = resolvedIntentId;
            sessionStorage.removeItem('checkout_pending');
            await this.processOrder(resolvedIntentId);
            return;
          }
        }
        sessionStorage.removeItem('checkout_pending');
        this.stripeError = 'Payment not completed';
        this.analytics.trackPaymentError(this.stripeError, this.cartSummary.eventId ?? '');
        this.processing = false;
        this.cdr.detectChanges();
      }

    } catch (error: any) {
      try { sessionStorage.removeItem('checkout_pending'); } catch {}
      this.stripeError = error.message || 'Payment processing failed';
      this.analytics.trackPaymentError(this.stripeError, this.cartSummary.eventId ?? '');
      this.processing = false;
      this.cdr.detectChanges();
    }
  }

  // One-shot Stripe payment status check (server reads the intent from the event's account).
  private async checkPaymentStatusNow(paymentIntentId: string): Promise<string> {
    const eid = this.cartSummary.eventId ?? '';
    if (!paymentIntentId || !eid) return 'unknown';
    try {
      const r = await lastValueFrom(
        this.http.get<{ status: string }>(`${environment.apiUrl}/api/checkout/payment-status/${paymentIntentId}/${eid}`)
      );
      return r.status;
    } catch {
      return 'unknown';
    }
  }

  // Poll Stripe payment status until settled or timeout
  private async pollPaymentStatus(paymentIntentId: string, eventId?: string, intervalMs = 2000, maxAttempts = 15): Promise<string> {
    const resolvedEventId = eventId ?? this.cartSummary.eventId ?? '';
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      await new Promise(resolve => setTimeout(resolve, intervalMs));
      try {
        const response = await lastValueFrom(
          this.http.get<{ status: string }>(
            `${environment.apiUrl}/api/checkout/payment-status/${paymentIntentId}/${resolvedEventId}`
          )
        );
        const status = response.status;
        if (status === 'succeeded') return 'succeeded';
        if (status === 'requires_payment_method' || status === 'canceled') return 'failed';
        // 'processing' — keep polling
      } catch {
        // network hiccup — keep trying
      }
    }
    return 'timeout';
  }

  // Create payment intent - KEPT EXACTLY AS IS
  private async createPaymentIntent(amount: number): Promise<any> {
    var eventId = this.cartSummary.eventId;
    try {

      // Create metadata object
      const metadata: any = {
        cartId: this.cartSummary.cartId,
        eventId: eventId,
        seatCount: this.cartSummary.seatCount.toString(),
        couponCode: this.cartSummary.couponCode,
        couponDiscount: this.cartSummary.couponDiscount.toString(),
        totalDiscount: this.cartSummary.totalDiscount.toString(),
        subtotal: this.cartSummary.subtotal.toString(),
        serviceFee: this.cartSummary.serviceFee.toString(),
        total: this.cartSummary.total.toString()
      };
      
      // Add seat IDs as seat_1, seat_2, etc.
      this.cartSummary.cartItems.forEach((seat, index) => {
        metadata[`seat_${index + 1}_id`] = seat.seatId;
        metadata[`seat_${index + 1}_number`] = seat.seatNumber;
        metadata[`seat_${index + 1}_section`] = seat.section;
        metadata[`seat_${index + 1}_price`] = seat.price.toString();
      });
      
      const response = await lastValueFrom(
        this.http.post<any>(`${environment.apiUrl}/api/checkout/create-payment-intent`, {
          amount: amount,
          currency: 'gbp',
          eventId: eventId,
          cartId: this.cartSummary.cartId,
          // Reuse the intent we already created this session (backend updates it in place).
          paymentIntentId: this.paymentIntentId || null,
          metadata: metadata,
          customer: {
            firstName: this.customerForm.get('firstName')?.value,
            lastName: this.customerForm.get('lastName')?.value,
            email: this.customerForm.get('email')?.value,
            phone: this.customerForm.get('phone')?.value,
            postCode: this.customerForm.get('postcode')?.value
          }
        })
      );
      
      return response;
    } catch (error: any) {
      // Cart already paid (409) — the backend blocked a second charge for this cart.
      if (error?.error?.alreadyPaid) {
        const e: any = new Error(error.error.error || 'This cart has already been paid.');
        e.alreadyPaid = true;
        throw e;
      }
      const message = error.error?.error || error.error?.message || error.message || 'Payment initialization failed';
      throw new Error(message);
    }
  }

  // Process order after successful payment - KEPT EXACTLY AS IS
  private async processOrder(paymentIntentId: string): Promise<void> {
    const cartId = this.cartService.getCurrentCartId();
    if (!cartId) {
      // Payment was taken but cart reference lost
      const message = `Your payment was received but we could not complete the order automatically. Please contact support with reference: ${paymentIntentId}`;
      this.stripeError = message;
      this.notificationService.showError(message, 'Order Error', 0);
      this.processing = false;
      this.cdr.detectChanges();
      return;
    }

    this.cartService.checkout({
      cartId: cartId,
      fullName: `${this.customerForm.get('firstName')?.value} ${this.customerForm.get('lastName')?.value}`,
      email: this.customerForm.get('email')?.value,
      phone: this.customerForm.get('phone')?.value,
      postcode: this.customerForm.get('postcode')?.value,
      paymentIntentId: paymentIntentId,
      eventId: this.cartSummary.eventId ?? ""
    });
  }

  // Form creation - KEPT EXACTLY AS IS
  private createCheckoutForm(): FormGroup {
    return this.fb.group({
      customer: this.fb.group({
        firstName: ['', [Validators.required, Validators.minLength(2)]],
        lastName: ['', [Validators.required, Validators.minLength(2)]],
        email: ['', [Validators.required, Validators.email]],
        confirmEmail: ['', [Validators.required]],
        phone: ['', [Validators.required]],
        postcode: ['', [Validators.required]]
      }, { validators: emailMatchValidator }),
      acceptTerms: [false, Validators.requiredTrue]
    });
  }

  // Helper methods - KEPT EXACTLY AS IS
  get customerForm(): FormGroup {
    return this.checkoutForm.get('customer') as FormGroup;
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else {
        control?.markAsTouched();
      }
    });
  }

  private scrollToFirstError(): void {
    setTimeout(() => {
      const firstError = document.querySelector('.ng-invalid');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  }

  // Price formatting - KEPT EXACTLY AS IS
  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 2
    }).format(price);
  }

  // Navigation - KEPT EXACTLY AS IS
  goBackToCart(): void {
    this.router.navigate(['/cart']);
  }

  continueShopping(): void {
    this.router.navigate(['/events']);
  }

  // Clean up - KEPT EXACTLY AS IS
  formatPostcode(): void {
    const postcodeControl = this.customerForm.get('postcode');
    if (postcodeControl?.value) {
      const value = postcodeControl.value.toUpperCase().replace(/\s/g, '');
      if (value.length > 3) {
        const formatted = value.slice(0, -3) + ' ' + value.slice(-3);
        postcodeControl.setValue(formatted, { emitEvent: false });
      }
    }
  }

   // Apply coupon code - KEPT EXACTLY AS IS
  applyCoupon(): void {
    if (!this.couponCode.trim()) {
      this.notificationService.showError('Please enter a coupon code');
      return;
    }

    if (!this.cartSummary.cartId) {
      this.notificationService.showError('Cart not found');
      return;
    }

    this.couponLoading = true;
    
    // Call service to apply coupon
    this.cartService.applyCoupon(this.cartSummary.cartId, this.couponCode.trim()).subscribe({
      next: (response: CouponResponse) => {
        this.couponLoading = false;
        
        if (response.success) {

          if (response.data && response.data.applied) {
            this.notificationService.showSuccess('Coupon applied successfully!');
            this.analytics.trackCouponApplied(this.couponCode.trim(), response.data.discountAmount ?? 0, this.cartSummary.eventId ?? '');
          }
          else{
            this.notificationService.showError(response.data?.message || 'Failed to apply coupon');
          }

          
          // Refresh cart summary to get updated prices
          this.loadCartSummary();
          
        } else {
          // Show error notification
          this.notificationService.showError(response.error || 'Failed to apply coupon');
          this.couponData = null;
          this.couponApplied = false;
        }
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.couponLoading = false;
        this.notificationService.showError('Failed to apply coupon. Please try again.');
        this.cdr.detectChanges();
      }
    });
  }

  // Remove coupon - KEPT EXACTLY AS IS
  removeCoupon(): void {
    if (!this.cartSummary.cartId) {
      this.notificationService.showError('Cart not found');
      return;
    }

    this.couponLoading = true;
    
    // Call service to remove coupon
    this.cartService.removeCoupon(this.cartSummary.cartId).subscribe({
      next: (response: CouponResponse) => {
        this.couponLoading = false;
        
        if (response.success) {
          this.notificationService.showSuccess('Coupon removed successfully');
          this.analytics.trackCouponRemoved(this.couponCode, this.cartSummary.eventId ?? '');
          this.couponData = null;
          this.couponApplied = false;
          this.couponCode = '';
          this.loadCartSummary();
          
        } else {
          // Show error notification
          this.notificationService.showError(response.error || 'Failed to remove coupon');
        }
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.couponLoading = false;
        this.notificationService.showError('Failed to remove coupon. Please try again.');
        this.cdr.detectChanges();
      }
    });
  }

}