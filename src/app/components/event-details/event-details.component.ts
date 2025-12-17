import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { Subscription } from 'rxjs';
import { Event, TicketTier } from '../../core/models/event.model';
import { MOCK_EVENTS } from '../../core/mock/mock-events.data';

@Component({
  selector: 'app-event-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './event-details.component.html',
  styleUrls: ['./event-details.component.scss']
})
export class EventDetailsComponent implements OnInit {
  event: Event | null = null;
  loading: boolean = true;
  cartItemCount: number = 0;
  
  // Add these properties
selectedSection: string = '';
  private cartSubscription: Subscription | undefined;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const eventId = params['id'];
      this.loadEventDetails(eventId);
    });

    this.cartSubscription = this.cartService.cart$.subscribe(() => {
      this.cartItemCount = this.cartService.getItemCount();
    });
  }

  ngOnDestroy(): void {
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
  }

  loadEventDetails(eventId: string): void {
    setTimeout(() => {
      this.event = MOCK_EVENTS.find(e => e.id === eventId) || null;
      this.loading = false;
    }, 500);
  }

  navigateToSeatSelection(): void {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
      .test(navigator.userAgent);
    if (this.event && !this.isEventSoldOut()) {
      if(isMobile)
        this.router.navigate(['/events', this.event.id, 'mobileseatmap']);
        else
      this.router.navigate(['/events', this.event.id, 'seatmap']); //seatstheatre
    }
  }

  navigateToSeatSelectionWithTier(tierId: string): void {
  if (this.event && !this.isEventSoldOut()) {
    // You can pass tier ID as query parameter or store in service
    this.router.navigate(['/events', this.event.id, 'seatmap'], { //seatstheatre
      queryParams: { tier: tierId }
    });
  }
}

// For specific section navigation
navigateToSeatSelectionWithSection(section: string): void {
  if (this.event && !this.isEventSoldOut()) {
    this.router.navigate(['/events', this.event.id, 'seatmap'], { //seatstheatre
      queryParams: { section: section }
    });
  }
}

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-UK', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-UK', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 2
    }).format(price);
  }

  getEventImage(): string {
    if (!this.event) return '';
    return this.event.bannerImage || this.event.thumbnailImage || 'assets/images/events/default-banner.jpg';
  }


  getDuration(): string {
    if (!this.event) return '';
    const start = new Date(`${this.event.startDate.toDateString()} ${this.event.startTime}`);
    const end = new Date(`${this.event.endDate.toDateString()} ${this.event.endTime}`);
    const diffMs = end.getTime() - start.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ${minutes > 0 ? `${minutes} minute${minutes > 1 ? 's' : ''}` : ''}`;
    }
    return `${minutes} minutes`;
  }

  isEventSoldOut(): boolean {
    if (!this.event) return true;
    return this.event.ticketTiers.every(tier => tier.available <= 0);
  }

  getAvailableTickets(): number {
    if (!this.event) return 0;
    return this.event.ticketTiers.reduce((total, tier) => total + tier.available, 0);
  }


// Add these methods
getLowestTicketPrice(): number {
  if (!this.event || this.event.ticketTiers.length === 0) return 0;
  return Math.min(...this.event.ticketTiers.map(tier => tier.price));
}

selectSection(section: string): void {
  this.selectedSection = this.selectedSection === section ? '' : section;
}

getSectionAvailability(section: string): number {
  // This is a mock method - in real app, you'd get this from your data
  const availabilityMap: { [key: string]: number } = {
    'VIP': 85,
    'Premium': 420,
    'Standard': 1850,
    'Balcony': 2500
  };
  return availabilityMap[section] || 0;
}

selectTicketAndNavigate(tier: TicketTier): void {
  if (tier.available > 0 && !this.isEventSoldOut()) {
    // You could store the selected tier in a service for the seat selection page
    this.navigateToSeatSelection();
  }
}

scrollToSection(sectionId: string): void {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

shareEvent(): void {
  if (navigator.share && this.event) {
    navigator.share({
      title: this.event.title,
      text: this.event.shortDescription,
      url: window.location.href,
    });
  } else {
    // Fallback copy to clipboard
    navigator.clipboard.writeText(window.location.href);
    //alert('Link copied to clipboard!');
  }
}

saveEvent(): void {
  // Implement save to favorites
  //alert('Event saved to your favorites!');
}
}