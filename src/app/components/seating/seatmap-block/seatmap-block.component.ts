import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Location } from '@angular/common';
import { CartService } from '../../../core/services/cart.service';
import { Subscription } from 'rxjs';
import { Event, TicketTier } from '../../../core/models/event.model';
import { MOCK_EVENTS } from '../../../core/mock/mock-events.data';

interface SelectedSeat {
  id: string;
  row: string;
  number: number;
  section: string;
  tier: TicketTier;
  price: number;
}

interface SeatSection {
  id: string;
  name: string;
  description: string;
  color: string;
  tierIds: string[];
  rows: SeatRow[];
}

interface SeatRow {
  rowLabel: string;
  seats: Seat[];
}

interface Seat {
  id: string;
  number: number;
  isAvailable: boolean;
  isSelected: boolean;
  tierId: string;
}

@Component({
  selector: 'app-seatmap-block',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './seatmap-block.component.html',
  styleUrls: ['./seatmap-block.component.scss']
})
export class SeatmapBlockComponent implements OnInit {
  event: Event | null = null;
  loading: boolean = true;
  selectedTier: TicketTier | null = null;
  selectedSeats: SelectedSeat[] = [];
  seatSections: SeatSection[] = [];
  showLegend: boolean = true;
  autoSelect: boolean = false;
  cartItemCount: number = 0;
  
  // Filter options
  priceRange: number = 200;
  sectionFilter: string = 'all';
  
  // View options
  viewMode: 'map' | 'list' = 'map';
  zoomLevel: number = 1;
  
  private cartSubscription: Subscription | undefined;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cartService: CartService,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const eventId = params['id'];
      this.loadEventDetails(eventId);
    });

    this.cartSubscription = this.cartService.cart$.subscribe(() => {
      this.cartItemCount = this.cartService.getItemCount();
    });
  }

  ngOnDestroy(): void {
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
  }

  loadEventDetails(eventId: string): void {
    setTimeout(() => {
      this.event = MOCK_EVENTS.find(e => e.id === eventId) || null;
      if (this.event) {
        this.initializeSeatSections();
        if (this.event.ticketTiers.length > 0) {
          this.selectedTier = this.event.ticketTiers[0];
        }
      }
      this.loading = false;
    }, 500);
  }

  initializeSeatSections(): void {
    if (!this.event) return;

    this.seatSections = [
      {
        id: 'vip',
        name: 'VIP Royal Experience',
        description: 'Front section with premium view and amenities',
        color: '#F59E0B',
        tierIds: ['1'],
        rows: this.generateSeatRows('VIP', 5, 10, 0.2, '1')
      },
      {
        id: 'gold',
        name: 'Gold Circle',
        description: 'Excellent stalls seating with great stage view',
        color: '#10B981',
        tierIds: ['2'],
        rows: this.generateSeatRows('GC', 8, 15, 0.3, '2')
      },
      {
        id: 'standard',
        name: 'Standard Seating',
        description: 'Comfortable seats with good visibility',
        color: '#3B82F6',
        tierIds: ['3'],
        rows: this.generateSeatRows('STD', 10, 20, 0.4, '3')
      },
      {
        id: 'balcony',
        name: 'Balcony',
        description: 'Elevated view from balcony sections',
        color: '#8B5CF6',
        tierIds: ['4'],
        rows: this.generateSeatRows('BAL', 6, 25, 0.5, '4')
      }
    ];
  }

  generateSeatRows(section: string, rowCount: number, seatsPerRow: number, unavailableRatio: number, tierId: string): SeatRow[] {
    const rows: SeatRow[] = [];
    const rowLabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
    
    for (let i = 0; i < rowCount; i++) {
      const seats: Seat[] = [];
      for (let j = 1; j <= seatsPerRow; j++) {
        const isUnavailable = Math.random() < unavailableRatio;
        seats.push({
          id: `${section}-${rowLabels[i]}-${j}`,
          number: j,
          isAvailable: !isUnavailable,
          isSelected: false,
          tierId: tierId
        });
      }
      rows.push({
        rowLabel: rowLabels[i],
        seats: seats
      });
    }
    return rows;
  }

  toggleSeat(seat: Seat, section: SeatSection): void {
    if (!seat.isAvailable || !this.selectedTier) return;

    const tier = this.event?.ticketTiers.find(t => t.id === seat.tierId);
    if (!tier) return;

    if (seat.isSelected) {
      seat.isSelected = false;
      this.selectedSeats = this.selectedSeats.filter(s => s.id !== seat.id);
    } else {
      const tierSeats = this.selectedSeats.filter(s => s.tier.id === tier.id);
      if (tierSeats.length >= 8) {
        //alert('Maximum 8 seats allowed per ticket type');
        return;
      }

      seat.isSelected = true;
      this.selectedSeats.push({
        id: seat.id,
        row: `${section.name} ${seat.tierId}`,
        number: seat.number,
        section: section.name,
        tier: tier,
        price: tier.price
      });
    }
  }

  selectTier(tier: TicketTier): void {
    this.selectedTier = tier;
    if (this.autoSelect) {
      this.autoSelectBestSeats(tier);
    }
  }

  autoSelectBestSeats(tier: TicketTier): void {
    this.selectedSeats = this.selectedSeats.filter(s => s.tier.id !== tier.id);
    
    const availableSeats: SelectedSeat[] = [];
    
    for (const section of this.seatSections) {
      if (section.tierIds.includes(tier.id)) {
        for (const row of section.rows) {
          for (const seat of row.seats) {
            if (seat.isAvailable && !seat.isSelected && seat.tierId === tier.id) {
              availableSeats.push({
                id: seat.id,
                row: `${section.name} ${row.rowLabel}`,
                number: seat.number,
                section: section.name,
                tier: tier,
                price: tier.price
              });
              
              seat.isSelected = true;
              
              if (availableSeats.length >= 2) break;
            }
          }
          if (availableSeats.length >= 2) break;
        }
      }
      if (availableSeats.length >= 2) break;
    }
    
    this.selectedSeats.push(...availableSeats);
  }

  getTotalPrice(): number {
    return this.selectedSeats.reduce((total, seat) => total + seat.price, 0);
  }

  getSelectedSeatsByTier(): { tier: TicketTier, count: number, total: number }[] {
    const tierMap = new Map<string, { tier: TicketTier, count: number, total: number }>();
    
    this.selectedSeats.forEach(seat => {
      const key = seat.tier.id;
      if (!tierMap.has(key)) {
        tierMap.set(key, { tier: seat.tier, count: 0, total: 0 });
      }
      const data = tierMap.get(key)!;
      data.count++;
      data.total += seat.price;
    });
    
    return Array.from(tierMap.values());
  }

  // FIXED: Add this helper method
  getSeatsForTier(tierId: string): SelectedSeat[] {
    return this.selectedSeats.filter(seat => seat.tier.id === tierId);
  }

  addToCart(): void {
    if (this.selectedSeats.length === 0) {
      //alert('Please select at least one seat');
      return;
    }

    if (this.event) {
this.selectedSeats.forEach(seat => {
      // Create a unique identifier for this seat
      const seatIdentifier = this.getSeatIdentifier(seat);
      
      this.cartService.addSeat({
        eventId: this.event!.id,
        eventTitle: this.event!.title,
        eventDate: this.event!.startDate,
        eventTime: this.event!.startTime,
        venueName: this.event!.venue.name,
        ticketTierId: seat.tier.id,
        ticketTierName: seat.tier.name,
        price: seat.price,
        quantity: 1, // Each seat is 1 quantity
        // Include this specific seat's information
        total: seat.price,
        id: this.generateRandomId('seat-cart'),
        row: seat.row.split(' ').pop() || '',
        number: seat.number,
        section: seat.section,
        type: 'standard',
        status: 'reserved',
        x: 0,
        y: 0
      });
    });

    const totalTickets = this.selectedSeats.length;
    //alert(`${totalTickets} seat(s) added to cart!`);
    
    // Clear selections after adding to cart
    this.clearSelection();
    
    this.router.navigate(['/cart']);
    }
  }

  // Random ID Generator Functions
  generateRandomId(prefix: string = ''): string {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 9);
    return prefix ? `${prefix}-${timestamp}-${randomStr}` : `${timestamp}-${randomStr}`;
  }
  // Helper method to create a clean seat identifier
