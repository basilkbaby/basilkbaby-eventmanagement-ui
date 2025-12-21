import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { Subscription } from 'rxjs';
import { Event, TicketTier } from '../../core/models/event.model';
import { MOCK_EVENTS } from '../../core/mock/mock-events.data';
import { EventService } from '../../core/services/event.service';
import { EventDetailDto } from '../../core/models/DTOs/event.DTO.model';
import { FormatDatePipe } from '../../core/pipes/format-date.pipe';
import { OrganizationType } from '../../core/models/Enums/event.enums';
import { OrganizationFilterPipe } from '../../core/pipes/custom/organization-filter.pipe';
import { FormatTimePipe } from '../../core/pipes/common/time-format.pipe';
import { DurationPipe } from '../../core/pipes/common/duration.pipe';

@Component({
  selector: 'app-event-details',
  standalone: true,
  imports: [CommonModule, RouterModule, FormatDatePipe, OrganizationFilterPipe, FormatTimePipe, DurationPipe],
  templateUrl: './event-details.component.html',
  styleUrls: ['./event-details.component.scss']
})
export class EventDetailsComponent implements OnInit {
  event: EventDetailDto | null = null;
  loading: boolean = true;
  cartItemCount: number = 0;
  OrganizationType = OrganizationType;
  // Add these properties
  selectedSection: string = '';
  private cartStateSubscription: Subscription | undefined;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cartService: CartService,
    private eventService : EventService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const eventId = params['id'];
      this.loadEventDetails(eventId);
    });

    this.cartStateSubscription = this.cartService.currentCartState$.subscribe({
      next: (state) => {
        // Calculate count from cart items
        this.cartItemCount = state.items.reduce((count, item) => count + item.quantity, 0);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.cartStateSubscription) {
      this.cartStateSubscription.unsubscribe();
    }
  }

  loadEventDetails(eventId: string): void {
    this.loading = true;
      // Use getEventDetails to get full event with all related data
      this.eventService.getEventDetails(eventId).subscribe({
        next: (event) => {
          this.event = event;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading event:', error);
          this.loading = false;
        }
      });
  }

  navigateToSeatSelection(): void {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
      .test(navigator.userAgent);
    if (this.event && !this.event.isPast) {
      if(isMobile)
        this.router.navigate(['/events', this.event.id, 'mobileseatmap']);
        else
      this.router.navigate(['/events', this.event.id, 'seatmap']); //seatstheatre
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