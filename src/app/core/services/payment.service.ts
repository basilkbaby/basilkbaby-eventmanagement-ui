import { Injectable } from '@angular/core';
import { loadStripe, Stripe, StripeElements, StripeCardElement } from '@stripe/stripe-js';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private stripe: Stripe | null = null;
  private elements: StripeElements | null = null;
  private cardElement: StripeCardElement | null = null;

  constructor() {}

  async initialize(): Promise<boolean> {
    try {
      return !!this.stripe;
    } catch (error) {
      console.error('Failed to initialize Stripe:', error);
      return false;
    }
  }

  async createPaymentElement(containerId: string): Promise<void> {
    if (!this.stripe) {
      await this.initialize();
    }

    if (this.stripe && !this.elements) {
      this.elements = this.stripe.elements({
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#10b981',
            colorBackground: '#ffffff',
            colorText: '#1f2937',
            fontFamily: 'Inter, system-ui, sans-serif',
          }
        }
      });

      // Create and mount the Payment Element
      const paymentElement = this.elements.create('payment');
      paymentElement.mount(`#${containerId}`);
    }
  }

  async createCardElement(containerId: string): Promise<void> {
    if (!this.stripe) {
      await this.initialize();
    }

    if (this.stripe && !this.elements) {
      this.elements = this.stripe.elements({
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#10b981',
            colorBackground: '#ffffff',
            colorText: '#1f2937',
            fontFamily: 'Inter, system-ui, sans-serif',
          }
        }
      });

      // Create and mount the Card Element
      this.cardElement = this.elements.create('card', {
        hidePostalCode: true,
        style: {
          base: {
            fontSize: '16px',
            color: '#1f2937',
            '::placeholder': {
              color: '#9ca3af'
            }
          }
        }
      });
      
      this.cardElement.mount(`#${containerId}`);
    }
  }

  async createPaymentIntent(amount: number, currency: string = 'gbp'): Promise<{ clientSecret: string; paymentIntentId: string }> {
    const response = await fetch(`${environment.apiUrl}/api/orders/create-payment-intent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount, currency })
    });

    if (!response.ok) {
      throw new Error('Failed to create payment intent');
    }

    return await response.json();
  }

  async confirmCardPayment(clientSecret: string): Promise<{ paymentIntent?: any; error?: any }> {
    if (!this.stripe || !this.cardElement) {
      throw new Error('Stripe not initialized');
    }

    const { paymentIntent, error } = await this.stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: this.cardElement,
      }
    });

    return { paymentIntent, error };
  }

  async confirmPayment(clientSecret: string): Promise<{ paymentIntent?: any; error?: any }> {
    if (!this.stripe || !this.elements) {
      throw new Error('Stripe not initialized');
    }

    const { error, paymentIntent } = await this.stripe.confirmPayment({
      elements: this.elements,
      clientSecret,
      confirmParams: {
        return_url: `${window.location.origin}/confirmation`,
      },
      redirect: 'if_required'
    });

    return { paymentIntent, error };
  }
}