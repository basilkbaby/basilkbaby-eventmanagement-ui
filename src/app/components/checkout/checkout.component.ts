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
    couponDiscount: 0
  };
  loading: boolean = true;
  processing: boolean = false;
  orderComplete: boolean = false;
  orderId: string = '';
  showFormErrors: boolean = false;
  
  // Stripe properties
  stripe: Stripe | null = null;
  elements: StripeElements | null = null;
  paymentElement: StripePaymentElement | null = null;
  stripeError: string = '';
  
  // Payment intent data
  private clientSecret: string = '';
  private paymentIntentId: string = '';
  
  private checkoutSubscription: Subscription | undefined;
  private cartStateSubscription: Subscription | undefined;
  private cartDetailsSubscription: Subscription | undefined;

   // Coupon properties
  couponCode: string = '';
  couponApplied: boolean = false;
  couponLoading: boolean = false;
  couponError: string = '';
  couponData: CouponData | null = null;
  
  // Add this ONE property
  showPaymentSection: boolean = false;
  
  constructor(
    private fb: FormBuilder,
    private cartService: CartService,
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private notificationService: NotificationService
  ) {
    this.checkoutForm = this.createCheckoutForm();
    
    // Add this ONE listener
    this.checkoutForm.get('customer')?.statusChanges.subscribe(status => {
      if (status === 'VALID' && !this.showPaymentSection && this.cartSummary.seatCount > 0) {
        this.showPaymentSection = true;
        this.cdr.detectChanges();
        //this.extendCartSession();
        // Initialize payment only when customer info is valid
        setTimeout(() => {
          this.initializePayment();
        }, 100);
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
          this.stripeError = response.error || 'Failed to load cart';
          this.cdr.detectChanges();
          
        }
      },
      error: () => {
        this.loading = false;
        this.stripeError = 'Error loading cart';
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
          
          // Navigate to confirmation page
          setTimeout(() => {
            this.router.navigate(['/confirmation', response.data!.orderId]);
          }, 2000);
        } else {
          this.stripeError = response.error || 'Checkout failed';
          this.cdr.detectChanges();
        }
      },
      error: () => {
        this.processing = false;
        this.stripeError = 'Checkout processing failed';
        this.cdr.detectChanges();
      }
    });

    // Load cart summary only
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
  }

  // Initialize payment flow - KEPT AS IS but only called when customer info is valid
  private async initializePayment(): Promise<void> {
    try {
      // Create payment intent
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
      this.stripeError = error.message || 'Failed to initialize payment';
      this.cdr.detectChanges();
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
    
    if (!this.stripe || !this.elements) {
      this.stripeError = 'Payment form not ready';
      return;
    }
    
    this.processing = true;
    this.cdr.detectChanges();
    
    try {
      // Submit the Elements form
      const { error: submitError } = await this.elements.submit();
      if (submitError) {
        this.stripeError = submitError.message || 'Payment submission failed';
        this.processing = false;
        this.cdr.detectChanges();
        return;
      }
      
      // Confirm the payment
      const { error, paymentIntent } = await this.stripe.confirmPayment({
        elements: this.elements,
        clientSecret: this.clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/checkout`,
        },
        redirect: 'if_required'
      });
      
      // Handle the result
      if (error) {
        this.stripeError = error.message || 'Payment failed';
        this.processing = false;
        this.cdr.detectChanges();
      } else if (paymentIntent?.status === 'succeeded') {
        await this.processOrder(paymentIntent.id);
      } else {
        this.stripeError = 'Payment not completed';
        this.processing = false;
        this.cdr.detectChanges();
      }
      
    } catch (error: any) {
      this.stripeError = error.message || 'Payment processing failed';
      this.processing = false;
      this.cdr.detectChanges();
    }
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
          amount: amount, // Convert to pence/cents
          currency: 'gbp',
          eventId: eventId,
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
      throw new Error('Payment initialization failed');
    }
  }

  // Process order after successful payment - KEPT EXACTLY AS IS
  private async processOrder(paymentIntentId: string): Promise<void> {
    const cartId = this.cartService.getCurrentCartId();
    if (!cartId) {
      this.stripeError = 'Cart ID not found';
      this.processing = false;
      this.cdr.detectChanges();
      return;
    }

    // Call CartService checkout with form data
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
          // Show success notification
          this.notificationService.showSuccess('Coupon removed successfully');
          
          // Clear coupon data
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