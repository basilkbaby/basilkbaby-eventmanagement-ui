import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, NavigationEnd, Router, RouterModule } from '@angular/router';
import { HeroSliderComponent } from '../pages/hero-slider/hero-slider.component';
import { FooterComponent } from '../common/footer/footer.component';
import { EventListComponent } from '../event-list/event-list.component';
import { StatsDashboardComponent } from '../pages/stats-dashboard/stats-dashboard.component';
import { ConfirmationComponent } from '../confirmation/confirmation.component';
import { TicketLookupComponent } from '../ticket-lookup/ticket-lookup.component';
import { SocialMediaFeedComponent } from '../pages/social-media-feed/social-media-feed.component';
import { EventService } from '../../core/services/event.service';
import { EventDto } from '../../core/models/DTOs/event.DTO.model';
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    HeroSliderComponent,
    SocialMediaFeedComponent,
    FooterComponent,
    EventListComponent,
    StatsDashboardComponent,
    ConfirmationComponent,
    TicketLookupComponent
  ],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent implements OnInit, OnDestroy {

  events: EventDto[]         = [];
  featuredEvents: EventDto[] = [];
  isLoading                  = true;
  eventlistonly              = false;
  error: string | null       = null;

  searchQuery = '';
  howTab: 'buyer' | 'general' | 'bespoke' = 'buyer';

  private routerSub: Subscription | undefined;

  constructor(
    private eventService: EventService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Use router URL directly — more reliable than routeConfig.path
    this.eventlistonly = this.isEventsListUrl(this.router.url);

    this.routerSub = this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: any) => {
      this.eventlistonly = this.isEventsListUrl(e.urlAfterRedirects || e.url);
    });

    // Redirect ticket QR params if present
    this.activatedRoute.queryParams.subscribe(params => {
      if (params['orderId'] && params['ticketId'] && params['code']) {
        this.router.navigate(['/ticket-info'], { queryParams: params, replaceUrl: true });
      }
    });

    this.loadEvents();
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
  }

  /** True only when the URL is exactly /events (not /events/123 etc) */
  private isEventsListUrl(url: string): boolean {
    const path = url.split('?')[0].replace(/\/$/, '');
    return path === '/events';
  }

  loadEvents(): void {
    this.isLoading = true;
    this.eventService.getEvents().subscribe({
      next: (events) => {
        this.events = [...events];
        this.featuredEvents = events
          .filter(e => !e.isPast)
          .slice(0, 6);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading events:', error);
        this.error = 'Failed to load events. Please try again.';
        this.isLoading = false;
      }
    });
  }

  onRetryLoad(): void {
    this.loadEvents();
  }

  onSearch(): void {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/events'], { queryParams: { q: this.searchQuery.trim() } });
    } else {
      this.router.navigate(['/events']);
    }
  }
}