import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { QRCodeModule } from 'angularx-qrcode';
import { OrderService } from '../../core/services/order.service';
import { TicketService } from '../../core/services/ticket.service';
import { Order, Ticket, SeatInfo } from '../../core/models/order.model';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-confirmation',
  standalone: true,
  imports: [CommonModule, QRCodeModule],
  templateUrl: './confirmation.component.html',
  styleUrls: ['./confirmation.component.scss']
})
export class ConfirmationComponent implements OnInit {
  orderId: string = '';
  order: Order | null = null;
  tickets: Ticket[] = [];
  loading: boolean = true;
  useMockData: boolean = false; // Set to true to use mock data

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService,
    private ticketService: TicketService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    // Get order ID from route parameters
    this.route.paramMap.subscribe(params => {
      this.orderId = params.get('id') || '';
      
      if (this.orderId) {
        // For testing: if order ID starts with "test", use mock data
        if (this.orderId.startsWith('test') || this.useMockData) {
          this.loadMockData();
        } else {
          this.loadOrder(this.orderId);
        }
      } else {
        // If no ID, load mock data for testing
        this.loadMockData();
      }
    });

    this.cartService.clearCart();
  }

  // Load mock data for testing
  loadMockData(): void {
    console.log('Loading mock data...');
    
    // Create mock order
    this.order = {
      id: 'mock_order_123',
      reference: 'ORD-' + Date.now().toString().slice(-6) + '-ABC123',
      customer: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '07700 900123'
      },
      items: [
        {
          id: 'item_1',
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
        },
        {
          id: 'item_2',
          eventId: 'event_002',
          eventTitle: 'Premier League: Arsenal vs Chelsea',
          eventDate: new Date('2024-08-20T15:00:00'),
          venue: 'Emirates Stadium, London',
          ticketType: 'Standard Admission',
          quantity: 1,
          price: 89.50
        }
      ],
      subtotal: 349.48,
      serviceFee: 34.95,
      total: 384.43,
      status: 'confirmed',
      paymentMethod: 'credit_card',
      paymentStatus: 'completed',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Create mock tickets
    this.tickets = this.generateMockTickets();
    
    this.loading = false;
    console.log('Mock data loaded:', { order: this.order, tickets: this.tickets });
  }

  // Generate mock tickets based on order items
  generateMockTickets(): Ticket[] {
    const mockTickets: Ticket[] = [];
    
    this.order!.items.forEach((item, itemIndex) => {
      for (let i = 0; i < item.quantity; i++) {
        const ticketNumber = i + 1;
        const mockTicket: Ticket = {
          id: `ticket_${Date.now()}_${itemIndex}_${ticketNumber}`,
          orderId: this.order!.id,
          eventId: item.eventId,
          eventTitle: item.eventTitle,
          eventDate: item.eventDate,
          venue: item.venue,
          type: item.ticketType,
          price: item.price,
          quantity: 1,
          seatInfo: item.seatInfo,
          status: 'valid' as const,
          validUntil: new Date(item.eventDate.getTime() + (2 * 60 * 60 * 1000)), // 2 hours after event
          qrCode: JSON.stringify({
            ticketId: `ticket_${Date.now()}_${itemIndex}_${ticketNumber}`,
            orderId: this.order!.id,
            eventId: item.eventId,
            timestamp: Date.now()
          }),
          createdAt: new Date()
        };
        mockTickets.push(mockTicket);
      }
    });
    
    return mockTickets;
  }

  loadOrder(orderId: string): void {
    this.orderService.getOrder(orderId).subscribe({
      next: (order) => {
        this.order = order;
        this.loadTickets(order.id);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading order:', error);
        // Fall back to mock data if real order not found
        console.log('Falling back to mock data...');
        this.loadMockData();
      }
    });
  }

  loadTickets(orderId: string): void {
    this.ticketService.getTicketsByOrder(orderId).subscribe({
      next: (tickets) => {
        this.tickets = tickets;
        // If no tickets returned, generate mock tickets
        if (tickets.length === 0) {
          console.log('No tickets found, generating mock tickets...');
          this.tickets = this.generateMockTickets();
        }
      },
      error: (error) => {
        console.error('Error loading tickets:', error);
        // Generate mock tickets on error
        this.tickets = this.generateMockTickets();
      }
    });

    
    this.cartService.clearCart();
  }

  // Test method to add more mock tickets
  addMockTicket(): void {
    const newTicket: Ticket = {
      id: `ticket_mock_${Date.now()}`,
      orderId: this.order?.id || 'mock_order',
      eventId: 'event_003',
      eventTitle: 'Mock Concert Event',
      eventDate: new Date('2024-09-15T20:00:00'),
      venue: 'Royal Albert Hall, London',
      type: 'Standard',
      price: 75.00,
      quantity: 1,
      status: 'valid',
      validUntil: new Date('2024-09-15T22:00:00'),
      qrCode: JSON.stringify({
        ticketId: `ticket_mock_${Date.now()}`,
        orderId: this.order?.id,
        eventId: 'event_003',
        timestamp: Date.now()
      }),
      createdAt: new Date()
    };
    
    this.tickets.push(newTicket);
    console.log('Mock ticket added:', newTicket);
  }

  // Test method to clear and regenerate mock data
  refreshMockData(): void {
    this.loading = true;
    setTimeout(() => {
      this.loadMockData();
      console.log('Mock data refreshed');
    }, 500);
  }

  generateQRData(ticket: Ticket): string {
    // Use the existing QR code or generate a new one
    if (ticket.qrCode) {
      return ticket.qrCode;
    }
    
    // Generate new QR data
    const qrData = {
      ticketId: ticket.id,
      orderId: ticket.orderId,
      eventId: ticket.eventId,
      eventTitle: ticket.eventTitle,
      timestamp: new Date().toISOString()
    };
    return JSON.stringify(qrData);
  }

  formatPrice(price: number | undefined): string {
    if (!price) return '£0.00';
    return new Intl.NumberFormat('en-UK', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 2
    }).format(price);
  }

  formatDate(date: Date | undefined): string {
    if (!date) return '';
    return new Intl.DateTimeFormat('en-UK', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  }

  formatDateTime(date: Date): string {
    return new Intl.DateTimeFormat('en-UK', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  }

  downloadTickets(): void {
    console.log('Downloading tickets...', this.tickets);
    //alert(`Downloading ${this.tickets.length} tickets as PDF`);
    // Implement actual download logic here
  }

  addToWallet(ticket: Ticket): void {
    console.log('Adding to wallet:', ticket);
    //alert(`Ticket ${ticket.id} added to wallet (mock functionality)`);
  }

  printTickets(): void {
    console.log('Printing tickets...');
    window.print();
  }

  goHome(): void {
    this.router.navigate(['/']);
  }
}