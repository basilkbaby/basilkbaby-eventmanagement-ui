import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { 
  AddToCartRequest, 
  CartDetailsResponse, 
  CartItemDto, 
  CartSummaryDto, 
  CheckoutRequest, 
  CheckoutResponse, 
  OrderConfirmationResponse,
} from '../models/DTOs/cart.DTO.model';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private currentCartId?: string;
  private currentEventId?: string;
  private baseUrl = environment.apiUrl + '/api';

  // Subject for API responses only
  private cartDetailsSubject = new Subject<CartDetailsResponse>();
  cartDetails$ = this.cartDetailsSubject.asObservable();
  
  private checkoutSubject = new Subject<CheckoutResponse>();
  checkout$ = this.checkoutSubject.asObservable();
  
  private orderConfirmationSubject = new Subject<OrderConfirmationResponse>();
  orderConfirmation$ = this.orderConfirmationSubject.asObservable();

  // Subject to emit current cart state for components
  private currentCartStateSubject = new BehaviorSubject<{
    items: CartItemDto[],
    summary: CartSummaryDto
  }>({
    items: [],
    summary: this.getEmptyCartSummary()
  });
  currentCartState$ = this.currentCartStateSubject.asObservable();

  constructor(private http: HttpClient, private router : Router) {
    this.loadCartIdFromStorage();
  }

  // Add seats to cart via API
  addToCart(eventId: string, seatIds: string[]): void {
    const sessionId = this.getOrCreateSessionId();
    const request: AddToCartRequest = { eventId, seatIds, sessionId };
    
    this.http.post<CartDetailsResponse>(`${this.baseUrl}/cart`, request)
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.currentCartId = response.data.cartId;
            this.currentEventId = response.data.eventId;
            this.saveCartIdToStorage();
            this.updateCartState(response.data);
          }
          this.cartDetailsSubject.next(response);
          this.router.navigate(['/cart']);
        },
        error: (error) => {
          console.error('API Error:', error);
          this.cartDetailsSubject.next({ 
            success: false, 
            error: error.message,
            data: undefined 
          });
        }
      });
  }

  // Get cart details from API
  getCartDetails(cartId?: string): void {
    const idToUse = cartId || this.currentCartId;
    if (!idToUse) {
      this.cartDetailsSubject.next({ 
        success: false, 
        error: 'No cart ID available',
        data: undefined 
      });
      this.updateCartStateWithError();
      return;
    }
    
    this.http.get<CartDetailsResponse>(`${this.baseUrl}/cart/${idToUse}`)
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.currentCartId = response.data.cartId;
            this.currentEventId = response.data.eventId;
            this.updateCartState(response.data);
          } else {
            this.updateCartStateWithError();
          }
          this.cartDetailsSubject.next(response);
        },
        error: (error) => {
          console.error('Error getting cart details:', error);
          this.cartDetailsSubject.next({ 
            success: false, 
            error: error.message,
            data: undefined 
          });
          this.updateCartStateWithError();
        }
      });
  }

  // Remove seat via API
  removeCartItem(cartItemId : string): void {
    const currentCartId = this.currentCartId;
    if (!currentCartId) {
      console.error('No cart ID available');
      return;
    }
    
    this.http.delete<CartDetailsResponse>(`${this.baseUrl}/cart/remove/${currentCartId}/${cartItemId}`)
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.updateCartState(response.data);
          }
          this.cartDetailsSubject.next(response);
        },
        error: (error) => {
          console.error('Error removing seat:', error);
          this.cartDetailsSubject.next({ 
            success: false, 
            error: error.message,
            data: undefined 
          });
        }
      });
  }

  // Clear cart via API
  clearCart(): void {
    const cartId = this.currentCartId;
    if (!cartId) {
      console.error('No cart ID available');
      return;
    }
    
    this.http.delete<CartDetailsResponse>(`${this.baseUrl}/cart/clear/${cartId}`)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.clearLocalCartData();
          }
          this.cartDetailsSubject.next(response);
        },
        error: (error) => {
          console.error('Error clearing cart:', error);
          this.cartDetailsSubject.next({ 
            success: false, 
            error: error.message,
            data: undefined 
          });
        }
      });
  }

  // Complete checkout
  checkout(checkoutData: CheckoutRequest): void {
    this.http.post<CheckoutResponse>(`${this.baseUrl}/checkout/complete`, checkoutData)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.clearLocalCartData();
          }
          this.checkoutSubject.next(response);
        },
        error: (error) => {
          console.error('Checkout error:', error);
          this.checkoutSubject.next({ 
            success: false, 
            error: error.message,
            data: undefined 
          });
        }
      });
  }

  // Get order confirmation
  getOrderConfirmation(orderId: string): void {
    this.http.get<OrderConfirmationResponse>(`${this.baseUrl}/checkout/orders/${orderId}`)
      .subscribe({
        next: (response) => {
          this.orderConfirmationSubject.next(response);
        },
        error: (error) => {
          console.error('Error getting order confirmation:', error);
          this.orderConfirmationSubject.next({ 
            success: false, 
            error: error.message,
            data: undefined 
          });
        }
      });
  }

  // Helper methods for components
  getCurrentCartId(): string | undefined {
    return this.currentCartId;
  }

  getCurrentEventId(): string | undefined {
    return this.currentEventId;
  }

  // Private helper methods
  private updateCartState(data: any): void {
    const items = (data.cartItems || []).map((seat: any) => ({
      cartItemId : seat.cartItemId,
      seatId: seat.seatId,
      seatNumber: seat.seatNumber,
      sectionName: seat.section,
      price: seat.price,
      quantity: seat.quantity || 1,
      eventId: data.eventId,
      eventName: '', // Add if available
      venueName: ''  // Add if available
    }));

    const summary: CartSummaryDto = {
      cartId: data.cartId || '',
      eventId: data.eventId || '',
      subtotal: data.subtotal || 0,
      serviceFee: data.serviceFee || 0,
      total: data.total|| 0,
      totalDiscount : data.totalDiscount || 0,
      seatCount: data.seatCount || items.length,
      seats: data.seats || []
    };

    this.currentCartStateSubject.next({ items, summary });
  }

  private updateCartStateWithError(): void {
    this.currentCartStateSubject.next({
      items: [],
      summary: this.getEmptyCartSummary()
    });
  }

  private getEmptyCartSummary(): CartSummaryDto {
    return { 
      cartId: '', 
      eventId: '', 
      subtotal: 0, 
      serviceFee: 0, 
      total: 0, 
      totalDiscount :0,
      seatCount: 0, 
      seats: [] 
    };
  }

  private getOrCreateSessionId(): string {
    let sessionId = localStorage.getItem('cart_session');
    if (!sessionId) {
      sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('cart_session', sessionId);
    }
    return sessionId;
  }

  private saveCartIdToStorage(): void {
    if (this.currentCartId) {
      localStorage.setItem('current_cart_id', this.currentCartId);
    }
    if (this.currentEventId) {
      localStorage.setItem('current_event_id', this.currentEventId);
    }
  }

  private loadCartIdFromStorage(): void {
    try {
      this.currentCartId = localStorage.getItem('current_cart_id') || undefined;
      this.currentEventId = localStorage.getItem('current_event_id') || undefined;
    } catch (error) {
      console.error('Error loading cart ID from storage:', error);
    }
  }

  private clearLocalCartData(): void {
    this.currentCartId = undefined;
    this.currentEventId = undefined;
    localStorage.removeItem('current_cart_id');
    localStorage.removeItem('current_event_id');
    this.updateCartStateWithError();
  }
}