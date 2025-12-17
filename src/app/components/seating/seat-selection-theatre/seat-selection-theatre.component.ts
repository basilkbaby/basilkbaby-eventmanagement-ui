import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

export interface VenueSection {
  id: string;
  name: string;
  type: 'middle-left' | 'middle-right' | 'wing-left' | 'wing-right' | 'stage' | 'vip' | 'standing';
  color: string;
  price: number;
  capacity: number;
  available: number;
  position: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
  rowOffset?: number;
  seatingConfig?: {
    rows: number;
    seatsPerRow: number;
    aislePosition?: number;
  };
}

export interface VenueLayout {
  id: string;
  name: string;
  description?: string;
  sections: VenueSection[];
  totalCapacity: number;
}

@Component({
  selector: 'app-seat-selection-theatre',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './seat-selection-theatre.component.html',
  styleUrls: ['./seat-selection-theatre.component.scss']
})
export class SeatSelectionTheatreComponent implements OnInit {
  @Input() layout?: VenueLayout;
  @Output() sectionSelect = new EventEmitter<VenueSection>();
  
  selectedSection: VenueSection | null = null;
  
  currentSections: VenueSection[] = [];

  // Original sample sections
  sampleSections: VenueSection[] = [
    // Stage
    {
      id: 'stage',
      name: 'Main Stage',
      type: 'stage',
      color: '#1e293b',
      price: 0,
      capacity: 0,
      available: 0,
      position: { top: 5, left: 25, width: 50, height: 10 }
    },
    // Wing Left Section
    {
      id: 'wing-left',
      name: 'Wing Left',
      type: 'wing-left',
      color: '#10b981',
      price: 120,
      capacity: 240,
      available: 110,
      position: { top: 20, left: 2, width: 22, height: 70 },
      rowOffset: 2,
      seatingConfig: {
        rows: 20,
        seatsPerRow: 12,
        aislePosition: 6
      }
    },
    // Middle Left Section
    {
      id: 'middle-left',
      name: 'Middle Left',
      type: 'middle-left',
      color: '#3b82f6',
      price: 150,
      capacity: 204,
      available: 85,
      position: { top: 18, left: 26, width: 22, height: 60 },
      seatingConfig: {
        rows: 17,
        seatsPerRow: 12,
        aislePosition: 6
      }
    },
    // Middle Right Section
    {
      id: 'middle-right',
      name: 'Middle Right',
      type: 'middle-right',
      color: '#3b82f6',
      price: 150,
      capacity: 204,
      available: 92,
      position: { top: 18, left: 50, width: 22, height: 60 },
      seatingConfig: {
        rows: 17,
        seatsPerRow: 12,
        aislePosition: 6
      }
    },
    // Wing Right Section
    {
      id: 'wing-right',
      name: 'Wing Right',
      type: 'wing-right',
      color: '#10b981',
      price: 120,
      capacity: 240,
      available: 105,
      position: { top: 20, left: 74, width: 22, height: 70 },
      rowOffset: 2,
      seatingConfig: {
        rows: 20,
        seatsPerRow: 12,
        aislePosition: 6
      }
    },
    // Standing Area
    {
      id: 'standing',
      name: 'Standing Area',
      type: 'standing',
      color: '#ef4444',
      price: 80,
      capacity: 300,
      available: 150,
      position: { top: 85, left: 26, width: 46, height: 15 }
    }
  ];

  constructor(private router : Router) {}

  ngOnInit() {
    if (!this.layout) {
      this.layout = {
        id: 'venue-001',
        name: 'Main Concert Hall',
        description: 'Venue layout with middle and wing sections',
        sections: this.sampleSections,
        totalCapacity: 888
      };
    }
    this.currentSections = [...this.layout.sections];
  }

  // Get section by type
  getSectionByType(type: string): VenueSection | undefined {
    return this.currentSections.find(s => s.type === type);
  }

  // Get all seating sections
  getSeatingSections(): VenueSection[] {
    return this.currentSections.filter(s => s.type !== 'stage');
  }

  // Get section style
  getSectionStyle(section: VenueSection): any {
    const isSelected = this.selectedSection?.id === section.id;
    
    return {
      'top': section.position.top + '%',
      'left': section.position.left + '%',
      'width': section.position.width + '%',
      'height': section.position.height + '%',
      'background-color': section.color,
      'z-index': isSelected ? '100' : '10',
      'box-shadow': isSelected ?
        '0 0 0 3px rgba(255, 255, 255, 0.8), 0 4px 12px rgba(0, 0, 0, 0.2)' :
        '0 2px 4px rgba(0, 0, 0, 0.1)'
    };
  }

  // Select section
  selectSection(section: VenueSection) {
    // this.selectedSection = section;
    // this.sectionSelect.emit(section);
    this.router.navigate(['/seat-map/4/4']);
    //this.router.navigate(['/events/4/seatstheatre']); //seatstheatre
  }

  // Check if section has seats
  hasSeats(section: VenueSection): boolean {
    return section.capacity > 0 && section.type !== 'stage';
  }

  // Get price display
  getPriceDisplay(section: VenueSection): string {
    return section.price > 0 ? `£${section.price}` : 'Free';
  }

  // Get occupancy percentage
  getOccupancyPercentage(section: VenueSection): number {
    if (section.capacity === 0) return 0;
    return Math.round(((section.capacity - section.available) / section.capacity) * 100);
  }

  // Get total available seats
  getTotalAvailable(): number {
    return this.currentSections.reduce((total, section) => total + section.available, 0);
  }

  // Get total capacity
  getTotalCapacity(): number {
    return this.currentSections.reduce((total, section) => total + section.capacity, 0);
  }

  // Get overall occupancy
  getOverallOccupancy(): number {
    const total = this.getTotalCapacity();
    if (total === 0) return 0;
    const occupied = total - this.getTotalAvailable();
    return Math.round((occupied / total) * 100);
  }
}