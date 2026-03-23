import {
  Component, Input, Output, EventEmitter,
  OnInit, OnDestroy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Sponsor } from '../common/event-data';

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
  @Output() buyTickets = new EventEmitter<void>();

  selectedVenueId = 'blackpool';

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

  leadArtists = ['Nadirshah', 'Ranjini Jose', 'Samad Sulaiman', 'Dayana Hameed'];

  // Replace logo: '' with actual asset paths e.g. 'assets/sponsors/kerala-curry.png'
  mainSponsors = [
    { name: 'Kerala Curry House',        logo: 'assets/images/events/nadirshow/sponsors/curryhouse.jpg' },
    { name: 'Paul John & Co Solicitors', logo: 'assets/images/events/nadirshow/sponsors/pjc.svg' },
    { name: 'Shan Properties',           logo: 'assets/images/events/nadirshow/sponsors/shan.jpg' },
    { name: 'Life Line Mortgage',        logo: 'assets/images/events/nadirshow/sponsors/lifeline.png' },
  ];

  supportingSponsors = [
    { name: 'Chrystal Hyper Market', logo: 'assets/images/events/nadirshow/sponsors/chrystal-hyper-market.png' },
    { name: 'Family Shop',           logo: 'assets/images/events/nadirshow/sponsors/family-shop.png' },
    { name: 'Seacom Accountancy',    logo: 'assets/images/events/nadirshow/sponsors/seacom-accountancy.png' },
    { name: 'Music List',            logo: 'assets/images/events/nadirshow/sponsors/music-list.png' },
    { name: 'Ethal',                 logo: 'assets/images/events/nadirshow/sponsors/ethal.png' },
  ];
}