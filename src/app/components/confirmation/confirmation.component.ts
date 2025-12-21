import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { QRCodeModule } from 'angularx-qrcode';
import { OrderService } from '../../core/services/order.service';
import { TicketService } from '../../core/services/ticket.service';
import { Order, Ticket } from '../../core/models/order.model';
import { CartService } from '../../core/services/cart.service';
import { FormatDatePipe } from '../../core/pipes/format-date.pipe';

@Component({
  selector: 'app-confirmation',
  standalone: true,
  imports: [CommonModule, QRCodeModule, FormatDatePipe],
  templateUrl: './confirmation.component.html',
  styleUrls: ['./confirmation.component.scss']
})
export class ConfirmationComponent implements OnInit {
  orderId: string = '';
  order: Order | null = null;
  tickets: Ticket[] = [];
  loading: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService,
    private ticketService: TicketService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    // Get order ID from route parameters
    this.loading = true;
    this.route.paramMap.subscribe(params => {
      this.orderId = params.get('id') || '';
      
      if (this.orderId) {
        this.loadOrder(this.orderId);
      } else {
        this.router.navigate(['/']);
        this.loading = false;
      }
    });

    // Clear cart after successful order
    this.cartService.clearCart();
  }

  loadOrder(orderId: string): void {
    this.orderService.getOrder(orderId).subscribe({
      next: (order) => {
        this.order = order;
        //this.loadTickets(order.id);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading order:', error);
        this.loading = false;
      }
    });
  }

  

  downloadTickets(): void {
    // Create a downloadable PDF or file of tickets
    const ticketData = {
      order: this.order,
      tickets: this.tickets,
      downloadDate: new Date().toISOString()
    };
    
    // Create a blob and download link
    const blob = new Blob([JSON.stringify(ticketData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    // Generate filename with order reference
    const fileName = `tickets_${this.order?.orderNumber || 'order'}.json`;
    
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    console.log(`Downloading ${this.tickets.length} tickets for order ${this.order?.orderNumber}`);
  }

  addToWallet(ticket: Ticket): void {
    // For iOS Wallet (PassKit)
    if ('AddPass' in window) {
      // This would typically be a .pkpass file from your backend
      console.log('Adding to Apple Wallet:', ticket.id);
      
      // In a real implementation, you would:
      // 1. Generate or fetch a .pkpass file from your backend
      // 2. Trigger the AddPass API
      
      // Example: window.AddPass.addPass(passUrl);
      
      alert('Wallet functionality would be implemented with actual .pkpass files from backend');
    } 
    // For Google Wallet
    else if ('saveToGooglePay' in window) {
      console.log('Adding to Google Wallet:', ticket.id);
      // Google Wallet implementation
      alert('Google Wallet integration would be implemented here');
    }
    // Fallback for browsers without wallet support
    else {
      console.log('Wallet not supported in this browser:', ticket.id);
      alert('Wallet functionality is not supported in your current browser');
    }
  }

  generateQRData(ticket: Ticket): string {
    // Use the existing QR code or generate a new one
    if (ticket.qrCode) {
      return ticket.qrCode;
    }
    
    // Generate QR data
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

  printTickets(): void {
    window.print();
  }

  goHome(): void {
    this.router.navigate(['/']);
  }
}