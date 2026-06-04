import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './navbar/navbar.component';
import { HeroSplitComponent } from './hero-split/hero-split.component';
import { ArtistsSectionComponent } from './artists-section/artists-section.component';
import { VenuesSectionComponent } from './venues-section/venues-section.component';
import { ContactSectionComponent } from './contact-section/contact-section.component';
import { FooterComponent } from './footer/footer.component';
import { EventConfig, getEventData } from './common/event-data';
import { environment } from '../../../environments/environment';
import { ActivatedRoute, Router } from '@angular/router';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';

@Component({
  selector: 'app-event-landing',
  standalone: true,
  imports: [
    CommonModule,
    NavbarComponent,
    HeroSplitComponent,
    ArtistsSectionComponent,
    VenuesSectionComponent,
    ContactSectionComponent,
    PrivacyPolicyComponent,
    FooterComponent
  ],
  templateUrl: './event-landing.component.html',
  styleUrls: ['./event-landing.component.scss']
})
export class EventLandingComponent implements OnInit {
  private readonly _data = getEventData(environment.companyId);
  eventConfig: EventConfig = this._data.eventConfig;
  venues = this._data.venues;
  artists = this._data.artists;
  sponsors = this._data.sponsors;
  contactNumbers = this._data.contacts;

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