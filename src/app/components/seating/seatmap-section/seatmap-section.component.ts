import { Component, OnInit, HostListener } from '@angular/core';
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
  features: string[];
  type: 'standard' | 'vip' | 'accessible'| 'standing' | 'seated';
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
  features: string[];
  type: 'standard' | 'wheelchair' | 'premium' | 'restricted';
}

@Component({
  selector: 'app-seatmap-section',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './seatmap-section.component.html',
  styleUrls: ['./seatmap-section.component.scss']
})
export class SeatMapSectionComponent implements OnInit {
  event: Event | null = null;
  loading: boolean = true;
  selectedSeats: SelectedSeat[] = [];
  seatSection: SeatSection = {
    id: 'main',
    name: 'Main Hall',
    description: 'General seating area with good stage view',
    color: '#3B82F6',
    tierIds: ['1', '2', '3'],
    rows: []
  };
  
  selectedSection: SeatSection | null = null;
  cartItemCount: number = 0;
  
  // Tooltip
  hoveredSeat: Seat | null = null;
  showTooltip: boolean = false;
  tooltipX: number = 0;
  tooltipY: number = 0;
  
  // View options
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
      const eventId = params['eventId'];
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
        this.initializeSeatSection();
      }
      this.loading = false;
    }, 500);
  }

  initializeSeatSection(): void {
    if (!this.event) return;

    this.seatSection = {
      id: 'main',
      name: 'Main Hall',
      description: 'General seating area with good stage view',
      color: '#3B82F6',
      tierIds: ['1', '2', '3'],
      rows: this.generateSeatRows(10, 12, 0.3)
    };
    this.selectedSection = this.seatSection;
  }

  generateSeatRows(rowCount: number, seatsPerRow: number, unavailableRatio: number): SeatRow[] {
    const rows: SeatRow[] = [];
    const rowLabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O'];
    
    for (let i = 0; i < rowCount; i++) {
      const seats: Seat[] = [];
      for (let j = 1; j <= seatsPerRow; j++) {
        const isUnavailable = Math.random() < unavailableRatio;
        const seatType = this.getRandomSeatType();
        const features = this.generateSeatFeatures(seatType);
        
        seats.push({
          id: `MAIN-${rowLabels[i]}-${j}`,
          number: j,
          isAvailable: !isUnavailable,
          isSelected: false,
          tierId: this.getTierIdForSeat(i, j),
          features: features,
          type: seatType
        });
      }
      rows.push({
        rowLabel: rowLabels[i],
        seats: seats
      });
    }
    return rows;
  }

  getRandomSeatType(): Seat['type'] {
    const types: Seat['type'][] = ['standard', 'wheelchair', 'premium', 'restricted'];
    const random = Math.random();
    if (random < 0.02) return 'wheelchair';       // 2% wheelchair accessible
    if (random < 0.05) return 'restricted';       // 3% restricted view
    if (random < 0.15) return 'premium';          // 10% premium
    return 'standard';                           // 85% standard
  }

  generateSeatFeatures(type: Seat['type']): string[] {
    const features: string[] = [];
    
    if (type === 'wheelchair') {
      features.push('Wheelchair Accessible');
      features.push('Companion Seat Available');
    }
    
    if (type === 'premium') {
      features.push('Extra Legroom');
      features.push('Premium View');
    }
    
    if (type === 'restricted') {
      features.push('Restricted View');
    }
    
    // Add random extra features
    if (Math.random() < 0.3) features.push('Near Exit');
    if (Math.random() < 0.2) features.push('Aisle Seat');
    
    return features;
  }

  getTierIdForSeat(rowIndex: number, seatNumber: number): string {
    // Front rows (A-E): Tier 1 (VIP)
    if (rowIndex < 5) return '1';
    // Middle rows (F-J): Tier 2 (Gold)
    if (rowIndex < 10) return '2';
    // Back rows (K-O): Tier 3 (Standard)
    return '3';
  }

  getTierForSeat(tierId: string): TicketTier | null {
    if (!this.event) return null;
    return this.event.ticketTiers.find(t => t.id === tierId) || null;
  }

  toggleSeat(seat: Seat): void {
    if (!seat.isAvailable) return;

    const tier = this.getTierForSeat(seat.tierId);
    if (!tier) return;

    if (seat.isSelected) {
      seat.isSelected = false;
      this.selectedSeats = this.selectedSeats.filter(s => s.id !== seat.id);
    } else {
      seat.isSelected = true;
      this.selectedSeats.push({
        id: seat.id,
        row: `Row ${this.getRowLabelFromId(seat.id)}`,
        number: seat.number,
        section: this.seatSection.name,
        tier: tier,
        price: this.getSeatPrice(seat),
        features: [...seat.features],
        type: 'standard'
      });
    }
  }

  removeSeat(seat: SelectedSeat): void {
    const seatElement = this.findSeatById(seat.id);
    if (seatElement) {
      seatElement.isSelected = false;
    }
    this.selectedSeats = this.selectedSeats.filter(s => s.id !== seat.id);
  }

