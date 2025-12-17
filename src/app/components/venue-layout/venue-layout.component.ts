import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

export interface VenueSection {
  id: string;
  name: string;
  type: 'vip' | 'floor' | 'lower' | 'balcony' | 'standard';
  price: number;
  available: number;
  capacity: number;
  rows: number;
  seatsPerRow: number;
  seatType: 'armchair' | 'floor' | 'stadium' | 'box';
  hasTables?: boolean;
}

@Component({
  selector: 'app-venue-layout',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './venue-layout.component.html',
  styleUrls: ['./venue-layout.component.scss']
})
export class VenueLayoutComponent {
  @Input() event: any;
  @Output() sectionSelected = new EventEmitter<VenueSection>();

  constructor(private router: Router)
  {

  }

  venueSections: VenueSection[] = [
    {
      id: 'vip1',
      name: 'VIP Tables',
      type: 'vip',
      price: 299.99,
      available: 24,
      capacity: 24,
      rows: 3,
      seatsPerRow: 8,
      seatType: 'armchair',
      hasTables: true
    },
    {
      id: 'floor1',
      name: 'Floor Standing',
      type: 'floor',
      price: 199.99,
      available: 150,
      capacity: 150,
      rows: 1,
      seatsPerRow: 150,
      seatType: 'floor'
    },
    {
      id: 'lower1',
      name: 'Lower Bowl Center',
      type: 'lower',
      price: 149.99,
      available: 200,
      capacity: 200,
      rows: 10,
      seatsPerRow: 20,
      seatType: 'stadium'
    },
    {
      id: 'lower2',
      name: 'Lower Bowl Sides',
      type: 'lower',
      price: 129.99,
      available: 180,
      capacity: 180,
      rows: 9,
      seatsPerRow: 20,
      seatType: 'stadium'
    },
    {
      id: 'balcony1',
      name: 'Balcony Center',
      type: 'balcony',
      price: 99.99,
      available: 120,
      capacity: 120,
      rows: 6,
      seatsPerRow: 20,
      seatType: 'stadium'
    },
    {
      id: 'balcony2',
      name: 'Balcony Sides',
      type: 'balcony',
      price: 79.99,
      available: 100,
      capacity: 100,
      rows: 5,
      seatsPerRow: 20,
      seatType: 'stadium'
    },
    {
      id: 'standard1',
      name: 'Upper Level',
      type: 'standard',
      price: 59.99,
      available: 80,
      capacity: 80,
      rows: 4,
      seatsPerRow: 20,
      seatType: 'stadium'
    }
  ];

  selectedSection: VenueSection | null = null;

 selectSection(section: VenueSection): void {
    this.selectedSection = section;
    this.sectionSelected.emit(section);
    
    // Navigate to seat map when a section is selected
    // Navigate to seat map when a section is selected
    if (this.event && this.event.id) {
      this.router.navigate(['/seat-map', this.event.id, section.id]);
    } else {
      console.error('Event ID is missing');
    }
    
  }

  getSectionColor(section: VenueSection): string {
    const colorMap: { [key: string]: { bg: string, text: string } } = {
      'vip': { bg: '#1f2937', text: '#ffffff' },
      'floor': { bg: '#374151', text: '#ffffff' },
      'lower': { bg: '#4b5563', text: '#ffffff' },
      'balcony': { bg: '#6b7280', text: '#ffffff' },
      'standard': { bg: '#9ca3af', text: '#1f2937' }
    };
    return colorMap[section.type].bg;
  }

  getSectionTextColor(section: VenueSection): string {
    const colorMap: { [key: string]: { bg: string, text: string } } = {
      'vip': { bg: '#1f2937', text: '#ffffff' },
      'floor': { bg: '#374151', text: '#ffffff' },
      'lower': { bg: '#4b5563', text: '#ffffff' },
      'balcony': { bg: '#6b7280', text: '#ffffff' },
      'standard': { bg: '#9ca3af', text: '#1f2937' }
    };
    return colorMap[section.type].text;
  }

  getSeatColor(section: VenueSection, seatIndex: number): string {
    const totalSeats = section.rows * section.seatsPerRow;
    const availablePercentage = (section.available / section.capacity) * 100;
    const seatNumber = seatIndex + 1;
    
    // Simulate some seats being taken based on availability
    if (seatNumber > section.available) {
      return '#dc2626'; // Red for taken seats
    }
    
    return this.getSectionColor(section);
  }

  generateSeats(section: VenueSection): number[][] {
    const seats: number[][] = [];
    for (let i = 0; i < section.rows; i++) {
      const row: number[] = [];
      for (let j = 0; j < section.seatsPerRow; j++) {
        row.push(i * section.seatsPerRow + j + 1);
      }
      seats.push(row);
    }
    return seats;
  }

  getSectionClass(section: VenueSection): string {
    const baseClass = `section-${section.type}`;
    const selectedClass = this.selectedSection?.id === section.id ? 'selected' : '';
    const availableClass = section.available > 0 ? 'available' : 'sold-out';
    return `${baseClass} ${selectedClass} ${availableClass}`;
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-UK', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0
    }).format(price);
  }

  getFilteredSections(type: string): VenueSection[] {
    return this.venueSections.filter(section => section.type === type);
  }

  getSeatTypeIcon(section: VenueSection): string {
    const iconMap = {
      'armchair': '🪑',
      'floor': '👥',
      'stadium': '💺',
      'box': '🎭'
    };
    return iconMap[section.seatType];
  }

  getSeatTypeLabel(section: VenueSection): string {
    const labelMap = {
      'armchair': 'Premium Armchairs',
      'floor': 'Standing Floor',
      'stadium': 'Stadium Seating',
      'box': 'Private Box'
    };
    return labelMap[section.seatType];
  }

  getSeatTypeDescription(section: VenueSection): string {
  const descriptionMap = {
    'armchair': 'Premium padded armchairs with extra legroom and dedicated service.',
    'floor': 'General admission standing area closest to the stage.',
    'stadium': 'Comfortable tiered seating with excellent sightlines.',
    'box': 'Private luxury boxes with premium amenities and services.'
  };
  return descriptionMap[section.seatType];
}



}