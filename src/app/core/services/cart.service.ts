import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CartItem, Seat, TicketType } from '../models/event.model';

export interface CartSummary {
  subtotal: number;
  serviceFee: number;
  total: number;
  itemCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems: CartItem[] = [];
  private cartSubject = new BehaviorSubject<CartItem[]>([]);
  
  cart$ = this.cartSubject.asObservable();

  // Add seat to cart
  addSeat(seat: Seat): void {
    const existingItem = this.cartItems.find(item => item.seat?.id === seat.id);
    
    if (existingItem) {
      // For seats, we typically don't allow multiple of the same seat
      existingItem.quantity = 1;
    } else {
      this.cartItems.push({
        id: this.generateId(),
        seat: seat,
        quantity: 1,
        price: seat.price,
        type: 'seat',
        addedAt: new Date()
      });
    }
    
    this.cartSubject.next([...this.cartItems]);
  }

  // Add ticket type to cart
  addTicketType(ticketType: TicketType, quantity: number = 1): void {
    const existingItem = this.cartItems.find(item => item.ticketType?.id === ticketType.id);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.cartItems.push({
        id: this.generateId(),
        ticketType: ticketType,
        quantity: quantity,
        price: ticketType.price,
        type: 'ticketType',
        addedAt: new Date()
      });
    }
    
    this.cartSubject.next([...this.cartItems]);
  }

  // Remove item by ID
  removeItem(id: string): void {
    this.cartItems = this.cartItems.filter(item => item.id !== id);
    this.cartSubject.next([...this.cartItems]);
  }

  // Remove item by index (for backward compatibility)
  removeItemByIndex(index: number): void {
    this.cartItems.splice(index, 1);
    this.cartSubject.next([...this.cartItems]);
  }

  // Update quantity
  updateQuantity(id: string, quantity: number): void {
    const item = this.cartItems.find(item => item.id === id);
    if (item) {
      if (quantity <= 0) {
        this.removeItem(id);
      } else {
        item.quantity = quantity;
        this.cartSubject.next([...this.cartItems]);
      }
    }
  }

  // Clear entire cart
  clearCart(): void {
    this.cartItems = [];
    this.cartSubject.next([]);
  }

  // Get cart summary
  getCartSummary(): CartSummary {
    const subtotal = this.getTotal();
    const serviceFee = subtotal * 0.10; // 10% service fee
    const total = subtotal + serviceFee;
    const itemCount = this.getItemCount();

    return { subtotal, serviceFee, total, itemCount };
  }

  // Get total price
  getTotal(): number {
    return this.cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  // Get total item count
  getItemCount(): number {
    return this.cartItems.reduce((count, item) => count + item.quantity, 0);
  }

  // Get all cart items
  getCartItems(): CartItem[] {
    return [...this.cartItems];
  }

  // Check if cart is empty
  isEmpty(): boolean {
    return this.cartItems.length === 0;
  }

  // Generate unique ID for cart items
  private generateId(): string {
    return `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}