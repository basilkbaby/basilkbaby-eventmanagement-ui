import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { CartItem } from '../models/event.model';
import { CartService } from './cart.service';
import { CustomerInfo, Order, OrderItem, PaymentInfo, Ticket } from '../models/order.model';
import { environment } from '../../../environments/environment';


interface ValidateCouponRequest {
  code: string;
  ticketQuantity: number;
  ticketPrice: number;
  cartTotal: number;
}

interface ValidateCouponResponse {
  discount: number;
  finalPrice: number;
}

interface CreatePaymentIntentRequest {
  amount: number;
  currency?: string;
  orderId?: string;
  metadata?: any;
}

interface CreatePaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
}

interface ConfirmPaymentRequest {
  paymentIntentId: string;
  orderId: string;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private orders: Order[] = [];
  private ordersSubject = new BehaviorSubject<Order[]>([]);
  private tickets: Ticket[] = [];
  
  // API endpoints from your backend
  private apiUrl = environment.apiUrl + '/api/orders';
  
  // Store orders in localStorage for offline access (optional cache)
  private storageKey = 'event_ticketing_orders';
  private ticketsKey = 'event_ticketing_tickets';

  orders$ = this.ordersSubject.asObservable();

  constructor(
    private http: HttpClient,
    private cartService: CartService
  ) {
    this.loadOrdersFromStorage();
  }

  // Get order by ID from backend
  getOrder(orderId: string): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/${orderId}`).pipe(
      tap(order => {
        // Cache the order locally
        const index = this.orders.findIndex(o => o.orderId === orderId);
        if (index >= 0) {
          this.orders[index] = order;
        } else {
          this.orders.push(order);
        }
        this.saveOrdersToStorage();
      }),
      catchError(error => {
        console.error('Error fetching order:', error);
        // Fallback to local cache if offline
        const cachedOrder = this.orders.find(o => o.orderId === orderId);
        if (cachedOrder) {
          return of(cachedOrder);
        }
        throw error;
      })
    );
  }

  // Lookup order by reference and last name
lookupOrder(orderNumber: string, lastName: string, email?: string): Observable<Order> {
  const lookupRequest = {
    orderNumber: orderNumber,
    lastName: lastName,
    email: email || ''
  };

  return this.http.post<any>(`${this.apiUrl}/lookup`, lookupRequest).pipe(
    map(response => {
      if (response) {
        return response;
      } else {
        throw new Error('Order not found.');
      }
    }),
    catchError(error => {
      console.error('Error looking up order:', error);
      
      if (error.status === 404) {
        throw new Error('Order not found. Please check your order number and last name.');
      } else if (error.status === 400) {
        throw new Error('Please provide both order number and last name.');
      } else {
        throw new Error('Unable to retrieve order. Please try again later.');
      }
    })
  );
}


  // Get tickets by order ID
  getTicketsByOrder(orderId: string): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(`${this.apiUrl}/${orderId}/tickets`).pipe(
      tap(tickets => {
        // Cache tickets locally
        this.tickets = this.tickets.filter(t => t.orderId !== orderId);
        this.tickets.push(...tickets);
        this.saveTicketsToStorage();
      }),
      catchError(error => {
        console.error('Error fetching tickets:', error);
        // Fallback to local cache
        const cachedTickets = this.tickets.filter(t => t.orderId === orderId);
        return of(cachedTickets);
      })
    );
  }

  // Get ticket by ID
  getTicket(ticketId: string): Observable<Ticket> {
    const ticket = this.tickets.find(t => t.id === ticketId);
    
    if (ticket) {
      return of(ticket);
    }

    // If not in cache, would need backend endpoint
    throw new Error('Ticket not found');
  }

  // Validate ticket (for scanning at entrance)
  validateTicket(qrCode: string): Observable<{ valid: boolean; ticket?: Ticket; message?: string }> {
    try {
      const data = JSON.parse(qrCode);
      const ticket = this.tickets.find(t => t.id === data.ticketId);
      
      if (!ticket) {
        return of({ valid: false, message: 'Ticket not found' });
      }

      if (ticket.status !== 'valid') {
        return of({ 
          valid: false, 
          message: ticket.status === 'used' ? 'Ticket already used' : 'Ticket invalid'
        });
      }

      if (new Date() > new Date(ticket.validUntil)) {
        return of({ valid: false, message: 'Ticket expired' });
      }

      return of({ valid: true, ticket });
    } catch (error) {
      return of({ valid: false, message: 'Invalid QR code' });
    }
  }

  // Mark ticket as used
  markTicketUsed(ticketId: string): Observable<boolean> {
    const ticket = this.tickets.find(t => t.id === ticketId);
    
    if (ticket && ticket.status === 'valid') {
      ticket.status = 'used';
      this.saveTicketsToStorage();
      return of(true);
    }
    
    return of(false);
  }


    // Get tickets by order ID
  resendConfirmation(orderId: string): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(`${this.apiUrl}/${orderId}/resend`).pipe(
      tap(tickets => {
        console.log('Resent confirmation success');
      })
    );
  }
  // Payment Gateway Integration

  // Create payment intent with Stripe
  createPaymentIntent(request: CreatePaymentIntentRequest): Observable<CreatePaymentIntentResponse> {
    return this.http.post<CreatePaymentIntentResponse>(
      `${this.apiUrl}/create-payment-intent`,
      request
    );
  }

  // Confirm payment
  confirmPayment(request: ConfirmPaymentRequest): Observable<boolean> {
    return this.http.post<boolean>(
      `${this.apiUrl}/confirm-payment`,
      request
    );
  }

  // Coupon validation
  validateCoupon(request: ValidateCouponRequest): Observable<ValidateCouponResponse> {
    return this.http.post<ValidateCouponResponse>(
      `${this.apiUrl}/validate-coupon`,
      request
    );
  }






  private generateTicketId(): string {
    return `ticket_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }


  private generateQRCode(orderId: string, itemId: string, eventId: string): string {
    return JSON.stringify({
      orderId,
      itemId,
      eventId,
      timestamp: Date.now(),
      signature: Math.random().toString(36).substr(2, 16)
    });
  }

  private calculateValidUntil(eventDate: Date): Date {
    const date = new Date(eventDate);
    // Make ticket valid until 2 hours after event start
    date.setHours(date.getHours() + 2);
    return date;
  }

  // Storage methods for offline cache
  private loadOrdersFromStorage(): void {
    try {
      const storedOrders = localStorage.getItem(this.storageKey);
      const storedTickets = localStorage.getItem(this.ticketsKey);
      
      if (storedOrders) {
        this.orders = JSON.parse(storedOrders);
        this.ordersSubject.next([...this.orders]);
      }
      
      if (storedTickets) {
        this.tickets = JSON.parse(storedTickets);
      }
    } catch (error) {
      console.error('Error loading orders from storage:', error);
      this.orders = [];
      this.tickets = [];
    }
  }

  private saveOrdersToStorage(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.orders));
    } catch (error) {
      console.error('Error saving orders to storage:', error);
    }
  }

  private saveTicketsToStorage(): void {
    try {
      localStorage.setItem(this.ticketsKey, JSON.stringify(this.tickets));
    } catch (error) {
      console.error('Error saving tickets to storage:', error);
    }
  }
}