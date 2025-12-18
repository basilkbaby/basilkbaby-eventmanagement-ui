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
export class MainComponent {}