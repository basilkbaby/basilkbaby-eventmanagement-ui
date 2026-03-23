// general-admission.component.ts
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { NotificationService } from '../../../core/services/notification.service';
import { SelectedSeat, TicketType } from '../../../core/models/seats.model';
import { CurrencyFormatPipe } from '../../../core/pipes/currency-format.pipe';

interface GAOption {
  id: string;
  name: string;
  price: number;
  maxPerOrder: number;
  color: string;
  type: TicketType;
  description: string;
}

@Component({
  selector: 'app-general-admission',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyFormatPipe],
  templateUrl: './general-admission.component.html',
  styleUrls: ['./general-admission.component.scss']
})
export class GeneralAdmissionComponent implements OnInit {
  eventId: string = "";
  sectionId: string = "";
  @Output() backToSeatMap = new EventEmitter<void>();
  
  // GA options
  gaOptions: GAOption[] = [];
  
  // Quantity selections
  selections: { [optionId: string]: number } = {};
  
  // Loading state
  isLoading = false;
  
  constructor(
    private cartService: CartService,
    private router: Router,
    private route: ActivatedRoute,
    private notificationService: NotificationService
  ) {}
  
  ngOnInit() {
    this.route.params.subscribe(params => {
      this.eventId = params['id'];
      this.sectionId = params['sectionId'];
    });

    this.initializeOptions();
  }
  
  private initializeOptions() {
    this.gaOptions = [
      {
        id: 'ga-regular',
        name: 'Standing Ticket',
        price: 45,
        maxPerOrder: 8,
        color: '#4CAF50',
        type: 'GENERAL',
        description: 'Standing room only - no allocated seats'
      }
      // {
      //   id: 'ga-vip',
      //   name: 'VIP Standing',
      //   price: 85,
      //   maxPerOrder: 4,
      //   color: '#FF9800',
      //   type: 'VIP',
      //   description: 'Premium standing area with exclusive benefits'
      // }
    ];
    
    // Initialize all selections to 0
    this.gaOptions.forEach(option => {
      this.selections[option.id] = 0;
    });
  }
  
  // Increment quantity
  increment(optionId: string) {
    const option = this.gaOptions.find(o => o.id === optionId);
    if (!option) return;
    
    const current = this.selections[optionId] || 0;
    if (current < option.maxPerOrder) {
      this.selections[optionId] = current + 1;
    } else {
      this.notificationService.showWarning(`Maximum ${option.maxPerOrder} tickets allowed`);
    }
  }
  
  // Decrement quantity
  decrement(optionId: string) {
    const current = this.selections[optionId] || 0;
    if (current > 0) {
      this.selections[optionId] = current - 1;
    }
  }
  
  // Check if can increment
  canIncrement(optionId: string): boolean {
    const option = this.gaOptions.find(o => o.id === optionId);
    if (!option) return false;
    
    const current = this.selections[optionId] || 0;
    return current < option.maxPerOrder;
  }
  
  // Get total quantity selected
  get totalQuantity(): number {
    return Object.values(this.selections).reduce((sum, qty) => sum + qty, 0);
  }
  
  // Get total price
  get totalPrice(): number {
    let total = 0;
    this.gaOptions.forEach(option => {
      const qty = this.selections[option.id] || 0;
      total += option.price * qty;
    });
    return total;
  }
  
  // Clear all selections
  clearAll() {
    this.gaOptions.forEach(option => {
      this.selections[option.id] = 0;
    });
  }
  
  // Add to cart
  addToCart() {
    if (this.totalQuantity === 0) {
      this.notificationService.showWarning('Please select at least one ticket');
      return;
    }
    
    this.isLoading = true;
    
    // Build selected seats array
    const selectedSeats: SelectedSeat[] = [];
    
    this.gaOptions.forEach(option => {
      const qty = this.selections[option.id] || 0;
      
      // Create one entry per ticket
      for (let i = 0; i < qty; i++) {
        const ticketId = `GA-${option.id}-${Date.now()}-${i}`;
        
        selectedSeats.push({
          seatId: ticketId,
          row: 'GA',
          number: i + 1,
          sectionName: option.name,
          sectionId: 'general-admission',
          sectionConfigId: option.id,
          tier: {
            id: option.id,
            name: option.type,
            price: option.price,
            color: option.color
          },
          price: option.price,
          features: [],
          isStandingArea: true,
          isGeneralAdmission: true
        });
      }
    });
    
    // Add to cart using existing service
    this.cartService.addToCart(this.eventId, selectedSeats).subscribe({
      next: (response) => {
        this.isLoading = false;
        
        if (response.success) {
          this.notificationService.showSuccess('Tickets added to cart!');
          this.router.navigate(['/cart']);
        } else {
          this.notificationService.showError(response.error || 'Failed to add tickets');
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.notificationService.showError('An error occurred. Please try again.');
        console.error('Cart error:', error);
      }
    });
  }
  
  // Go back to seat map
  goBack() {
    this.backToSeatMap.emit();
  }
}