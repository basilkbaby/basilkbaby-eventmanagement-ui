// event-list.component.ts
import { Component, HostListener, OnInit, OnDestroy, ChangeDetectionStrategy, Input, Output, EventEmitter, ChangeDetectorRef, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { HeroSliderComponent } from '../pages/hero-slider/hero-slider.component';
import { LoadingSpinnerComponent } from '../common/loading-spinner/loading-spinner.component';
import { EventDto } from '../../core/models/DTOs/event.DTO.model';
import { FormatDatePipe } from '../../core/pipes/format-date.pipe';

@Component({
  selector: 'app-event-list',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    FormsModule,
    HeroSliderComponent,
    LoadingSpinnerComponent,
    FormatDatePipe // Add the pipe here
  ],
  templateUrl: './event-list.component.html',
  styleUrls: ['./event-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventListComponent implements OnInit, OnDestroy, OnChanges {
  @Input() events: EventDto[] = [];
  @Input() isLoading: boolean = true;
  @Input() error: string | null = null; // Make error an input too
  
  @Output() retryLoad = new EventEmitter<void>(); // Emit when retry is clicked
  @Output() filterChanged = new EventEmitter<{
    searchTerm: string;
    dateFilter: 'upcoming' | 'past' | 'all';
  }>(); // Emit filter changes if parent needs to know
  
  filteredEvents: EventDto[] = [];
  searchTerm: string = '';
  
  isSticky: boolean = false;
  dateFilter: 'upcoming' | 'past' | 'all' = 'upcoming';

  public searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.setupSearchDebounce();
    this.applyFilters(); // Initial filter on init
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Detect when events input changes
    if (changes['events'] || changes['isLoading'] || changes['error']) {
      console.log('Input changed - events:', this.events?.length, 'loading:', this.isLoading);
      
      if (!this.isLoading && this.events) {
        this.applyFilters();
      }
      
      // Trigger change detection for OnPush
      this.cdr.markForCheck();
    }
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
        this.emitFilterChanges(); // Notify parent if needed
        this.cdr.markForCheck();
      });
  }

  onSearchInput(inputevent: any): void {
    const value = (inputevent.target as HTMLInputElement).value;
    this.searchSubject.next(value);
  }

  // New method to handle clear search button
  resetSearch(): void {
    this.searchSubject.next('');
  }

  private applyFilters(): void {
    if (this.isLoading || !this.events) {
      this.filteredEvents = [];
      return;
    }

    console.log('Applying filters to', this.events.length, 'events');
    
    this.filteredEvents = this.events.filter(event => {
      if (!event) return false;
      
      // Date filtering
      let matchesDate = true;
      if (event.startDate) {
        const eventDate = new Date(event.startDate);
        const now = new Date();
        matchesDate = this.matchesDateFilter(eventDate, now);
      }
      
      // Search filtering
      let matchesSearch = true;
      if (this.searchTerm) {
        const searchLower = this.searchTerm.toLowerCase();
        matchesSearch = 
          event.title?.toLowerCase().includes(searchLower) ||
          event.description?.toLowerCase().includes(searchLower) ||
          event.venueName?.toLowerCase().includes(searchLower) ||
          event.venueCity?.toLowerCase().includes(searchLower) ||
          false;
      }
      
      return matchesDate && matchesSearch;
    });
    
    console.log('Filtered to', this.filteredEvents.length, 'events');
  }

  private matchesDateFilter(eventDate: Date, now: Date): boolean {
    // Normalize dates to compare only date parts (not time)
    const normalizedEventDate = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
    const normalizedNow = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (this.dateFilter) {
      case 'upcoming':
        return normalizedEventDate >= normalizedNow;
      case 'past':
        return normalizedEventDate < normalizedNow;
      case 'all':
        return true;
      default:
        return normalizedEventDate >= normalizedNow;
    }
  }

  filterByDate(dateFilter: 'upcoming' | 'past' | 'all'): void {
    this.dateFilter = dateFilter;
    this.applyFilters();
    this.emitFilterChanges();
    this.cdr.markForCheck();
  }

  // Remove formatDate method - use pipe instead

  resetFilters(): void {
    this.searchTerm = '';
    this.dateFilter = 'upcoming';
    this.searchSubject.next('');
    this.applyFilters();
    this.emitFilterChanges();
    this.cdr.markForCheck();
  }

  // Emit filter changes to parent if needed
  private emitFilterChanges(): void {
    this.filterChanged.emit({
      searchTerm: this.searchTerm,
      dateFilter: this.dateFilter
    });
  }

  // Handle retry button click
  retryLoadEvents(): void {
    this.retryLoad.emit();
  }

  handleImageError(event: any): void {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = '/assets/images/event-default.jpg';
  }

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    this.isSticky = window.scrollY > 100;
    this.cdr.markForCheck();
  }
}