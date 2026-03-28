import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CartService } from '../../core/services/cart.service';
import { EventService } from '../../core/services/event.service';
import { EventDetailDto } from '../../core/models/DTOs/event.DTO.model';
import { OrganizationType } from '../../core/models/Enums/event.enums';
import { FormatDatePipe } from '../../core/pipes/format-date.pipe';
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
export class EventDetailsComponent implements OnInit, OnDestroy {

  event: EventDetailDto | null = null;
  loading = true;

  readonly OrganizationType = OrganizationType;


  // ── Future: when EventDetailDto gains eventType ─────────────────────────────
  //
  //   get eventType(): 'seated' | 'general' {
  //     return (this.event as any)?.eventType ?? 'seated';
  //   }
  //
  //   Seated  → navigates to /events/:id/seatmap (current)
  //   General → renders inline ticket-type + qty picker from API (coming soon)
  //             requires: event.ticketTiers: TicketTierDto[]
  // ────────────────────────────────────────────────────────────────────────────

  private routeSub?: Subscription;
  private cartSub?:  Subscription;

  constructor(
    private route:        ActivatedRoute,
    private router:       Router,
    private cartService:  CartService,
    private eventService: EventService
  ) {}

  ngOnInit(): void {
    this.routeSub = this.route.params.subscribe(params => this.loadEventDetails(params['id']));
    this.cartSub  = this.cartService.currentCartState$.subscribe();
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
    this.cartSub?.unsubscribe();
  }

  loadEventDetails(id: string): void {
    this.loading = true;
    this.eventService.getEventDetails(id).subscribe({
      next:  ev  => { this.event = ev; this.loading = false; },
      error: err => { console.error('Error loading event:', err); this.loading = false; }
    });
  }

  getEventImage(): string {
    if (!this.event) return '';
    return this.event.bannerImage
        || this.event.thumbnailImage
        || 'assets/images/events/default-banner.jpg';
  }

  navigateToSeatSelection(): void {
    if (!this.event || this.event.isPast) return;
    // Single route — seatmap component handles its own responsive layout.
    // Mobile/desktop user-agent split removed; use CSS media queries instead.
    this.router.navigate(['/events', this.event.id, 'seatmap']);
  }

  shareEvent(): void {
    if (navigator.share && this.event) {
      navigator.share({ title: this.event.title, text: this.event.shortDescription, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  }
}