import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EventDto } from '../../../core/models/DTOs/event.DTO.model';
import { FormatDatePipe } from '../../../core/pipes/format-date.pipe';

@Component({
  selector: 'app-hero-slider',
  standalone: true,
  imports: [CommonModule, RouterModule, FormatDatePipe],
  templateUrl: './hero-slider.component.html',
  styleUrls: ['./hero-slider.component.scss']
})
export class HeroSliderComponent implements OnChanges {
  @Input() events: EventDto[] = [];
  @Input() isLoading: boolean = false;
  @Output() scrollToEvents = new EventEmitter<void>();

  selectedIndex = 0;

  get featuredEvents(): EventDto[] {
    if (!this.events) return [];
    return this.events.filter(e => e.featured);
  }

  get selectedEvent(): EventDto | null {
    return this.featuredEvents[this.selectedIndex] ?? null;
  }

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['events']) {
      this.selectedIndex = 0;
      this.cdr.markForCheck();
    }
  }

  selectEvent(index: number): void {
    this.selectedIndex = index;
    this.cdr.markForCheck();
  }

  onScrollToEvents(): void {
    this.scrollToEvents.emit();
  }
}
