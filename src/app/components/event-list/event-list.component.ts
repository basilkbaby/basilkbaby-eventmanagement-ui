import {
  Component, OnInit, OnDestroy, OnChanges, SimpleChanges,
  ChangeDetectionStrategy, ChangeDetectorRef,
  Input, Output, EventEmitter
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { LoadingSpinnerComponent } from '../common/loading-spinner/loading-spinner.component';
import { EventDto } from '../../core/models/DTOs/event.DTO.model';
import { FormatDatePipe } from '../../core/pipes/format-date.pipe';

@Component({
  selector: 'app-event-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, LoadingSpinnerComponent, FormatDatePipe],
  templateUrl: './event-list.component.html',
  styleUrls: ['./event-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventListComponent implements OnInit, OnDestroy, OnChanges {

  @Input() events: EventDto[]  = [];
  @Input() isLoading           = true;
  @Input() error: string | null = null;

  @Output() retryLoad     = new EventEmitter<void>();
  @Output() filterChanged = new EventEmitter<{ searchTerm: string; dateFilter: 'upcoming' | 'past' | 'all' }>();

  filteredEvents: EventDto[]              = [];
  searchTerm                              = '';
  dateFilter: 'upcoming' | 'past' | 'all' = 'upcoming';

  readonly searchSubject = new Subject<string>();
  private destroy$       = new Subject<void>();

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(term => {
      this.searchTerm = term;
      this.applyFilters();
      this.emitFilterChanges();
      this.cdr.markForCheck();
    });

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

  onSearchInput(e: Event): void {
    this.searchSubject.next((e.target as HTMLInputElement).value);
  }

  resetSearch(): void { this.searchSubject.next(''); }

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

  retryLoadEvents(): void { this.retryLoad.emit(); }

  handleImageError(e: Event): void {
    (e.target as HTMLImageElement).src = '/assets/images/event-default.jpg';
  }

  private applyFilters(): void {
    if (this.isLoading || !this.events) { this.filteredEvents = []; return; }

    const search = this.searchTerm.toLowerCase();

    this.filteredEvents = this.events.filter(ev => {
      if (!ev) return false;

      const matchesDate = ev.startDate
        ? this.matchesDateFilter(new Date(ev.startDate), new Date())
        : true;

      const matchesSearch = !search || (
        ev.title?.toLowerCase().includes(search) ||
        ev.description?.toLowerCase().includes(search) ||
        ev.venueName?.toLowerCase().includes(search) ||
        ev.venueCity?.toLowerCase().includes(search)
      );

      return matchesDate && matchesSearch;
    });
  }

  private matchesDateFilter(eventDate: Date, now: Date): boolean {
    const ed = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
    const nd = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    switch (this.dateFilter) {
      case 'upcoming': return ed >= nd;
      case 'past':     return ed < nd;
      default:         return true;
    }
  }

  private emitFilterChanges(): void {
    this.filterChanged.emit({ searchTerm: this.searchTerm, dateFilter: this.dateFilter });
  }
}