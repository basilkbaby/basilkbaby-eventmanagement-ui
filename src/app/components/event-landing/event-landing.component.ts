import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './navbar/navbar.component';
import { HeroSplitComponent } from './hero-split/hero-split.component';
import { ArtistsSectionComponent } from './artists-section/artists-section.component';
import { VenuesSectionComponent } from './venues-section/venues-section.component';
import { ProductionSectionComponent } from './production-section/production-section.component';
import { SponsorsSectionComponent } from './sponsors-section/sponsors-section.component';
import { ContactSectionComponent } from './contact-section/contact-section.component';
import { FooterComponent } from './footer/footer.component';
import { EventConfig, VENUE_DATA, ARTIST_DATA, SPONSOR_DATA, CONTACT_DATA, EVENT_CONFIG } from './common/event-data';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-event-landing',
  standalone: true,
  imports: [
    CommonModule,
    NavbarComponent,
    HeroSplitComponent,
    ArtistsSectionComponent,
    VenuesSectionComponent,
    ProductionSectionComponent,
    SponsorsSectionComponent,
    ContactSectionComponent,
    FooterComponent
  ],
  templateUrl: './event-landing.component.html',
  styleUrls: ['./event-landing.component.scss']
})
export class EventLandingComponent implements OnInit {
  // All data from central file
  eventConfig: EventConfig = EVENT_CONFIG;
  venues = VENUE_DATA;
  artists = ARTIST_DATA;
  sponsors = SPONSOR_DATA;
  contactNumbers = CONTACT_DATA;

  selectedVenueId: string = 'blackpool';
  isScrolled: boolean = false;
  activeSection: string = 'home';
  selectedArtist: any = null;

  ngOnInit() {
    this.checkScroll();
  }

  @HostListener('window:scroll')
  checkScroll() {
    this.isScrolled = window.scrollY > 100;
  }

  constructor(
      private route: ActivatedRoute,
      private router: Router
    ) {}
  

  get selectedVenue() {
    return this.venues.find(v => v.id === this.selectedVenueId) || this.venues[0];
  }

  selectVenue(venueId: string) {
    this.selectedVenueId = venueId;
  }

  scrollToSection(sectionId: string) {
    this.activeSection = sectionId;
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  openArtistModal(artist: any) {
    this.selectedArtist = artist;
  }

  closeArtistModal() {
    this.selectedArtist = null;
  }

  buyTickets(eventId: string) {
    this.router.navigate(['/events', eventId, 'seatmap']); //seatstheatre
    
    // const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
    //   .test(navigator.userAgent);
    // if(isMobile)
    //     this.router.navigate(['/events', eventId, 'mobileseatmap']);
    //     else
    //   this.router.navigate(['/events', eventId, 'seatmap']); //seatstheatre
  }

}