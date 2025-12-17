import { Component, OnInit, OnDestroy, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';

// Stripe imports - IMPORTANT: Don't use ngx-stripe for Payment Element
import { 
  loadStripe,
  Stripe,
  StripeElements,
  StripePaymentElement,
  StripePaymentElementOptions,
  StripeElementsOptionsClientSecret,
  StripeElementLocale,
  Appearance,
  PaymentIntent
} from '@stripe/stripe-js';

// Your existing services
import { environment } from '../../../environments/environment';
import { CartService, CartSummary } from '../../core/services/cart.service';
import { CartItem } from '../../core/models/event.model';
import { OrderService } from '../../core/services/order.service';
import { EmailService } from '../../core/services/email.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule
  ], // Removed NgxStripeModule since we're not using it
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit, OnDestroy, AfterViewInit {
  checkoutForm: FormGroup;
  cartItems: CartItem[] = [];
  cartSummary: CartSummary = { subtotal: 0, serviceFee: 0, total: 0, itemCount: 0 };
  loading: boolean = true;
  processing: boolean = false;
  orderComplete: boolean = false;
  orderId: string = '';
  billingAddressSame: boolean = true;
  showFormErrors: boolean = false;
  
  // Stripe properties
  stripe: Stripe | null = null;
  elements: StripeElements | null = null;
  paymentElement: StripePaymentElement | null = null;
  stripeError: string | null = '';
  paymentElementLoaded: boolean = false; // Track if element is loaded
  
  // Payment intent data
  private clientSecret: string = '';
  private paymentIntentId: string = '';
  
  // For handling return from redirect
  private returnFromRedirect: boolean = false;
  private cartSubscription: any;
  
  // Payment Element appearance
  private appearance: Appearance = {
    theme: 'stripe' as const,
    variables: {
      colorPrimary: '#10b981',
      colorBackground: '#ffffff',
      colorText: '#1f2937',
      colorDanger: '#ef4444',
      fontFamily: 'Inter, system-ui, sans-serif',
      spacingUnit: '4px',
      borderRadius: '8px'
    }
  };

  constructor(
    private fb: FormBuilder,
    private cartService: CartService,
    private orderService: OrderService,
    private emailService: EmailService,
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef // Add ChangeDetectorRef
  ) {
    this.checkoutForm = this.createCheckoutForm();
  }

  async ngOnInit(): Promise<void> {
    console.log('CheckoutComponent ngOnInit');
    
    // Check if we're returning from a redirect
    this.checkReturnFromRedirect();
    
    // Initialize cart subscription
    this.cartSubscription = this.cartService.cart$.subscribe(items => {
      this.cartItems = items;
      this.cartSummary = this.cartService.getCartSummary();
      this.loading = false;
      
      if (items.length === 0 && !this.orderComplete) {
        this.router.navigate(['/cart']);
      }
    });

    this.billingAddressForm.patchValue({
      country: 'GB'
    });
  }

  async ngAfterViewInit(): Promise<void> {
    console.log('CheckoutComponent ngAfterViewInit');
    
    // If returning from redirect, handle payment confirmation
    if (this.returnFromRedirect) {
      setTimeout(() => this.handleReturnFromRedirect(), 500);
    } else {
      // Initialize Stripe and create payment intent
      await this.initializePaymentFlow();
    }
  }

  ngOnDestroy(): void {
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
  }

  // Initialize the complete payment flow
  private async initializePaymentFlow(): Promise<void> {
    try {
      // 1. Load Stripe
      await this.initializeStripe();
      
      // 2. Create payment intent
      const paymentIntentResponse = await this.createPaymentIntent(this.cartSummary.total);
      this.clientSecret = paymentIntentResponse.clientSecret;
      this.paymentIntentId = paymentIntentResponse.paymentIntentId;
      
      // 3. Initialize Payment Element
      await this.initializePaymentElement();
      
    } catch (error: any) {
      console.error('Failed to initialize payment flow:', error);
      this.stripeError = error.message || 'Failed to initialize payment system';
      this.cdr.detectChanges();
    }
  }

  // Initialize Stripe
  private async initializeStripe(): Promise<void> {
    try {
      console.log('Loading Stripe with key:', environment.stripe.publishableKey.substring(0, 20) + '...');
      
      this.stripe = await loadStripe(environment.stripe.publishableKey, {
        //betas: ['payment_element_beta_1'] // Optional: Enable beta features
      });
      
      if (!this.stripe) {
        throw new Error('Failed to load Stripe');
      }
      
      console.log('✅ Stripe loaded successfully');
      
    } catch (error) {
      console.error('❌ Failed to initialize Stripe:', error);
      throw error;
    }
  }

  // Initialize Payment Element
  private async initializePaymentElement(): Promise<void> {
    if (!this.stripe || !this.clientSecret) {
      console.error('Cannot initialize Payment Element: Stripe or client secret missing');
      return;
    }
    
    try {
      console.log('Initializing Payment Element with client secret');
      
      console.log('this.clientSecret' + this.clientSecret);
      
      // Create Elements instance
      const elementsOptions: StripeElementsOptionsClientSecret = {
        clientSecret: this.clientSecret,
        appearance: this.appearance,
        locale: 'en' as StripeElementLocale
      };
      
      this.elements = this.stripe.elements(elementsOptions);
      
      // Create Payment Element
      const paymentElementOptions: StripePaymentElementOptions = {
        layout: {
          type: 'tabs',
          defaultCollapsed: false,
          radios: true,
          spacedAccordionItems: false
        },
        defaultValues: {
          billingDetails: {
            name: `${this.customerForm.get('firstName')?.value} ${this.customerForm.get('lastName')?.value}`,
            email: this.customerForm.get('email')?.value,
            phone: this.customerForm.get('phone')?.value,
            address: {
              line1: this.billingAddressForm.get('addressLine1')?.value,
              line2: this.billingAddressForm.get('addressLine2')?.value,
              city: this.billingAddressForm.get('city')?.value,
              state: this.billingAddressForm.get('county')?.value,
              postal_code: this.billingAddressForm.get('postcode')?.value,
              country: this.billingAddressForm.get('country')?.value,
            }
          }
        },
        fields: {
          billingDetails: {
            name: 'never',
            email: 'never',
            phone: 'auto',
            address: 'auto'
          }
        },
        wallets: {
          applePay: 'never',
          googlePay: 'never'
        }
      };
      
      this.paymentElement = this.elements.create('payment', paymentElementOptions);
      // Mount the Payment Element
      await this.mountPaymentElement();
      
    } catch (error) {
      console.error('❌ Failed to initialize Payment Element:', error);
      throw error;
    }
  }

  // Mount Payment Element with retry logic
  private async mountPaymentElement(retryCount: number = 0): Promise<void> {
    const maxRetries = 3;
    
    try {
      const container = document.getElementById('payment-element-container');
      
      if (!container) {
        console.warn('Payment element container not found, retrying...');
        
        if (retryCount < maxRetries) {
          setTimeout(() => this.mountPaymentElement(retryCount + 1), 500);
          return;
        } else {
          throw new Error('Payment element container not found after retries');
        }
      }
      
      console.log('Mounting Payment Element to container:', container);
      
      // Clear any existing content
      container.innerHTML = '';
      
      // Mount the element
      this.paymentElement!.mount('#payment-element-container');
      
      // Wait for element to be ready
      await new Promise<void>((resolve) => {
        this.paymentElement!.on('ready', () => {
          console.log('✅ Payment Element is ready and mounted');
          this.paymentElementLoaded = true;
          this.cdr.detectChanges(); // Update view
          resolve();
        });
      });
      
      // Listen for changes
      this.paymentElement!.on('change', (event: any) => {
        console.log('Payment Element changed:', event);
        if (event.error) {
          this.stripeError = event.error.message;
        } else {
          this.stripeError = null;
        }
        this.cdr.detectChanges();
      });
      
      // Log element info
      console.log('Payment Element mounted successfully');
      this.debugElementState();
      
    } catch (error) {
      console.error('Failed to mount Payment Element:', error);
      
      if (retryCount < maxRetries) {
        console.log(`Retrying mount (attempt ${retryCount + 1}/${maxRetries})...`);
        setTimeout(() => this.mountPaymentElement(retryCount + 1), 1000);
      } else {
        this.stripeError = 'Failed to load payment form. Please refresh the page.';
        this.cdr.detectChanges();
      }
    }
  }

  // Debug: Check element state
  private debugElementState(): void {
    console.log('=== DEBUG PAYMENT ELEMENT ===');
    console.log('Stripe loaded:', !!this.stripe);
    console.log('Elements created:', !!this.elements);
    console.log('Payment Element created:', !!this.paymentElement);
    console.log('Client secret:', this.clientSecret ? 'Set' : 'Not set');
    
    // Check container
    const container = document.getElementById('payment-element-container');
    console.log('Container found:', !!container);
    if (container) {
      console.log('Container children:', container.children.length);
      console.log('Container innerHTML length:', container.innerHTML.length);
    }
    
    // Check for Stripe iframes
    const iframes = document.querySelectorAll('#payment-element-container iframe');
    console.log('Iframes in container:', iframes.length);
    
    console.log('=== END DEBUG ===');
  }

  private checkReturnFromRedirect(): void {
    this.route.queryParams.subscribe(params => {
      if (params['payment_intent'] && params['payment_intent_client_secret']) {
        this.returnFromRedirect = true;
        console.log('Returning from payment redirect');
      }
    });
  }

  private async handleReturnFromRedirect(): Promise<void> {
    const paymentIntentId = this.route.snapshot.queryParams['payment_intent'];
    const clientSecret = this.route.snapshot.queryParams['payment_intent_client_secret'];
    
    if (!paymentIntentId || !clientSecret) {
      return;
    }
    
    this.processing = true;
    this.cdr.detectChanges();
    
    try {
      // Initialize Stripe first
      await this.initializeStripe();
      
      if (!this.stripe) {
        throw new Error('Stripe not loaded');
      }
      
      // Retrieve the payment intent
      const { paymentIntent, error } = await this.stripe.retrievePaymentIntent(clientSecret);
      
      if (error) {
        this.stripeError = error.message || 'Failed to retrieve payment intent after redirect.';
      } else if (paymentIntent) {
        await this.handlePaymentIntentStatus(paymentIntent);
      }
    } catch (error: any) {
      console.error('Error handling redirect return:', error);
      this.stripeError = 'Failed to complete payment after redirect.';
    } finally {
      this.processing = false;
      this.cdr.detectChanges();
      // Clear URL parameters
      this.router.navigate([], { 
        queryParams: {}, 
        replaceUrl: true 
      });
    }
  }

  private async handlePaymentIntentStatus(paymentIntent: PaymentIntent): Promise<void> {
    switch (paymentIntent.status) {
      case 'succeeded':
        await this.processOrder(paymentIntent.id);
        break;
      case 'processing':
        this.stripeError = 'Your payment is processing. We\'ll notify you when it\'s complete.';
        break;
      case 'requires_payment_method':
        this.stripeError = 'Payment failed. Please try another payment method.';
        break;
      default:
        this.stripeError = `Payment status: ${paymentIntent.status}`;
    }
    this.cdr.detectChanges();
  }

  // Main checkout submission
  async onSubmit(): Promise<void> {
    this.showFormErrors = true;
    this.stripeError = null;
    
    if (this.checkoutForm.invalid) {
      this.markFormGroupTouched(this.checkoutForm);
      this.scrollToFirstError();
      return;
    }
    
    if (!this.stripe || !this.elements || !this.paymentElementLoaded) {
      this.stripeError = 'Payment form not ready. Please wait or refresh the page.';
      return;
    }
    
    this.processing = true;
    this.cdr.detectChanges();
    
    try {
      // 1. Submit the Elements form for validation
      const { error: submitError } = await this.elements.submit();
      if (submitError) {
        this.stripeError = submitError.message || 'Payment submission failed. Please check your details.';
        this.processing = false;
        this.cdr.detectChanges();
        return;
      }
      
      // 2. Prepare billing details
      const billingDetails = {
        name: `${this.customerForm.get('firstName')?.value} ${this.customerForm.get('lastName')?.value}`,
        email: this.customerForm.get('email')?.value,
        phone: this.customerForm.get('phone')?.value,
        address: {
          line1: this.billingAddressForm.get('addressLine1')?.value,
          line2: this.billingAddressForm.get('addressLine2')?.value,
          city: this.billingAddressForm.get('city')?.value,
          state: this.billingAddressForm.get('county')?.value,
          postal_code: this.billingAddressForm.get('postcode')?.value,
          country: this.billingAddressForm.get('country')?.value,
        }
      };
      
      // 3. Confirm the payment
      const { error, paymentIntent } = await this.stripe.confirmPayment({
        elements: this.elements,
        clientSecret: this.clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/checkout?payment_intent=${this.paymentIntentId}&payment_intent_client_secret=${this.clientSecret}`,
          payment_method_data: {
            billing_details: billingDetails
          }
        },
        redirect: 'if_required'
      });
      
      // 4. Handle the result
      if (error) {
        this.stripeError = error.message || 'Payment confirmation failed. Please try again.';
        this.processing = false;
        this.cdr.detectChanges();
      } else if (paymentIntent) {
        await this.handlePaymentIntentStatus(paymentIntent);
      } else {
        this.stripeError = 'Unexpected payment response';
        this.processing = false;
        this.cdr.detectChanges();
      }
      
    } catch (error: any) {
      console.error('Payment error:', error);
      this.stripeError = error.message || 'Payment processing failed. Please try again.';
      this.processing = false;
      this.cdr.detectChanges();
    }
  }

  // Create payment intent
  private async createPaymentIntent(amount: number): Promise<any> {
    try {
      const response = await lastValueFrom(
        this.http.post<any>(`${environment.apiUrl}/api/orders/create-payment-intent`, {
          amount: amount,
          currency: 'gbp',
          customer: this.customerForm.value,
          billing_address: this.billingAddressForm.value
        })
      );
      
      console.log('Payment intent created:', response);
      return response;
      
    } catch (error: any) {
      console.error('Failed to create payment intent:', error);
      throw new Error('Payment initialization failed: ' + (error.message || 'Unknown error'));
    }
  }

  // Process order after successful payment
  private async processOrder(paymentIntentId: string): Promise<void> {
    try {
      const formValue = this.checkoutForm.value;
      const order = await lastValueFrom(
        this.orderService.createOrder(
          this.cartItems,
          formValue.customer,
          {
            paymentMethod: 'stripe',
            stripePaymentIntentId: paymentIntentId,
            cardHolder: `${formValue.customer.firstName} ${formValue.customer.lastName}`
          },
          this.cartSummary.total
        )
      );
      
      await lastValueFrom(this.emailService.sendOrderConfirmation(order, []));
      
      setTimeout(() => {
        this.orderComplete = true;
      this.orderId = order.id;
      this.cdr.detectChanges();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });

        // this.cartService.clearCart();
        this.router.navigate(['/confirmation', 'test'+order.id]);
      },5000);
      //this.cartService.clearCart();
      
      // Navigate to confirmation after a short delay
      setTimeout(() => {
        // this.cartService.clearCart();
        this.router.navigate(['/confirmation', 'test'+order.id]);
      },10000);
      
    } catch (error) {
      console.error('Order creation failed:', error);
      throw error;
    }
  }

  // Debug method to manually reload payment element
  reloadPaymentElement(): void {
    console.log('Manually reloading Payment Element...');
    this.paymentElementLoaded = false;
    this.stripeError = null;
    this.cdr.detectChanges();
    
    setTimeout(async () => {
      try {
        await this.initializePaymentElement();
      } catch (error) {
        console.error('Failed to reload payment element:', error);
        this.stripeError = 'Failed to reload payment form';
        this.cdr.detectChanges();
      }
    }, 100);
  }

  // Check if Payment Element is loading
  get isPaymentElementLoading(): boolean {
    return !this.paymentElementLoaded && !this.stripeError;
  }

  // Your existing helper methods...
  createCheckoutForm(): FormGroup {
    return this.fb.group({
      customer: this.fb.group({
        firstName: ['', [Validators.required, Validators.minLength(2), Validators.pattern(/^[a-zA-Z\s'-]+$/)]],
        lastName: ['', [Validators.required, Validators.minLength(2), Validators.pattern(/^[a-zA-Z\s'-]+$/)]],
        email: ['', [Validators.required, Validators.email]],
        phone: ['', [
          Validators.required, 
          Validators.pattern(/^(\+44\s?7\d{3}|\(?07\d{3}\)?)\s?\d{3}\s?\d{3}$|^(\+44\s?2\d|\(?02\d\)?)\s?\d{4}\s?\d{4}$/)
        ]]
      }),
      billingAddress: this.fb.group({
        addressLine1: ['', [Validators.required, Validators.minLength(3)]],
        addressLine2: [''],
        city: ['', [Validators.required, Validators.minLength(2)]],
        county: [''],
        postcode: ['', [
          Validators.required,
          Validators.pattern(/^([A-Z][A-HJ-Y]?\d[A-Z\d]? ?\d[A-Z]{2}|GIR ?0A{2})$/)
        ]],
        country: ['', Validators.required]
      }),
      acceptTerms: [false, Validators.requiredTrue]
    });
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else {
        control?.markAsTouched();
      }
    });
  }

  private scrollToFirstError(): void {
    setTimeout(() => {
      const firstError = document.querySelector('.invalid');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  }

  get customerForm(): FormGroup {
    return this.checkoutForm.get('customer') as FormGroup;
  }

  get billingAddressForm(): FormGroup {
    return this.checkoutForm.get('billingAddress') as FormGroup;
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-UK', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 2
    }).format(price);
  }

  toggleBillingAddress(): void {
    this.billingAddressSame = !this.billingAddressSame;
    
    if (this.billingAddressSame) {
      this.billingAddressForm.patchValue({
        addressLine1: '',
        addressLine2: '',
        city: '',
        county: '',
        postcode: '',
        country: 'GB'
      });
    }
  }

  goBackToCart(): void {
    this.router.navigate(['/cart']);
  }

  continueShopping(): void {
    this.router.navigate(['/events']);
  }

  viewOrderConfirmation(): void {
    if (this.orderId) {
      this.router.navigate(['/confirmation', this.orderId]);
    }
  }


  formatPostcode(): void {
    const postcodeControl = this.billingAddressForm.get('postcode');
    if (postcodeControl?.value) {
      // Remove all spaces and convert to uppercase
      let value = postcodeControl.value.toUpperCase().replace(/\s/g, '');
      
      // Add space before last 3 characters (for UK postcode format)
      if (value.length > 3) {
        value = value.substring(0, value.length - 3) + ' ' + value.substring(value.length - 3);
      }
      
      postcodeControl.setValue(value, { emitEvent: false });
    }
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-UK', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  }

  getSeatInfo(item: CartItem): { section: string, row: string, seatNumber: number } {
    if (item.seat) {
      return {
        section: item.seat.section || 'General',
        row: item.seat.row || 'GA',
        seatNumber: item.seat.number || 0
      };
    }
    return { section: 'General', row: 'GA', seatNumber: 0 };
  }

  getEventInfo(item: CartItem): { title: string, date: Date, venue: string } {
    if (item.seat) {
      return {
        title: item.seat.eventTitle || 'Event',
        date: item.seat.eventDate || new Date(),
        venue: item.seat.venue || 'Venue'
      };
    }
    if (item.ticketType) {
      return {
        title: item.ticketType.eventTitle || 'Event',
        date: item.ticketType.eventDate || new Date(),
        venue: item.ticketType.venue || 'Venue'
      };
    }
    return { title: 'Event', date: new Date(), venue: 'Venue' };
  }

  getGroupedEvents(): any[] {
    const eventMap = new Map();
    
    this.cartItems.forEach(item => {
      const eventInfo = this.getEventInfo(item);
      
      if (!eventMap.has(eventInfo.title)) {
        eventMap.set(eventInfo.title, {
          title: eventInfo.title,
          date: eventInfo.date,
          venue: eventInfo.venue,
          items: []
        });
      }
      eventMap.get(eventInfo.title).items.push(item);
    });
    
    return Array.from(eventMap.values());
  }




  get paymentForm(): FormGroup {
    return this.checkoutForm.get('payment') as FormGroup;
  }
}