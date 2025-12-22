import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, NavigationEnd, Router, RouterModule } from '@angular/router';
import { HeaderComponent } from '../common/header/header.component';
import { HeroSliderComponent } from '../pages/hero-slider/hero-slider.component';
import { FooterComponent } from '../common/footer/footer.component';
import { EventListComponent } from '../event-list/event-list.component';
import { StatsDashboardComponent } from '../pages/stats-dashboard/stats-dashboard.component';
import { ConfirmationComponent } from '../confirmation/confirmation.component';
import { TicketLookupComponent } from '../ticket-lookup/ticket-lookup.component';
import { SocialMediaFeedComponent } from '../pages/social-media-feed/social-media-feed.component';
import { EventService } from '../../core/services/event.service';
import { EventDto } from '../../core/models/DTOs/event.DTO.model';
import { filter } from 'rxjs';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    HeaderComponent, 
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
export class MainComponent {

events: EventDto[] = [];
  isLoading = true;
  eventlistonly = false;
  error: string | null = null;

  constructor(private eventService : EventService,
    private router: Router,
  private activatedRoute: ActivatedRoute)
  {

  }

ngOnInit(): void {
  // Check the current route path
  const currentPath = this.activatedRoute.snapshot.routeConfig?.path || '';
  this.eventlistonly = currentPath === 'events';
  console.log('Initial eventlistonly:', this.eventlistonly);
  
  this.router.events.pipe(
    filter(event => event instanceof NavigationEnd)
  ).subscribe(() => {
    const newPath = this.activatedRoute.snapshot.routeConfig?.path || '';
    this.eventlistonly = newPath === 'events';
    console.log('Updated eventlistonly:', this.eventlistonly);
  });
  
  this.loadEvents();
}

private checkCurrentRoute(url: string): void {
  console.log('Current URL:', url);
  // Check for exact match or starts with
  this.eventlistonly = url === '/events' || url.startsWith('/events/');
  console.log('eventlistonly:', this.eventlistonly);
}

  loadEvents(): void {
    this.isLoading = true;
    this.eventService.getEvents().subscribe({
      next: (events) => {
        this.events = [...events];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading events:', error);
        this.error = 'Failed to load events. Please try again.';
        this.isLoading = false;
      }
    });
  }

  onRetryLoad() {
    this.loadEvents(); // Parent handles the retry
  }
}