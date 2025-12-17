import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CartService, CartSummary } from '../../core/services/cart.service';
import { CartItem } from '../../core/models/event.model';
import { Subscription } from 'rxjs';

@Component({  
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit, OnDestroy {
  cartItems: CartItem[] = [];
  cartSummary: CartSummary = { subtotal: 0, serviceFee: 0, total: 0, itemCount: 0 };
  loading: boolean = true;
  private cartSubscription: Subscription | undefined;

  constructor(
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cartSubscription = this.cartService.cart$.subscribe(items => {
      this.cartItems = items;
      this.cartSummary = this.cartService.getCartSummary();
      this.loading = false;
    });
  }

  ngOnDestroy(): void {
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
  }

  updateQuantity(item: CartItem, change: number): void {
    // Only allow quantity updates for ticket types, not seats
    if (item.ticketType && item.id) {
      const newQuantity = (item.quantity || 1) + change;
      if (newQuantity >= 1 && newQuantity <= 10) {
        this.cartService.updateQuantity(item.id, newQuantity);
      }
    }
  }

  removeItem(itemId: string): void {
    this.cartService.removeItem(itemId);
  }

  clearCart(): void {
    if (confirm('Are you sure you want to clear your cart?')) {
      this.cartService.clearCart();
    }
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-UK', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 2
    }).format(price);
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-UK', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    }).format(new Date(date));
  }

  proceedToCheckout(): void {
    if (this.cartItems.length > 0) {
      this.router.navigate(['/checkout']);
    }
  }

  continueShopping(): void {
    this.router.navigate(['/events']);
  }

  getGroupedEvents(): any[] {
    const eventMap = new Map();
    
    this.cartItems.forEach(item => {
      let eventId, eventTitle, eventDate, venue;
      
      if (item.seat) {
        eventId = item.seat.eventId || '1';
        eventTitle = item.seat.eventTitle || 'Event';
        eventDate = item.seat.eventDate || new Date();
        venue = item.seat.venue || 'Venue';
      } else if (item.ticketType) {
        eventId = item.ticketType.eventId || '1';
        eventTitle = item.ticketType.eventTitle || 'Event';
        eventDate = item.ticketType.eventDate || new Date();
        venue = item.ticketType.venue || 'Venue';
      } else {
        return;
      }
      
      if (!eventMap.has(eventId)) {
        eventMap.set(eventId, {
          id: eventId,
          title: eventTitle,
          date: eventDate,
          venue: venue,
          items: []
        });
      }
      eventMap.get(eventId).items.push(item);
    });
    
    return Array.from(eventMap.values());
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

  getItemType(item: CartItem): string {
    if (item.seat) return 'Reserved Seat';
    if (item.ticketType) return item.ticketType.name || 'General Admission';
    return 'General Admission';
  }
}