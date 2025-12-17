import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

interface VenueSection {
  id: string;
  name: string;
  price: number;
  color: string;
  accentColor: string;
  description: string;
  icon: string;
  availableSeats: number;
  totalSeats: number;
  benefits: string[];
  layout: 'center' | 'left-right' | 'multiple' | 'standing-only';
  popular: boolean;
  percentageSold: number;
}

@Component({
  selector: 'app-section-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './section-details.component.html',
  styleUrls: ['./section-details.component.scss']
})
export class SectionDetailsComponent {
  @Input() sections: VenueSection[] = [];
  @Input() selectedSection: VenueSection | null = null;
  @Output() sectionSelected = new EventEmitter<VenueSection>();

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-UK', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0
    }).format(price);
  }

  getLayoutName(layout: string): string {
    return layout.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }

  getViewQuality(sectionId: string): number {
    const qualities = {
      'vip': 95,
      'diamond': 85,
      'gold': 70,
      'standing': 60
    };
    return qualities[sectionId as keyof typeof qualities] || 70;
  }

  getBenefitIcon(index: number): string {
    const icons = ['👁️', '⭐', '⚡', '🎯', '🏆', '✨'];
    return icons[index] || '✅';
  }

  selectSection(section: VenueSection): void {
    if (section.availableSeats === 0) return;
    this.sectionSelected.emit(section);
  }

  getPopularText(section: VenueSection): string {
    return section.popular ? '🔥 Popular' : '';
  }

  getAvailabilityClass(section: VenueSection): string {
    if (section.availableSeats === 0) return 'sold-out';
    if (section.availableSeats < section.totalSeats * 0.2) return 'low';
    return '';
  }

  getAvailabilityText(section: VenueSection): string {
    if (section.availableSeats === 0) return 'Sold Out';
    return `${section.availableSeats} ${section.id === 'standing' ? 'spots' : 'seats'} left`;
  }
}