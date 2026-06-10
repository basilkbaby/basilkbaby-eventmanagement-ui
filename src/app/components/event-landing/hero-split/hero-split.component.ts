import {
  Component, Input, Output, EventEmitter,
  OnInit, OnDestroy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Sponsor, HeroSponsor, Contact } from '../common/event-data';

@Component({
  selector: 'app-hero-split',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hero-split.component.html',
  styleUrls: ['./hero-split.component.scss']
})
export class HeroSplitComponent implements OnInit, OnDestroy {

  @Input() bannerImages: string[] = [];
  @Input() sponsors: Sponsor[] = [];
  @Input() stats: Array<{ number: string; label: string }> = [];
  @Input() venues: any[] = [];
  @Output() scrollTo  = new EventEmitter<string>();
  @Output() buyTickets = new EventEmitter<string>();

  selectedVenueId = '';

  get selectedVenue() {
    return this.venues.find(v => v.id === this.selectedVenueId) || this.venues[0];
  }

  selectVenue(id: string) { this.selectedVenueId = id; }

  // Slider
  currentSlide = 0;
  private sliderInterval: any;
  private readonly AUTO_PLAY_MS = 4500;

  ngOnInit()    { if (this.bannerImages.length > 1) this.startAutoPlay(); }
  ngOnDestroy() { this.stopAutoPlay(); }

  goToSlide(i: number) {
    if (i === this.currentSlide) return;
    this.currentSlide = i;
    this.stopAutoPlay();
    this.startAutoPlay();
  }

  nextSlideAction() {
    this.goToSlide((this.currentSlide + 1) % this.bannerImages.length);
  }

  prevSlideAction() {
    this.goToSlide((this.currentSlide - 1 + this.bannerImages.length) % this.bannerImages.length);
  }

  private startAutoPlay() {
    if (this.bannerImages.length <= 1) return;
    this.sliderInterval = setInterval(() => this.nextSlideAction(), this.AUTO_PLAY_MS);
  }

  private stopAutoPlay() {
    if (this.sliderInterval) { clearInterval(this.sliderInterval); this.sliderInterval = null; }
  }

  @Input() eyebrow: string = '';
  @Input() mainTitle: { line1: string; line2: string; year: string } = { line1: '', line2: '', year: '' };
  @Input() tags: string[] = [];
  @Input() supportArtistsLines: string[] = [];
  @Input() contacts: Contact[] = [];
  @Input() leadArtists: string[] = [];
  @Input() mainSponsors: HeroSponsor[] = [];
  @Input() supportingSponsors: HeroSponsor[] = [];

  handleTicketClick(venue: any) {
   this.buyTickets.emit(venue.eventId);
    // "Soon" venues: button is disabled so click is blocked at template level
  }

}