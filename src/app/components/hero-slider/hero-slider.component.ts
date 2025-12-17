import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Event, EventStatus, EventType } from '../../core/models/event.model';
import { EventService } from '../../core/services/event.service';

@Component({
  selector: 'app-hero-slider',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './hero-slider.component.html',
  styleUrls: ['./hero-slider.component.scss']
})
export class HeroSliderComponent {
  @Output() scrollToEvents = new EventEmitter<void>();

    events: Event[] = [];

  currentSlide = 0;
  private autoSlideInterval: any;

  // Add EventStatus enum to template
  EventStatus = EventStatus;
 constructor(private eventService: EventService) {}

  ngOnInit() {
    if (this.events.length > 0) {
      this.startAutoSlide();
    }
        this.loadFeaturedEvents();

  }

   loadFeaturedEvents() {
    // Get featured events from service
    this.eventService.getEvents().subscribe({
          next: (events) => {
            this.events = events;
            
          },
          error: (error) => {
            console.error('Error loading events:', error);
          }
        });
    if (this.events.length > 0) {
      this.startAutoSlide();
    }
  }

  ngOnDestroy() {
    this.stopAutoSlide();
  }

  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.events.length;
    this.resetAutoSlide();
  }

  prevSlide() {
    this.currentSlide = (this.currentSlide - 1 + this.events.length) % this.events.length;
    this.resetAutoSlide();
  }

  goToSlide(index: number) {
    this.currentSlide = index;
    this.resetAutoSlide();
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  getLocation(event: Event): string {
    return `${event.venue.name}, ${event.venue.city}`;
  }

  getEventTypeLabel(type: EventType): string {
    const typeLabels = {
      [EventType.CONFERENCE]: 'Conference',
      [EventType.WORKSHOP]: 'Workshop',
      [EventType.SEMINAR]: 'Seminar',
      [EventType.NETWORKING]: 'Networking',
      [EventType.SOCIAL]: 'Social Event',
      [EventType.SPORTS]: 'Sports',
      [EventType.MUSIC]: 'Concert',
      [EventType.ART]: 'Art Exhibition',
      [EventType.COMEDY]: 'Comedy Show',
      [EventType.THEATRE]: 'Theatre',
      [EventType.FESTIVAL]: 'Festival',
      [EventType.EXHIBITION]: 'Exhibition',
      [EventType.OTHER]: 'Event'
    };
    return typeLabels[type] || 'Event';
  }

  getStartingPrice(event: Event): number {
    if (!event.ticketTiers || event.ticketTiers.length === 0) return 0;
    return Math.min(...event.ticketTiers.map(tier => tier.price));
  }

  isSoldOut(event: Event): boolean {
    if (!event.ticketTiers || event.ticketTiers.length === 0) return false;
    return event.ticketTiers.reduce((sum, tier) => sum + tier.available, 0) === 0;
  }

  // New method for completed events
  getAttendanceInfo(event: Event): string {
    if (!event.ticketTiers || event.ticketTiers.length === 0) return 'Event Completed';
    
    const totalTickets = event.ticketTiers.reduce((sum, tier) => sum + tier.quantity, 0);
    const soldTickets = event.ticketTiers.reduce((sum, tier) => sum + (tier.quantity - tier.available), 0);
    
    return `${soldTickets} attendees`;
  }

  onScrollToEvents() {
    this.scrollToEvents.emit();
  }

  private startAutoSlide() {
    this.autoSlideInterval = setInterval(() => {
      this.nextSlide();
    }, 5000);
  }

  private stopAutoSlide() {
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
    }
  }

  private resetAutoSlide() {
    this.stopAutoSlide();
    this.startAutoSlide();
  }
}