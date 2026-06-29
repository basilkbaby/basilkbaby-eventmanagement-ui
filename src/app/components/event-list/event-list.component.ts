// event-list.component.ts
import { Component, HostListener, OnInit, OnDestroy, ChangeDetectionStrategy, Input, Output, EventEmitter, ChangeDetectorRef, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { HeroSliderComponent } from '../pages/hero-slider/hero-slider.component';
import { LoadingSpinnerComponent } from '../common/loading-spinner/loading-spinner.component';
import { EventDto } from '../../core/models/DTOs/event.DTO.model';
import { FormatDatePipe } from '../../core/pipes/format-date.pipe';
import { collapseByGroup, DisplayEvent } from '../../core/utils/event-group.util';

interface EventGroup {
  label: string;
  events: DisplayEvent[];
}

const MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December'];

const TYPE_LABELS: Record<number, string> = {
  1: 'Music', 2: 'Conference', 3: 'Workshop',
  4: 'Seminar', 5: 'Networking', 6: 'Social', 7: 'Event'
};

@Component({
  selector: 'app-event-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    HeroSliderComponent,
    LoadingSpinnerComponent,
    FormatDatePipe
  ],
  templateUrl: './event-list.component.html',
  styleUrls: ['./event-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventListComponent implements OnInit, OnDestroy, OnChanges {
  @Input() events: EventDto[] = [];
  @Input() isLoading: boolean = true;
  @Input() error: string | null = null;
  // When true, events of the same group collapse to one card linking to the group page.
  @Input() collapseGroups: boolean = false;

  @Output() retryLoad = new EventEmitter<void>();
  @Output() filterChanged = new EventEmitter<{
    searchTerm: string;
    dateFilter: 'upcoming' | 'past' | 'all';
  }>();

  filteredEvents: DisplayEvent[] = [];
  groupedEvents: EventGroup[] = [];
  searchTerm: string = '';
  dateFilter: 'upcoming' | 'past' | 'all' = 'upcoming';
  isSticky: boolean = false;

  public searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(private cdr: ChangeDetectorRef, private router: Router) {}

  // Navigate to the group page from a card without triggering the card's own link.
  openGroup(ev: EventDto, domEvent: Event): void {
    domEvent.preventDefault();
    domEvent.stopPropagation();
    if (ev.groupId) {
      this.router.navigate(['/group', ev.groupId]);
    }
  }

  ngOnInit(): void {
    this.setupSearchDebounce();
    this.applyFilters();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['events'] || changes['isLoading'] || changes['error']) {
      if (!this.isLoading && this.events) this.applyFilters();
      this.cdr.markForCheck();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupSearchDebounce(): void {
    this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(term => {
        this.searchTerm = term;
        this.applyFilters();
        this.emitFilterChanges();
        this.cdr.markForCheck();
      });
  }

  onSearchInput(event: any): void {
    this.searchSubject.next((event.target as HTMLInputElement).value);
  }

  resetSearch(): void { this.searchSubject.next(''); }

  private applyFilters(): void {
    if (this.isLoading || !this.events) {
      this.filteredEvents = [];
      this.groupedEvents = [];
      return;
    }

    const now = new Date();
    const norm = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

    let result = this.events.filter(ev => {
      if (!ev) return false;

      let matchesDate = true;
      if (ev.startDate) {
        const evDate = norm(new Date(ev.startDate));
        const today  = norm(now);
        if (this.dateFilter === 'upcoming') matchesDate = evDate >= today;
        else if (this.dateFilter === 'past') matchesDate = evDate < today;
      }

      let matchesSearch = true;
      if (this.searchTerm) {
        const q = this.searchTerm.toLowerCase();
        matchesSearch =
          ev.title?.toLowerCase().includes(q) ||
          ev.description?.toLowerCase().includes(q) ||
          ev.venueName?.toLowerCase().includes(q) ||
          ev.venueCity?.toLowerCase().includes(q) ||
          false;
      }

      return matchesDate && matchesSearch;
    });

    // Sort: upcoming → ascending, past → descending, all → ascending
    result = result.sort((a, b) => {
      const da = new Date(a.startDate).getTime();
      const db = new Date(b.startDate).getTime();
      return this.dateFilter === 'past' ? db - da : da - db;
    });

    // On the homepage, collapse each group to a single representative card.
    const display: DisplayEvent[] = this.collapseGroups ? collapseByGroup(result) : result;

    this.filteredEvents = display;
    this.groupedEvents  = this.buildGroups(display);
  }

  // Card routing / title differ for a group representative vs a single event.
  cardLink(ev: DisplayEvent): any[] {
    return ev._isGroup ? ['/group', ev.groupId] : ['/events', ev.id];
  }

  cardTitle(ev: DisplayEvent): string {
    return ev._isGroup ? (ev.groupName || ev.title) : ev.title;
  }

  private buildGroups(events: DisplayEvent[]): EventGroup[] {
    const map = new Map<string, EventDto[]>();

    for (const ev of events) {
      if (!ev.startDate) continue;
      const d = new Date(ev.startDate);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(ev);
    }

    return Array.from(map.entries()).map(([key, evts]) => {
      const [y, m] = key.split('-').map(Number);
      return { label: `${MONTHS[m - 1]} ${y}`, events: evts };
    });
  }

  getTypeLabel(type: number): string {
    return TYPE_LABELS[type] ?? 'Event';
  }

  isLimitedAvailability(ev: EventDto): boolean {
    return !ev.isPast && ev.isActive && ev.hasAvailableSeats &&
           ev.totalSeats > 0 && ev.availableSeats / ev.totalSeats < 0.20;
  }

  bookedPercent(ev: EventDto): number {
    if (!ev.totalSeats) return 0;
    return Math.round(((ev.totalSeats - ev.availableSeats) / ev.totalSeats) * 100);
  }

  filterByDate(f: 'upcoming' | 'past' | 'all'): void {
    this.dateFilter = f;
    this.applyFilters();
    this.emitFilterChanges();
    this.cdr.markForCheck();
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.dateFilter = 'upcoming';
    this.searchSubject.next('');
    this.applyFilters();
    this.emitFilterChanges();
    this.cdr.markForCheck();
  }

  private emitFilterChanges(): void {
    this.filterChanged.emit({ searchTerm: this.searchTerm, dateFilter: this.dateFilter });
  }

  retryLoadEvents(): void { this.retryLoad.emit(); }

  handleImageError(event: any): void {
    (event.target as HTMLImageElement).src = '/assets/images/event-default.jpg';
  }

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    this.isSticky = window.scrollY > 100;
    this.cdr.markForCheck();
  }
}
