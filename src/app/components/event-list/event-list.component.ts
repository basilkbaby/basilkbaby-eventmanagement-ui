// event-list.component.ts
import { Component, HostListener, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { HeroSliderComponent } from '../pages/hero-slider/hero-slider.component';
import { EventService } from '../../core/services/event.service';
import { Event, EventType, TicketTier } from '../../core/models/event.model';
import { LoadingSpinnerComponent } from '../common/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-event-list',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    FormsModule,
    HeroSliderComponent,
    LoadingSpinnerComponent
  ],
  templateUrl: './event-list.component.html',
  styleUrls: ['./event-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventListComponent implements OnInit, OnDestroy {
  events: Event[] = [];
  filteredEvents: Event[] = [];
  categories: string[] = ['All'];
  selectedCategory: string = 'All';
  searchTerm: string = '';
  isLoading: boolean = true;
  isSticky: boolean = false;
  error: string | null = null;
  dateFilter: 'upcoming' | 'past' | 'all' = 'all';

  public searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(private eventService: EventService) {}

  ngOnInit(): void {
    this.setupSearchDebounce();
    this.loadEvents();
    this.filteredEvents = this.events;

  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupSearchDebounce(): void {
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(searchTerm => {
        this.searchTerm = searchTerm;
        this.applyFilters();
      });
  }

  loadEvents(): void {
    this.isLoading = true;
    this.error = null;

    this.eventService.getEvents().subscribe({
      next: (events) => {
        this.events = events;
        this.categories = ['All', ...this.extractUniqueCategories(events)];
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading events:', error);
        this.error = 'Failed to load events. Please try again later.';
        this.isLoading = false;
        this.filteredEvents = [];
      }
    });
  }

  private extractUniqueCategories(events: Event[]): string[] {
    const uniqueCategories = new Set<string>();
    
    events.forEach(event => {
      const categoryLabel = this.getEventTypeLabel(event.type);
      if (categoryLabel && categoryLabel.trim() !== '') {
        uniqueCategories.add(categoryLabel);
      }
    });
    
    return Array.from(uniqueCategories).sort();
  }

  onSearchInput(inputevent: any): void {
    const value = (inputevent.target as HTMLInputElement).value;
    this.searchSubject.next(value);
  }

  filterByCategory(category: string): void {
    this.selectedCategory = category;
    this.applyFilters();
  }

  private applyFilters(): void {
    if (this.isLoading) return;

    this.filteredEvents = this.events.filter(event => {
      // Date filtering
      const eventDate = new Date(event.startDate);
      const now = new Date();
      const matchesDate = this.matchesDateFilter(eventDate, now);
      
      // Category filtering
      const matchesCategory = this.selectedCategory === 'All' || 
        this.getEventTypeLabel(event.type) === this.selectedCategory;
      
      // Search filtering
      const matchesSearch = !this.searchTerm || 
        event.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        event.description?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        event.venue.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        event.venue.city.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        event.tags?.some(tag => tag.toLowerCase().includes(this.searchTerm.toLowerCase()));
      
      return matchesDate && matchesCategory && matchesSearch;
    });
  }

   private matchesDateFilter(eventDate: Date, now: Date): boolean {
    switch (this.dateFilter) {
      case 'upcoming':
        return eventDate >= now;
      case 'past':
        return eventDate < now;
      case 'all':
        return true;
      default:
        return eventDate >= now;
    }
  }

  filterByDate(dateFilter: 'upcoming' | 'past' | 'all'): void {
    this.dateFilter = dateFilter;
    this.applyFilters();
  }

  getEventTypeLabel(type: EventType): string {
    const typeLabels: Record<EventType, string> = {
      [EventType.CONFERENCE]: 'Conference',
      [EventType.WORKSHOP]: 'Workshop',
      [EventType.SEMINAR]: 'Seminar',
      [EventType.NETWORKING]: 'Networking',
      [EventType.SOCIAL]: 'Social',
      [EventType.SPORTS]: 'Sports',
      [EventType.MUSIC]: 'Concert',
      [EventType.ART]: 'Art',
      [EventType.COMEDY]: 'Comedy',
      [EventType.THEATRE]: 'Theatre',
      [EventType.FESTIVAL]: 'Festival',
      [EventType.EXHIBITION]: 'Exhibition',
      [EventType.OTHER]: 'Other'
    };
    return typeLabels[type] || 'Event';
  }

  formatDate(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  getStartingPrice(event: Event): number {
    if (!event.ticketTiers?.length) return 0;
    
    const activeTiers = event.ticketTiers.filter(tier => 
      tier.available > 0 && this.isTicketTierActive(tier)
    );
    
    if (activeTiers.length === 0) return 0;
    
    return Math.min(...activeTiers.map(tier => tier.price));
  }

private isTicketTierActive(tier: TicketTier): boolean {
  // If the tier is marked as inactive, return false
  if (tier.isActive === false) return false;
  
  // Check if tickets are available
  if (tier.available <= 0) return false;
  
  // // If there's a purchase limit per user, ensure it's positive
  // if (tier.purchaseLimit && tier.purchaseLimit <= 0) return false;
  
  return true;
}

  getTotalTickets(event: Event): number {
    if (!event.ticketTiers?.length) return 0;
    return event.ticketTiers.reduce((sum, tier) => sum + tier.quantity, 0);
  }

  getAvailableTickets(event: Event): number {
    if (!event.ticketTiers?.length) return 0;
    return event.ticketTiers.reduce((sum, tier) => sum + tier.available, 0);
  }

  isSoldOut(event: Event): boolean {
    return this.getAvailableTickets(event) === 0;
  }

  isAlmostSoldOut(event: Event): boolean {
    const available = this.getAvailableTickets(event);
    const total = this.getTotalTickets(event);
    return available > 0 && available / total <= 0.2; // 20% or less remaining
  }

  getEventImage(event: Event): string {
    return event.thumbnailImage || event.bannerImage || '/assets/images/event-default.jpg';
  }

  getEventDescription(event: Event): string {
    const description = event.shortDescription || event.description || '';
    return description.length > 100 ? description.slice(0, 100) + '...' : description;
  }

  resetFilters(): void {
    this.selectedCategory = 'All';
    this.searchTerm = '';
    this.dateFilter = 'upcoming';
    this.searchSubject.next('');
    this.applyFilters();
  }

  isEventUpcoming(event: Event): boolean {
    return new Date(event.startDate) >= new Date();
  }

  trackByEventId(index: number, event: Event): string {
    return event.id;
  }

  trackByCategory(index: number, category: string): string {
    return category;
  }
    
  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-UK', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 2
    }).format(price);
  }

  handleImageError(event: any): void {
  const imgElement = event.target as HTMLImageElement;
  imgElement.src = '/assets/images/event-default.jpg';
  }

  isEventCompleted(event: Event): boolean {
  const eventEndDate = new Date(event.endDate);
  const now = new Date();
  return eventEndDate < now;
}

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    this.isSticky = window.scrollY > 100;
  }
}