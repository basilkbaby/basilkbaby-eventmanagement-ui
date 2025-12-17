import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { CartItem } from '../models/event.model';
import { CartService } from './cart.service';
import { CustomerInfo, Order, OrderItem, PaymentInfo, Ticket } from '../models/order.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private orders: Order[] = [];
  private ordersSubject = new BehaviorSubject<Order[]>([]);
  private tickets: Ticket[] = [];
  
  // For demo purposes - in production, this would be your API URL
  private apiUrl = 'https://your-api.com/api';
  
  // Store orders in localStorage for demo
  private storageKey = 'event_ticketing_orders';
  private ticketsKey = 'event_ticketing_tickets';

  orders$ = this.ordersSubject.asObservable();

  constructor(
    private http: HttpClient,
    private cartService: CartService
  ) {
    this.loadOrdersFromStorage();
  }

  // Create a new order from cart
  createOrder(
  cartItems: CartItem[],
  customerInfo: CustomerInfo,
  paymentInfo: PaymentInfo,
  totalAmount: number
): Observable<Order> {
  const orderId = this.generateOrderId();
  const orderReference = `ORD-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  
  // Calculate fees
  const subtotal = this.cartService.getTotal();
  const serviceFee = subtotal * 0.10;
  
  // Convert cart items to order items
  const orderItems: OrderItem[] = cartItems.map(item => ({
    id: this.generateId(),
    eventId: this.getEventIdFromItem(item),
    eventTitle: this.getEventTitleFromItem(item),
    eventDate: this.getEventDateFromItem(item),
    venue: this.getVenueFromItem(item),
    ticketType: this.getTicketTypeFromItem(item),
    quantity: item.quantity,
    price: item.price,
    seatInfo: item.seat ? {
      section: item.seat.section || 'General',
      row: item.seat.row || 'GA',
      number: item.seat.number || 0,
      type: item.seat.type || 'Standard'
    } : undefined
  }));

  // Create the order
  const order: Order = {
    id: orderId,
    reference: orderReference,
    customer: customerInfo,
    items: orderItems,
    subtotal: subtotal,
    serviceFee: serviceFee,
    total: totalAmount,
    status: 'confirmed',
    paymentMethod: 'credit_card',
    paymentStatus: 'completed',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  // Generate tickets for each order item
  this.generateTickets(order);

  // Add to orders array and update storage
  this.orders.push(order);
  this.saveOrdersToStorage();
  this.ordersSubject.next([...this.orders]);

  // Return the created order immediately
  return of(order);
}
  // Lookup order by reference and last name
lookupOrder(reference: string, lastName: string, email?: string): Observable<Order> {
  // First, try to find in existing orders
  const existingOrder = this.orders.find(o => 
    o.reference.toLowerCase() === reference.toLowerCase() && 
    o.customer.lastName.toLowerCase() === lastName.toLowerCase() &&
    (!email || o.customer.email.toLowerCase() === email.toLowerCase())
  );

  if (existingOrder) {
    return of(existingOrder);
  }

  // Mock orders for testing
  const mockOrders: Order[] = [
    {
      id: 'order_mock_001',
      reference: 'ORD-123456-ABC123',
      customer: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '07700 900123'
      },
      items: [
        {
          id: 'item_mock_1',
          eventId: 'event_001',
          eventTitle: 'Summer Music Festival 2024',
          eventDate: new Date('2024-07-15T18:00:00'),
          venue: 'Hyde Park, London',
          ticketType: 'VIP Weekend Pass',
          quantity: 2,
          price: 129.99,
          seatInfo: {
            section: 'VIP',
            row: 'A',
            number: 12,
            type: 'Reserved'
          }
        }
      ],
      subtotal: 259.98,
      serviceFee: 25.99,
      total: 285.97,
      status: 'confirmed',
      paymentMethod: 'credit_card',
      paymentStatus: 'completed',
      createdAt: new Date('2024-01-15T14:30:00'),
      updatedAt: new Date('2024-01-15T14:30:00')
    },
    {
      id: 'order_mock_002',
      reference: 'ORD-789012-DEF456',
      customer: {
        firstName: 'Sarah',
        lastName: 'Smith',
        email: 'sarah.smith@example.com',
        phone: '07700 900456'
      },
      items: [
        {
          id: 'item_mock_2',
          eventId: 'event_002',
          eventTitle: 'Premier League: Arsenal vs Chelsea',
          eventDate: new Date('2024-08-20T15:00:00'),
          venue: 'Emirates Stadium, London',
          ticketType: 'Standard Admission',
          quantity: 4,
          price: 89.50
        }
      ],
      subtotal: 358.00,
      serviceFee: 35.80,
      total: 393.80,
      status: 'confirmed',
      paymentMethod: 'credit_card',
      paymentStatus: 'completed',
      createdAt: new Date('2024-01-20T10:15:00'),
      updatedAt: new Date('2024-01-20T10:15:00')
    },
    {
      id: 'order_mock_003',
      reference: 'TEST-ORDER-123',
      customer: {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        phone: '07700 900789'
      },
      items: [
        {
          id: 'item_mock_3',
          eventId: 'event_003',
          eventTitle: 'London Theatre: The Lion King',
          eventDate: new Date('2024-06-10T19:30:00'),
          venue: 'Lyceum Theatre, London',
          ticketType: 'Premium Seating',
          quantity: 2,
          price: 120.00,
          seatInfo: {
            section: 'Royal Circle',
            row: 'B',
            number: 15,
            type: 'Premium'
          }
        },
        {
          id: 'item_mock_4',
          eventId: 'event_004',
          eventTitle: 'Comedy Night Special',
          eventDate: new Date('2024-07-05T20:00:00'),
          venue: 'The O2 Arena, London',
          ticketType: 'General Admission',
          quantity: 3,
          price: 45.00
        }
      ],
      subtotal: 375.00,
      serviceFee: 37.50,
      total: 412.50,
      status: 'confirmed',
      paymentMethod: 'credit_card',
      paymentStatus: 'completed',
      createdAt: new Date('2024-01-25T16:45:00'),
      updatedAt: new Date('2024-01-25T16:45:00')
    }
  ];

  // Try to find in mock orders
  const mockOrder = mockOrders.find(o => 
    o.reference.toLowerCase() === reference.toLowerCase() && 
    o.customer.lastName.toLowerCase() === lastName.toLowerCase() &&
    (!email || o.customer.email.toLowerCase() === email.toLowerCase())
  );

  if (mockOrder) {
    // Also add to orders array for future lookups
    if (!this.orders.some(o => o.id === mockOrder.id)) {
      this.orders.push(mockOrder);
      this.saveOrdersToStorage();
    }
    return of(mockOrder);
  }

  // If no exact match, create a dynamic mock order
  if (reference.toLowerCase().includes('test') || reference.toLowerCase().includes('demo')) {
    const dynamicMockOrder = this.createDynamicMockOrder(reference, lastName, email);
    this.orders.push(dynamicMockOrder);
    this.saveOrdersToStorage();
    return of(dynamicMockOrder);
  }

  // Special case for common test patterns
  const testPatterns = [
    { ref: 'ORD-123456', last: 'DOE' },
    { ref: 'TEST123', last: 'TEST' },
    { ref: 'DEMO001', last: 'DEMO' }
  ];

  for (const pattern of testPatterns) {
    if (reference.toUpperCase().includes(pattern.ref) && lastName.toUpperCase().includes(pattern.last)) {
      const dynamicOrder = this.createDynamicMockOrder(reference, lastName, email);
      this.orders.push(dynamicOrder);
      this.saveOrdersToStorage();
      return of(dynamicOrder);
    }
  }

  throw new Error('Order not found. Please check your details and try again.');
}


// Add this helper method to create dynamic mock orders
private createDynamicMockOrder(reference: string, lastName: string, email?: string): Order {
  const firstName = email?.split('@')[0] || 'John';
  const mockEmail = email || `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`;
  
  const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  
  const mockOrder: Order = {
    id: orderId,
    reference: reference,
    customer: {
      firstName: firstName,
      lastName: lastName,
      email: mockEmail,
      phone: '07700 900' + Math.floor(Math.random() * 900 + 100)
    },
    items: [
      {
        id: `item_${Date.now()}_1`,
        eventId: 'event_dynamic_1',
        eventTitle: 'Dynamic Event Booking',
        eventDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        venue: 'London Venue',
        ticketType: Math.random() > 0.5 ? 'VIP' : 'Standard',
        quantity: Math.floor(Math.random() * 4) + 1,
        price: Math.random() > 0.5 ? 99.99 : 49.99,
        seatInfo: Math.random() > 0.5 ? {
          section: ['A', 'B', 'C'][Math.floor(Math.random() * 3)],
          row: String.fromCharCode(65 + Math.floor(Math.random() * 10)),
          number: Math.floor(Math.random() * 50) + 1,
          type: 'Reserved'
        } : undefined
      }
    ],
    subtotal: 0,
    serviceFee: 0,
    total: 0,
    status: 'confirmed',
    paymentMethod: 'credit_card',
    paymentStatus: 'completed',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  // Calculate totals
  mockOrder.items.forEach(item => {
    mockOrder.subtotal += item.price * item.quantity;
  });
  mockOrder.serviceFee = mockOrder.subtotal * 0.10;
  mockOrder.total = mockOrder.subtotal + mockOrder.serviceFee;

  return mockOrder;
}
  // Get order by ID
  getOrder(id: string): Observable<Order> {
    const order = this.orders.find(o => o.id === id);
    
    if (!order) {
      throw new Error('Order not found');
    }

    return of(order);
  }

  // Get all orders (for logged-in users)
  getUserOrders(email: string): Observable<Order[]> {
    const userOrders = this.orders.filter(o => 
      o.customer.email.toLowerCase() === email.toLowerCase()
    );
    
    return of(userOrders.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ));
  }

  // Get tickets by order ID
  getTicketsByOrder(orderId: string): Observable<Ticket[]> {
    const orderTickets = this.tickets.filter(ticket => ticket.orderId === orderId);
    return of(orderTickets);
  }

  // Get ticket by ID
  getTicket(ticketId: string): Observable<Ticket> {
    const ticket = this.tickets.find(t => t.id === ticketId);
    
    if (!ticket) {
      throw new Error('Ticket not found');
    }

    return of(ticket);
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

  // Generate tickets for an order
  private generateTickets(order: Order): void {
    order.items.forEach(item => {
      for (let i = 0; i < item.quantity; i++) {
        const ticket: Ticket = {
          id: this.generateTicketId(),
          orderId: order.id,
          eventId: item.eventId,
          eventTitle: item.eventTitle,
          eventDate: item.eventDate,
          venue: item.venue,
          type: item.ticketType,
          price: item.price,
          quantity: 1,
          seatInfo: item.seatInfo,
          status: 'valid',
          validUntil: this.calculateValidUntil(item.eventDate),
          qrCode: this.generateQRCode(order.id, item.id, item.eventId),
          createdAt: new Date()
        };
        
        this.tickets.push(ticket);
      }
    });
    
    this.saveTicketsToStorage();
  }

  // Helper methods to extract info from cart items
  private getEventIdFromItem(item: CartItem): string {
    if (item.seat) return item.seat.eventId || 'event_1';
    if (item.ticketType) return item.ticketType.eventId || 'event_1';
    return 'event_1';
  }

  private getEventTitleFromItem(item: CartItem): string {
    if (item.seat) return item.seat.eventTitle || 'Event';
    if (item.ticketType) return item.ticketType.eventTitle || 'Event';
    return 'Event';
  }

  private getEventDateFromItem(item: CartItem): Date {
    if (item.seat) return item.seat.eventDate || new Date();
    if (item.ticketType) return item.ticketType.eventDate || new Date();
    return new Date();
  }

  private getVenueFromItem(item: CartItem): string {
    if (item.seat) return item.seat.venue || 'Venue';
    if (item.ticketType) return item.ticketType.venue || 'Venue';
    return 'Venue';
  }

  private getTicketTypeFromItem(item: CartItem): string {
    if (item.seat) return item.seat.type || 'Standard';
    if (item.ticketType) return item.ticketType.name || 'General Admission';
    return 'General';
  }

  // Generate unique IDs
  private generateOrderId(): string {
    return `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateTicketId(): string {
    return `ticket_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
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

  // Storage methods for demo
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