findSeatById(seatId: string): Seat | null {
  for (const row of this.seatSection.rows) {
    for (const seat of row.seats) {
      if (seat.id === seatId) {
        return seat;
      }
    }
  }
  return null;
}
  getRowLabelFromId(seatId: string): string {
    const match = seatId.match(/MAIN-([A-O])-/);
    return match ? match[1] : '';
  }

  showSeatDetails(seat: Seat): void {
    this.hoveredSeat = seat;
    this.showTooltip = true;
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (this.showTooltip && this.hoveredSeat) {
      this.tooltipX = event.clientX + 10;
      this.tooltipY = event.clientY + 10;
    }
  }

  hideSeatDetails(): void {
    this.showTooltip = false;
    this.hoveredSeat = null;
  }

  getSeatTooltip(seat: Seat): string {
    const tier = this.getTierForSeat(seat.tierId);
    return `${this.getSeatLocation(seat)} - ${seat.isAvailable ? 'Available' : 'Unavailable'} - ${this.formatPrice(this.getSeatPrice(seat))}`;
  }

  getSeatLocation(seat: Seat | SelectedSeat): string {
    if ('row' in seat) {
      return `Row ${seat.row.split(' ')[1]} Seat ${seat.number}`;
    }
    const rowLabel = this.getRowLabelFromId(seat.id);
    return `Row ${rowLabel} Seat ${seat.number}`;
  }

getSeatType(seat: Seat | SelectedSeat): string {
  if (this.isSeat(seat)) {
    return seat.type.charAt(0).toUpperCase() + seat.type.slice(1);
  }
  
  // Now TypeScript knows seat is SelectedSeat
  const seatElement = this.findSeatById(seat.id);
  return seatElement?.type ? 
    seatElement.type.charAt(0).toUpperCase() + seatElement.type.slice(1) : 
    'Standard';
}

isSeat(seat: Seat | SelectedSeat): seat is Seat {
  return (seat as Seat).type !== undefined;
}

  getStatusClass(seat: Seat): string {
    return seat.isAvailable ? 'status-available' : 'status-unavailable';
  }

  getSeatPrice(seat: Seat): number {
    const tier = this.getTierForSeat(seat.tierId);
    if (!tier) return 0;
    
    // Adjust price based on seat type
    let basePrice = tier.price;
    switch (seat.type) {
      case 'premium':
        return basePrice * 1.5;
      case 'wheelchair':
        return basePrice;
      case 'restricted':
        return basePrice * 0.7;
      default:
        return basePrice;
    }
  }

  getSeatClass(seat: Seat): string {
    if (!seat.isAvailable) return 'seat-unavailable';
    if (seat.isSelected) return 'seat-selected';
    
    switch (seat.type) {
      case 'wheelchair':
        return 'seat-wheelchair';
      case 'premium':
        return 'seat-premium';
      case 'restricted':
        return 'seat-restricted';
      default:
        return 'seat-available';
    }
  }

  getTotalPrice(): number {
    return this.selectedSeats.reduce((total, seat) => total + seat.price, 0);
  }

  getTotalSeatsCount(): number {
    return this.seatSection.rows.reduce((total, row) => total + row.seats.length, 0);
  }

  getAvailableSeatsCount(): number {
    return this.seatSection.rows.reduce((total, row) => 
      total + row.seats.filter(seat => seat.isAvailable).length, 0
    );
  }

  getMinPrice(): number {
    if (!this.event) return 0;
    return Math.min(...this.event.ticketTiers.map(t => t.price));
  }

  getMaxPrice(): number {
    if (!this.event) return 0;
    return Math.max(...this.event.ticketTiers.map(t => t.price));
  }

  getSectionPrice(): number {
    return this.getMinPrice();
  }

  addToCart(): void {
    if (this.selectedSeats.length === 0) return;

    if (this.event) {
      this.selectedSeats.forEach(seat => {
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
          quantity: 1,
          total: seat.price,
          id: this.generateRandomId('seat-map-cart'),
          row: seat.row.split(' ')[1],
          number: seat.number,
          section: seat.section,
          type: seat.type,
          status: 'reserved',
          x: 0,
          y: 0
        });
      });

      // Clear selections after adding to cart
      this.clearSelection();
      this.router.navigate(['/cart']);
    }
  }

  clearSelection(): void {
    this.seatSection.rows.forEach(row => {
      row.seats.forEach(seat => {
        seat.isSelected = false;
      });
    });
    this.selectedSeats = [];
  }

  getSeatIdentifier(seat: SelectedSeat): string {
    const rowPart = seat.row.split(' ').pop() || '';
    return `${seat.section.substring(0, 3)}-${rowPart}-${seat.number}`;
  }

  generateRandomId(prefix: string = ''): string {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 9);
    return prefix ? `${prefix}-${timestamp}-${randomStr}` : `${timestamp}-${randomStr}`;
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-UK', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 2
    }).format(price);
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-UK', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
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
scrollToMap(): void {
  const mapElement = document.querySelector('.seat-map-container');
  if (mapElement) {
    mapElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}
}