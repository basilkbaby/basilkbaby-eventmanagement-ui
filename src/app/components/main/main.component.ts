import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
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
  error: string | null = null;

  constructor(private eventService : EventService)
  {

  }

  ngOnInit(): void {
    this.loadEvents();
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