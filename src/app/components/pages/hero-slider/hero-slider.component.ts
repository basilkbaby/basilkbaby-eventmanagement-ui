// hero-slider.component.ts
import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ChangeDetectorRef, OnChanges, SimpleChanges } from '@angular/core';
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
export class HeroSliderComponent implements OnInit, OnDestroy, OnChanges {
  @Input() events: EventDto[] = [];
  @Input() isLoading: boolean = false;
  @Output() scrollToEvents = new EventEmitter<void>();

  currentSlide = 0;
  isDarkTheme = false;
  private autoSlideInterval: any;

  // Filter featured events
  get featuredEvents(): EventDto[] {
    if (!this.events) return [];
    return this.events.filter(event => event.featured);
  }

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    if (this.featuredEvents.length > 0) {
      this.startAutoSlide();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // When events input changes, update slider
    if (changes['events']) {
      console.log('Hero slider events updated:', this.events?.length);
      
      // Reset to first slide if events change
      if (this.featuredEvents.length > 0) {
        this.currentSlide = 0;
        
        // Restart autoslide if it was running
        if (this.autoSlideInterval) {
          this.resetAutoSlide();
        } else {
          this.startAutoSlide();
        }
      } else {
        // Stop autoslide if no events
        this.stopAutoSlide();
      }
      
      this.cdr.markForCheck();
    }
  }

  ngOnDestroy() {
    this.stopAutoSlide();
  }

  nextSlide() {
    if (this.featuredEvents.length === 0) return;
    
    this.currentSlide = (this.currentSlide + 1) % this.featuredEvents.length;
    this.resetAutoSlide();
    this.cdr.markForCheck();
  }

  prevSlide() {
    if (this.featuredEvents.length === 0) return;
    
    this.currentSlide = (this.currentSlide - 1 + this.featuredEvents.length) % this.featuredEvents.length;
    this.resetAutoSlide();
    this.cdr.markForCheck();
  }

  goToSlide(index: number) {
    if (this.featuredEvents.length === 0) return;
    
    this.currentSlide = Math.min(Math.max(0, index), this.featuredEvents.length - 1);
    this.resetAutoSlide();
    this.cdr.markForCheck();
  }

  onScrollToEvents() {
    this.scrollToEvents.emit();
  }

  private startAutoSlide() {
    if (this.featuredEvents.length <= 1) return; // Don't autoslide if only 1 or 0 events
    
    this.stopAutoSlide(); // Clear any existing interval
    this.autoSlideInterval = setInterval(() => {
      this.nextSlide();
    }, 5000);
  }

  private stopAutoSlide() {
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
      this.autoSlideInterval = null;
    }
  }

  private resetAutoSlide() {
    this.stopAutoSlide();
    this.startAutoSlide();
  }
}