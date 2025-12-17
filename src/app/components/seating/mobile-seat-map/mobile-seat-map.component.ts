import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { MobileSectionSelectorComponent } from '../mobile-section-selector/mobile-section-selector.component';
import { MobileSeatSelectorComponent } from '../mobile-seat-selector/mobile-seat-selector.component';
import { VenueData, VenueSection, SelectedSeat, SeatStatus, TicketType } from '../../../core/models/seats.model';

@Component({
  selector: 'app-mobile-seat-map',
  standalone: true,
  imports: [CommonModule, MobileSectionSelectorComponent, MobileSeatSelectorComponent, RouterLink],
  templateUrl: './mobile-seat-map.component.html',
  styleUrls: ['./mobile-seat-map.component.scss']
})
export class MobileSeatMapComponent implements OnInit {
  
  // View navigation
  currentView: 'sections' | 'seats' | 'summary' = 'sections';
  selectedSection: VenueSection | null = null;
  selectedSeats: SelectedSeat[] = [];
  
  // Remove venueData input - child components will have their own data
readonly venueData: VenueData = {
    sections: [
      { 
        id: "1",
        name: 'SILVER', 
        x: 50, 
        y: 250, 
        rows: 20, 
        seatsPerRow: 5,
        sectionLabel: 'Silver Section',
        rowConfigs: [
          { 
            fromRow: 0, 
            toRow: 19, 
            type: 'SILVER', 
            customPrice: 50,
            color: '#4a8bc9'
          }
        ]
      },
      { 
        id: "2",
        name: 'GOLD', 
        x: 200, 
        y: 170, 
        rows: 19, 
        seatsPerRow: 10, 
        rowOffset: 1,
        sectionLabel: 'Gold Section',
        rowConfigs: [
          { 
            fromRow: 0, 
            toRow: 18, 
            type: 'GOLD', 
            customPrice: 100,
            color: '#b3543a'
          }
        ]
      },
      { 
        id: "3",
        name: 'VIP', 
        x: 450, 
        y: 150, 
        rows: 15, 
        seatsPerRow: 10,
        sectionLabel: 'VIP Section',
        rowConfigs: [
          { 
            fromRow: 0, 
            toRow: 2, 
            type: 'VIP', 
            customPrice: 200,
            color: '#8a6b8c'
          },
          { 
            fromRow: 3, 
            toRow: 14, 
            type: 'DIAMOND', 
            customPrice: 150,
            color: '#8a9a5b'
          }
        ]
      },
      { 
        id: "4",
        name: 'VIP', 
        x: 700, 
        y: 150, 
        rows: 15, 
        seatsPerRow: 10,
        sectionLabel: 'VIP Section',
        rowConfigs: [
          { 
            fromRow: 0, 
            toRow: 2, 
            type: 'VIP', 
            customPrice: 200,
            color: '#8a6b8c'
          },
          { 
            fromRow: 3, 
            toRow: 14, 
            type: 'DIAMOND', 
            customPrice: 150,
            color: '#8a9a5b'
          }
        ]
      },
      { 
        id: "5",
        name: 'GOLD', 
        x: 950, 
        y: 170, 
        rows: 19, 
        seatsPerRow: 10, 
        rowOffset: 1,
        sectionLabel: 'Gold Section',
        rowConfigs: [
          { 
            fromRow: 0, 
            toRow: 18, 
            type: 'GOLD', 
            customPrice: 100,
            color: '#b3543a'
          }
        ]
      },
      { 
        id: "6",
        name: 'SILVER', 
        x: 1200, 
        y: 250, 
        rows: 20, 
        seatsPerRow: 5,
        sectionLabel: 'Silver Section',
        rowConfigs: [
          { 
            fromRow: 0, 
            toRow: 19, 
            type: 'SILVER', 
            customPrice: 50,
            color: '#4a8bc9'
          }
        ]
      }
    ],
    
    seatManagement: {
      reservedSeats: [
        { seatId: 'VIP-A-1', status: SeatStatus.RESERVED, reason: 'VIP_GUEST', reservationId: 'RES-001' },
        { seatId: 'VIP-A-2', status: SeatStatus.RESERVED, reason: 'ARTIST_GUEST', reservationId: 'RES-002' },
        { seatId: 'DIAMOND-D-5', status: SeatStatus.RESERVED, reason: 'PRESS', reservationId: 'RES-003' }
      ],
      
      blockedSeats: [
        { seatId: 'GOLD-A-1', status: SeatStatus.BLOCKED, reason: 'EQUIPMENT_AREA', blockedBy: 'admin' },
        { seatId: 'SILVER-B-3', status: SeatStatus.BLOCKED, reason: 'MAINTENANCE', blockedBy: 'admin' },
        { seatId: 'GOLD-C-5', status: SeatStatus.BLOCKED, reason: 'SAFETY', blockedBy: 'admin' }
      ],
      
      soldSeats: [
        { seatId: 'VIP-A-5', status: SeatStatus.SOLD, bookingId: 'BK001' },
        { seatId: 'VIP-A-6', status: SeatStatus.SOLD, bookingId: 'BK002' },
        { seatId: 'DIAMOND-D-8', status: SeatStatus.SOLD, bookingId: 'BK003' },
        { seatId: 'DIAMOND-D-9', status: SeatStatus.SOLD, bookingId: 'BK004' },
        { seatId: 'GOLD-B-4', status: SeatStatus.SOLD, bookingId: 'BK005' },
        { seatId: 'SILVER-C-2', status: SeatStatus.SOLD, bookingId: 'BK006' }
      ]
    }
  };
  // Event details
  event = {
    title: 'SITHARA\'S PROJECT MALABARICUS - Manchester',
    date: new Date('2026-01-15'),
    time: '19:30',
    venue: 'Manchester venue'
  };

