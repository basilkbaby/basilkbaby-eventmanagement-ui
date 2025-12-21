import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { CartItemDto, CartSummaryDto, CartDetailsResponse } from '../../core/models/DTOs/cart.DTO.model';
import { Subscription } from 'rxjs';
import { CurrencyFormatPipe } from '../../core/pipes/currency-format.pipe';

@Component({  
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule, CurrencyFormatPipe],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit, OnDestroy {
  cartItems: CartItemDto[] = [];
  cartSummary: CartSummaryDto = this.getEmptyCartSummary();
  loading: boolean = true;
  errorMessage: string = '';
  
  private cartStateSubscription: Subscription | undefined;
  private cartDetailsSubscription: Subscription | undefined;

  constructor(
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Subscribe to current cart state
    this.cartStateSubscription = this.cartService.currentCartState$.subscribe({
      next: (state) => {
        this.cartItems = state.items;
        this.cartSummary = state.summary;
      }
    });

    // Subscribe to cart details API responses
    this.cartDetailsSubscription = this.cartService.cartDetails$.subscribe({
      next: (response: CartDetailsResponse) => {
        this.loading = false;
        if (!response.success) {
          this.errorMessage = response.error || 'Failed to load cart details';
        } else {
          this.errorMessage = '';
        }
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = 'Error loading cart details';
        console.error('Cart component error:', error);
      }
    });

    // Load initial cart data
    this.loadCartData();
  }

  ngOnDestroy(): void {
    if (this.cartStateSubscription) {
      this.cartStateSubscription.unsubscribe();
    }
    if (this.cartDetailsSubscription) {
      this.cartDetailsSubscription.unsubscribe();
    }
  }

  loadCartData(): void {
    this.loading = true;
    this.cartService.getCartDetails();
  }

  updateQuantity(seatId: string, change: number): void {
    const item = this.cartItems.find(item => item.seatId === seatId);
    if (item) {
      const newQuantity = item.quantity + change;
      if (newQuantity >= 1 && newQuantity <= 10) {
        this.cartService.updateQuantity(seatId, newQuantity);
        this.loading = true;
      }
    }
  }

  removeItem(seatId: string): void {
    if (confirm('Are you sure you want to remove this seat?')) {
      this.cartService.removeSeat(seatId);
      this.loading = true;
    }
  }

  clearCart(): void {
    if (confirm('Are you sure you want to clear your entire cart?')) {
      this.cartService.clearCart();
      this.loading = true;
    }
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(price);
  }

  proceedToCheckout(): void {
    const cartId = this.cartService.getCurrentCartId();
    if (cartId && this.cartItems.length > 0) {
      this.router.navigate(['/checkout'], { 
        state: { cartId } 
      });
    } else {
      this.errorMessage = 'Cannot proceed to checkout. Please add items to your cart first.';
    }
  }

  continueShopping(): void {
    this.router.navigate(['/events']);
  }

  // Group seats by section for better display
  getGroupedSeats(): Map<string, CartItemDto[]> {
    const grouped = new Map<string, CartItemDto[]>();
    
    this.cartItems.forEach(item => {
      const section = item.sectionName || 'General';
      if (!grouped.has(section)) {
        grouped.set(section, []);
      }
      grouped.get(section)!.push(item);
    });
    
    return grouped;
  }

  // Get seat display info
  getSeatDisplayInfo(item: CartItemDto): { 
    section: string; 
    seatNumber: string; 
    price: string; 
  } {
    return {
      section: item.sectionName || 'General',
      seatNumber: item.seatNumber || 'Unknown',
      price: this.formatPrice(item.price)
    };
  }

  // Calculate item total
  getItemTotal(item: CartItemDto): number {
    return item.price * item.quantity;
  }

  // Refresh cart data
  refreshCart(): void {
    this.loadCartData();
  }

  private getEmptyCartSummary(): CartSummaryDto {
    return { 
      cartId: '', 
      eventId: '', 
      subtotal: 0, 
      serviceFee: 0, 
      total: 0, 
      seatCount: 0, 
      seats: [] 
    };
  }
}