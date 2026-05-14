import {
  Component, Input, Output, EventEmitter,
  OnInit, OnDestroy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Artist, Contact, EventConfig, Sponsor } from '../common/event-data';

@Component({
  selector: 'app-hero-split',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hero-split.component.html',
  styleUrls: ['./hero-split.component.scss']
})
export class HeroSplitComponent implements OnInit, OnDestroy {

  @Input() eventConfig!: EventConfig;
  @Input() bannerImages: string[] = [];
  @Input() sponsors: Sponsor[] = [];
  @Input() artists: Artist[] = [];
  @Input() contacts: Contact[] = [];
  @Input() stats: Array<{ number: string; label: string }> = [];
  @Input() venues: any[] = [];
  @Output() scrollTo   = new EventEmitter<string>();
  @Output() buyTickets = new EventEmitter<string>();

  selectedVenueId = '';

  get selectedVenue() {
    return this.venues.find(v => v.id === this.selectedVenueId) ?? this.venues[0];
  }

  get leadArtists(): Artist[] {
    return this.artists.filter(a => a.isLead);
  }

  get supportArtists(): Artist[] {
    return this.artists.filter(a => !a.isLead);
  }

  get platinumSponsors(): Sponsor[] {
    return this.sponsors.filter(s => s.tier === 'platinum' || s.tier === 'gold');
  }

  get supportingSponsors(): Sponsor[] {
    return this.sponsors.filter(s => s.tier === 'silver' || s.tier === 'partner');
  }

  selectVenue(id: string) { this.selectedVenueId = id; }

  handleTicketClick(venue: any) {
    this.buyTickets.emit(venue.eventId);
  }

  // Slider
  currentSlide = 0;
  private sliderInterval: any;
  private readonly AUTO_PLAY_MS = 4500;

  ngOnInit() {
    if (this.venues.length) {
      this.selectedVenueId = this.venues[0].id;
    }
    if (this.bannerImages.length > 1) this.startAutoPlay();
  }

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
}
