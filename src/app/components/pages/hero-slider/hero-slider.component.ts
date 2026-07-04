import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EventDto } from '../../../core/models/DTOs/event.DTO.model';
import { FormatDatePipe } from '../../../core/pipes/format-date.pipe';
import { FormatTimePipe } from '../../../core/pipes/common/time-format.pipe';

@Component({
  selector: 'app-hero-slider',
  standalone: true,
  imports: [CommonModule, RouterModule, FormatDatePipe, FormatTimePipe],
  templateUrl: './hero-slider.component.html',
  styleUrls: ['./hero-slider.component.scss']
})
export class HeroSliderComponent implements OnChanges {
  @Input() events: EventDto[] = [];
  @Input() isLoading: boolean = false;
  @Output() scrollToEvents = new EventEmitter<void>();

  // Featured events partitioned by group. A single group keeps the current
  // behaviour (one hero with venue chips); multiple groups render one hero each.
  groups: EventDto[][] = [];
  // Currently selected venue index within each group (parallel to `groups`).
  selectedIndices: number[] = [];

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['events']) {
      this.buildGroups();
      this.cdr.markForCheck();
    }
  }

  get hasFeatured(): boolean {
    return this.groups.length > 0;
  }

  /**
   * Partition featured events by groupId. Events that share a groupId form one
   * group (shown together via the venue selector); events without a groupId each
   * stand alone as their own single-event group. Order is preserved.
   */
  private buildGroups(): void {
    const featured = (this.events || []).filter(e => e.featured);
    const byId = new Map<string, EventDto[]>();
    const groups: EventDto[][] = [];

    for (const ev of featured) {
      if (ev.groupId) {
        let arr = byId.get(ev.groupId);
        if (!arr) {
          arr = [];
          byId.set(ev.groupId, arr);
          groups.push(arr);
        }
        arr.push(ev);
      } else {
        groups.push([ev]);
      }
    }

    this.groups = groups;
    this.selectedIndices = groups.map(() => 0);
  }

  selectedEvent(groupIndex: number): EventDto | null {
    return this.groups[groupIndex]?.[this.selectedIndices[groupIndex]] ?? null;
  }

  selectEvent(groupIndex: number, index: number): void {
    this.selectedIndices[groupIndex] = index;
    this.cdr.markForCheck();
  }

  onScrollToEvents(): void {
    this.scrollToEvents.emit();
  }

  formatShortDate(dateStr: Date | string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const day = d.getDate();
    const ordinals = ['th','st','nd','rd'];
    const v = day % 100;
    const suffix = ordinals[(v - 20) % 10] ?? ordinals[v] ?? 'th';
    const month = d.toLocaleString('en-GB', { month: 'short' }).toUpperCase();
    return `${day}${suffix} ${month}`;
  }
}
