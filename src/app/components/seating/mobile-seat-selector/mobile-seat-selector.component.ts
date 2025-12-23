import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { VenueData, VenueSection, SectionRowConfig, SeatStatus, TicketType, Seat, SelectedSeat, SeatSectionType, SeatOverride } from '../../../core/models/seats.model';
import { CartService } from '../../../core/services/cart.service';
import { SeatService } from '../../../core/services/seat.service';

interface RowData {
  letter: string;
  seats: Seat[];
  ticketType: TicketType;
  price: number;
  color: string;
}

@Component({
  selector: 'app-mobile-seat-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mobile-seat-selector.component.html',
  styleUrls: ['./mobile-seat-selector.component.scss']
})
export class MobileSeatSelectorComponent implements OnInit, OnDestroy {
  section!: VenueSection;
  SeatSectionType = SeatSectionType;
  venueData!: VenueData;
  loading: boolean = false;
  selectedSeats: SelectedSeat[] = [];
  rows: RowData[] = [];

  readonly SeatStatus = SeatStatus;

  // Selection state
  maxSeats = 8;
  selectionError: string | null = null;
  eventId: string = "";
  sectionId: string = "";

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private cartService: CartService,
    private seatService: SeatService
  ) {
    this.venueData = this.seatService.getSeatMapConfigMobile();
  }

  ngOnInit() {
    // Get section ID from route
    this.route.params.subscribe(params => {
      this.sectionId = params['sectionId'];
      this.eventId = params['id'];
      this.getSeatMap(this.eventId);
    });
  }

  ngOnDestroy() {
    // Cleanup
  }

  getSeatMap(eventId: string) {
    this.loading = true;
    this.seatService.getSeatMap(eventId).subscribe({
      next: (seatmap) => {
        this.venueData = seatmap;
        this.loadSectionData(this.sectionId);
        this.generateSeats();
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        console.error('Error loading event:', error);
      }
    });
  }

  private loadSectionData(sectionId: string) {
    const foundSection = this.venueData.sections.find(s =>
      s.id.toLowerCase() === sectionId.toLowerCase() ||
      (s.sectionLabel && s.sectionLabel.toLowerCase().replace(/\s+/g, '-') === sectionId.toLowerCase())
    );

    if (foundSection) {
      this.section = foundSection;
    } else {
      console.error('Section not found:', sectionId);
    }
  }

  private generateSeats() {
    this.rows = [];
    const rowOffset = this.section.rowOffset || 0;

    const sortedConfigs = [...this.section.rowConfigs].sort((a, b) => {
      const aFrom = a.fromRow || 0;
      const bFrom = b.fromRow || 0;
      return aFrom - bFrom;
    });

    sortedConfigs.forEach(rowconfig => {
      for (let r = 0; r < rowconfig.toRow; r++) {
        const globalRow = r + rowOffset;
        const rowLetter = this.getRowLetter(r);

        const rowData: RowData = {
          letter: rowLetter,
          seats: [],
          // Initialize with default values (will be overridden per seat if needed)
          ticketType: 'SILVER' as TicketType,
          price: 0,
          color: '#cccccc'
        };

        for (let c = 0; c <= rowconfig.toColumn; c++) {
          const seatId = `${this.section.name}-${rowLetter}-${c}`;
          const status = this.getSeatStatus(seatId);

          // Get config specific to this seat (considering both row and column)
          const seatConfig = this.getSeatConfig(r, c);

          const seat: Seat = {
            id: seatId,
            cx: c * 40,
            cy: r * 40,
            r: 15,
            rowLabel: rowLetter,
            seatNumber: c,
            sectionId: this.section.id,
            sectionName: this.section.sectionLabel || this.section.name,
            sectionConfigId: seatConfig.id,
            ticketType: seatConfig.type,
            status: status,
            price: seatConfig.customPrice || 0,
            color: seatConfig.color,
            features: this.generateSeatFeatures(seatConfig.type, r, c),
            gridRow: globalRow,
            gridColumn: c,
            isStandingArea: false
          };

          rowData.seats.push(seat);

          // If this is the first seat, set row-level properties
          // (can be overridden by different configs in the same row)
          // if (c === 1) {
          //   rowData.ticketType = seat.ticketType;
          //   rowData.price = seat.price;
          //   rowData.color = seat.color;
          // }
        }

        this.rows.push(rowData);
      }
    });

  }

  private getSeatConfig(rowIndex: number, columnIndex: number): SectionRowConfig {
  // First, find configs that match the row
  const rowMatchingConfigs = this.section.rowConfigs?.filter(rc => {
    const rowMatch = rc.fromRow !== undefined && rc.toRow !== undefined &&
                     rowIndex >= rc.fromRow && rowIndex <= rc.toRow;
    
    // If no column range specified, it applies to entire row
    if (rc.fromColumn === undefined || rc.toColumn === undefined) {
      return rowMatch;
    }
    
    // If column range specified, check both
    const columnMatch = columnIndex >= rc.fromColumn && columnIndex <= rc.toColumn;
    return rowMatch && columnMatch;
  });
  
  // Also check for configs that only have column range (no row range)
  const columnOnlyConfigs = this.section.rowConfigs?.filter(rc => {
    if (rc.fromRow === undefined || rc.toRow === undefined) {
      return rc.fromColumn !== undefined && rc.toColumn !== undefined &&
             columnIndex >= rc.fromColumn && columnIndex <= rc.toColumn;
    }
    return false;
  });
  
  // Combine both results
  const matchingConfigs = [...(rowMatchingConfigs || []), ...(columnOnlyConfigs || [])];
  
  // Return the first matching config or default
  if (matchingConfigs.length > 0) {
    return matchingConfigs[0];
  }
  
  // Return default config if none found
  return {
    id: crypto.randomUUID(),
    fromRow: 0,
    toRow: this.section.rows - 1,
    fromColumn: 0,
    toColumn: 0,
    type: 'SILVER' as TicketType,
    customPrice: 0,
    color: '#cccccc'
  };
}
  private getSeatStatus(seatId: string): SeatStatus {
    // Check if seat is sold
    const isSold = this.venueData.seatManagement.soldSeats.some(s => s.seatId === seatId);
    const isReserved = this.venueData.seatManagement.reservedSeats.some(s => s.seatId === seatId);
    const isBlocked = this.venueData.seatManagement.blockedSeats.some(s => s.seatId === seatId);

    if (isSold) return SeatStatus.BOOKED;
    if (isReserved) return SeatStatus.RESERVED;
    if (isBlocked) return SeatStatus.BLOCKED;

    // Check if seat is already selected
    const isSelected = this.selectedSeats.some(s => s.id === seatId);
    if (isSelected) return SeatStatus.SELECTED;

    return SeatStatus.AVAILABLE;
  }



  private getRowLetter(rowIndex: number): string {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    return letters[rowIndex % letters.length];
  }

  private generateSeatFeatures(type: TicketType, row: number, seatNumber: number): string[] {
    const features: string[] = [];

    if (type === 'VIP') {
      features.push('Premium View', 'Early Entry');
    } else if (type === 'DIAMOND') {
      features.push('Great Acoustics');
    }

    if (row <= 2) features.push('Front Row');
    if (seatNumber === 1 || seatNumber === this.section.seatsPerRow) features.push('Aisle Seat');
    if (row >= this.section.rows - 2) features.push('Easy Exit');

    return features;
  }

  // Seat Interaction
  toggleSeatSelection(seat: Seat) {
    if (!this.isSeatSelectable(seat)) return;

    if (seat.status === SeatStatus.SELECTED) {
      this.deselectSeat(seat);
    } else {
      this.selectSeat(seat);
    }
  }

  private selectSeat(seat: Seat) {
    if (this.selectedSeats.length >= this.maxSeats) {
      this.selectionError = `Maximum ${this.maxSeats} seats allowed`;
      setTimeout(() => this.selectionError = null, 3000);
      return;
    }

    seat.status = SeatStatus.SELECTED;

    const selectedSeat: SelectedSeat = {
      id: seat.id,
      row: seat.rowLabel,
      number: seat.seatNumber,
      sectionName: seat.sectionName,
      tier: {
        id: this.getTicketTierId(seat.ticketType),
        name: seat.ticketType,
        price: seat.price,
        color: seat.color
      },
      price: seat.price,
      features: seat.features || [],
      isStandingArea: false
    };

    this.selectedSeats.push(selectedSeat);
    this.selectionError = null;
  }

  private deselectSeat(seat: Seat) {
    seat.status = SeatStatus.AVAILABLE;
    this.selectedSeats = this.selectedSeats.filter(s => s.id !== seat.id);
  }

  clearSelection() {
    this.selectedSeats.forEach(selectedSeat => {
      const seat = this.findSeatById(selectedSeat.id);
      if (seat) {
        seat.status = SeatStatus.AVAILABLE;
      }
    });

    this.selectedSeats = [];
  }

  // Navigation
  goBack() {
    this.router.navigate(['events', this.eventId, 'mobileseatmap']);
  }

  goToCart() {
    this.saveSelectionToStorage();
    this.router.navigate(['/cart']);
  }

  private saveSelectionToStorage() {
    localStorage.setItem('selectedSeats', JSON.stringify(this.selectedSeats));
    localStorage.setItem('selectedSection', JSON.stringify(this.section));
  }

  // Helper methods
  private findSeatById(seatId: string): Seat | undefined {
    for (const row of this.rows) {
      const seat = row.seats.find(s => s.id === seatId);
      if (seat) return seat;
    }
    return undefined;
  }

  private getTicketTierId(ticketType: TicketType): string {
    const tierMap: Record<TicketType, string> = {
      VIP: '1',
      DIAMOND: '2',
      GOLD: '3',
      SILVER: '4',
      FOH: '5',
      STANDING: '6'
    };
    return tierMap[ticketType] || '0';
  }

  isSeatSelectable(seat: Seat): boolean {
    return seat.status === SeatStatus.AVAILABLE || seat.status === SeatStatus.SELECTED;
  }

  getSeatColor(seat: Seat): string {
    if (seat.status === SeatStatus.SELECTED) return '#4CAF50';
    if (seat.status === SeatStatus.BOOKED) return '#999999';
    if (seat.status === SeatStatus.RESERVED) return '#FF9800';
    if (seat.status === SeatStatus.BLOCKED) return '#dfdfdfff';
    return seat.color;
  }

  getSeatStatusText(seat: Seat): string {
    switch (seat.status) {
      case SeatStatus.SELECTED: return 'Selected';
      case SeatStatus.BOOKED: return 'Sold';
      case SeatStatus.RESERVED: return 'Reserved';
      case SeatStatus.BLOCKED: return 'Blocked';
      case SeatStatus.AVAILABLE: return 'Available';
      default: return '';
    }
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-UK', {
      style: 'currency',
      currency: 'GBP'
    }).format(price);
  }

  getAvailableSeatsCount(): number {
    return this.rows.reduce((total, row) => {
      return total + row.seats.filter(seat => seat.status === SeatStatus.AVAILABLE).length;
    }, 0);
  }

  getSeatNumbers(): number[] {
    if (!this.section) return Array.from({ length: 10 }, (_, i) => i + 1);
    return Array.from({ length: this.section.seatsPerRow }, (_, i) => i + 1);
  }

  getTotalPrice(): number {
    return this.selectedSeats.reduce((total, seat) => total + seat.price, 0);
  }

  // Add selected seats to cart
  addToCart() {
    if (this.selectedSeats.length === 0) return;
    const seatIds = this.selectedSeats.map(seat => seat.id);

    this.cartService.addToCart(this.eventId, seatIds);

  }

  hasSectionTypes(): boolean {
    if (!this.venueData?.sections) return false;

    const sectionTypes = new Set<SeatSectionType>();
    this.venueData.sections.forEach(section => {
      if (section.seatSectionType !== undefined) {
        sectionTypes.add(section.seatSectionType);
      }
    });

    return sectionTypes.size > 1 || sectionTypes.has(SeatSectionType.FOH) || sectionTypes.has(SeatSectionType.STANDING);
  }
}