getSeatIdentifier(seat: SelectedSeat): string {
  // Extract just the row letter/number from the row string
  const rowPart = seat.row.split(' ').pop() || '';
  return `${seat.section.substring(0, 3)}-${rowPart}-${seat.number}`;
}

  clearSelection(): void {
    this.seatSections.forEach(section => {
      section.rows.forEach(row => {
        row.seats.forEach(seat => {
          seat.isSelected = false;
        });
      });
    });
    this.selectedSeats = [];
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-UK', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 2
    }).format(price);
  }

  // FIXED: Add formatDate method
  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-UK', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  }

  getAvailableSeatsCount(tier: TicketTier): number {
    let count = 0;
    for (const section of this.seatSections) {
      if (section.tierIds.includes(tier.id)) {
        for (const row of section.rows) {
          count += row.seats.filter(seat => seat.isAvailable && seat.tierId === tier.id).length;
        }
      }
    }
    return count;
  }

  getFilteredSections(): SeatSection[] {
    if (this.sectionFilter === 'all') return this.seatSections;
    return this.seatSections.filter(section => section.id === this.sectionFilter);
  }

  getSectionPrice(sectionId: string): number {
    if (!this.event) return 0;
    
    const section = this.seatSections.find(s => s.id === sectionId);
    if (!section || !section.tierIds || section.tierIds.length === 0) return 0;
    
    const tierId = section.tierIds[0];
    const tier = this.event.ticketTiers.find(t => t.id === tierId);
    return tier?.price || 0;
  }

  zoomIn(): void {
    if (this.zoomLevel < 2) {
      this.zoomLevel += 0.2;
    }
  }

  zoomOut(): void {
    if (this.zoomLevel > 0.5) {
      this.zoomLevel -= 0.2;
    }
  }

  resetZoom(): void {
    this.zoomLevel = 1;
  }

  goBack(): void {
    this.location.back();
  }

  getSeatClass(seat: Seat): string {
    if (!seat.isAvailable) return 'seat-unavailable';
    if (seat.isSelected) return 'seat-selected';
    return 'seat-available';
  }

  scrollToMap(): void {
    const mapElement = document.querySelector('.seat-map-container');
    if (mapElement) {
      mapElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

}