  constructor(
    private cartService: CartService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // Route handling simplified - no data passing needed
    this.route.url.subscribe(urlSegments => {
      const path = urlSegments.map(segment => segment.path).join('/');
      this.updateViewFromRoute(path);
    });
  }

  private updateViewFromRoute(path: string) {
    switch (path) {
      case '':
        // Root: /seating
        this.currentView = 'sections';
        this.selectedSection = null;
        break;
        
      case 'section':
        // Section selected: /seating/section/:id
        this.currentView = 'seats';
        break;
        
      case 'summary':
        // Summary view: /seating/summary
        this.currentView = 'summary';
        break;
        
      default:
        this.currentView = 'sections';
    }
  }

  // Simplified handlers
  onSectionSelected(section: VenueSection) {
    this.selectedSection = section;
    
    // Navigate to section route
    const sectionId = this.getSectionRouteId(section);
    this.router.navigate(['/seating/section', sectionId]);
  }

  onBackToSections() {
    this.router.navigate(['/seating']);
  }

  goToSummary() {
    if (this.selectedSeats.length > 0) {
      this.router.navigate(['/seating/summary']);
    }
  }

  goBackToSeats() {
    if (this.selectedSection) {
      const sectionId = this.getSectionRouteId(this.selectedSection);
      this.router.navigate(['/seating/section', sectionId]);
    }
  }

  // Helper to generate route ID
  private getSectionRouteId(section: VenueSection): string {
    if (section.id) return section.id;
    return (section.sectionLabel || section.name)
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
  }

  // Seat selection updates
  onSeatsUpdated(seats: SelectedSeat[]) {
    this.selectedSeats = seats;
  }

  // Add selected seats to cart
  addToCart() {
    if (this.selectedSeats.length === 0) return;
    
    this.selectedSeats.forEach(seat => {
      this.cartService.addSeat({
        id: seat.id,
        section: seat.section,
        row: seat.row,
        number: seat.number,
        price: seat.price,
        type: this.mapTicketTypeToCartType(seat.tier.name as TicketType),
        status: 'selected',
        x: 0,
        y: 0
      });
    });
    
    this.router.navigate(['/cart']);
  }

  // Helper method to map ticket types
  private mapTicketTypeToCartType(ticketType: TicketType): 'standard' | 'vip' | 'accessible' | 'standing' | 'seated' {
    const typeMap: Record<TicketType, 'standard' | 'vip' | 'accessible' | 'standing' | 'seated'> = {
      VIP: 'vip',
      DIAMOND: 'vip',
      GOLD: 'standard',
      SILVER: 'standard'
    };
    
    return typeMap[ticketType] || 'standard';
  }

  // Format price for display
  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-UK', {
      style: 'currency',
      currency: 'GBP'
    }).format(price);
  }

  // Calculate total price
  getTotalPrice(): number {
    return this.selectedSeats.reduce((total, seat) => total + seat.price, 0);
  }

  // Clear all selected seats
  clearSelection() {
    this.selectedSeats = [];
  }
}