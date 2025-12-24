// Simplified TypeScript component
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
import { VenueSection, SeatStatus, TicketType, Seat, SelectedSeat } from '../../../core/models/seats.model';
import { CartService } from '../../../core/services/cart.service';
import { SeatService } from '../../../core/services/seat.service';

interface RowData {
  letter: string;
  seats: Seat[];
  ticketType: TicketType;
  price: number;
  color: string;
  blockLetter: string;
}

@Component({
  selector: 'app-mobile-seat-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mobile-seat-selector.component.html',
  styleUrls: ['./mobile-seat-selector.component.scss'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-in', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms ease-out', style({ opacity: 0 }))
      ])
    ]),
    trigger('slideUp', [
      transition(':enter', [
        style({ transform: 'translateY(100%)' }),
        animate('300ms ease-out', style({ transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ transform: 'translateY(100%)' }))
      ])
    ])
  ]
})
export class MobileSeatSelectorComponent implements OnInit {
  section!: VenueSection;
  rows: RowData[] = [];
  loading: boolean = true;
  selectedSeats: SelectedSeat[] = [];
  
  maxSeats = 8;
  selectionError: string | null = null;
  eventId: string = "";
  sectionId: string = "";

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private cartService: CartService,
    private seatService: SeatService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.sectionId = params['sectionId'];
      this.eventId = params['id'];
      this.loadSeatMap();
    });
  }

  private loadSeatMap() {
    this.loading = true;
    this.seatService.getSeatMap(this.eventId).subscribe({
      next: (seatmap) => {
        const venueData = seatmap;
        const foundSection = venueData.sections.find(s =>
          s.id.toLowerCase() === this.sectionId.toLowerCase() ||
          (s.sectionLabel && s.sectionLabel.toLowerCase().replace(/\s+/g, '-') === this.sectionId.toLowerCase())
        );

        if (foundSection) {
          this.section = foundSection;
          this.generateRows();
        } else {
          console.error('Section not found:', this.sectionId);
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading seat map:', error);
        this.loading = false;
      }
    });
  }

  private generateRows() {
    this.rows = [];
    const rowConfigs = this.section.rowConfigs || [];
    
    rowConfigs.forEach((rowConfig, configIndex) => {
      const fromRow = rowConfig.fromRow || 0;
      const toRow = rowConfig.toRow || (this.section.rows - 1);
      const fromColumn = rowConfig.fromColumn || 1;
      const toColumn = rowConfig.toColumn || this.section.seatsPerRow;
      const blockLetter = rowConfig.blockLetter || String.fromCharCode(65 + configIndex);

      for (let r = fromRow; r <= toRow; r++) {
        const rowLetter = this.getRowLetter(r);
        const seats: Seat[] = [];

        for (let c = fromColumn; c <= toColumn; c++) {
          const seatNumber = c - fromColumn + 1;
          const seatId = `${this.section.name.charAt(0)}-${blockLetter}-${rowLetter}${seatNumber}`;
          const status = this.getSeatStatus(seatId);

          seats.push({
            cx: 0, // Placeholder, actual position set in SVG
            cy: 0, // Placeholder, actual position set in SVG,
            r: 10,
            sectionConfigId : this.section.id,
            sectionId: this.section.id,
            isStandingArea: false,
            blockIndex : configIndex,
            id: seatId,
            rowLabel: rowLetter,
            seatNumber: seatNumber,
            sectionName: this.section.sectionLabel || this.section.name,
            ticketType: rowConfig.type,
            status: status,
            price: rowConfig.customPrice || 0,
            color: rowConfig.color,
            features: [],
            blockLetter: blockLetter,
            blockTotalSeats: toColumn - fromColumn + 1,
            blockStartSeat : fromColumn
          } as Seat);
        }

        this.rows.push({
          letter: rowLetter,
          seats: seats,
          ticketType: rowConfig.type,
          price: rowConfig.customPrice || 0,
          color: rowConfig.color,
          blockLetter: blockLetter
        });
      }
    });

    // Sort rows by block letter and row letter
    this.rows.sort((a, b) => {
      if (a.blockLetter !== b.blockLetter) {
        return a.blockLetter.localeCompare(b.blockLetter);
      }
      return a.letter.localeCompare(b.letter);
    });
  }

  private getRowLetter(rowIndex: number): string {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    return letters[rowIndex % letters.length];
  }

  private getSeatStatus(seatId: string): SeatStatus {
    // This would check against actual seat data from service
    return SeatStatus.AVAILABLE;
  }

  // View Methods
  getLeftRows(): RowData[] {
    return this.rows.filter(row => 
      ['A', 'B', 'C', 'L', '1', '2', '3', 'Left'].includes(row.blockLetter)
    );
  }

  getRightRows(): RowData[] {
    return this.rows.filter(row => 
      ['X', 'Y', 'Z', 'R', '7', '8', '9', 'Right'].includes(row.blockLetter)
    );
  }

  getAvailableSeatsCount(): number {
    return this.rows.reduce((total, row) => {
      return total + row.seats.filter(seat => seat.status === SeatStatus.AVAILABLE).length;
    }, 0);
  }

  getSectionSeatCount(side: 'left' | 'right'): number {
    const rows = side === 'left' ? this.getLeftRows() : this.getRightRows();
    return rows.reduce((total, row) => total + row.seats.length, 0);
  }

  // Seat Selection
  getSeatClass(seat: Seat): string {
    switch (seat.status) {
      case SeatStatus.AVAILABLE: return 'available';
      case SeatStatus.SELECTED: return 'selected';
      case SeatStatus.BOOKED: return 'sold';
      case SeatStatus.RESERVED: return 'reserved';
      case SeatStatus.BLOCKED: return 'blocked';
      default: return 'available';
    }
  }

  getSeatTooltip(seat: Seat): string {
    const status = this.getSeatClass(seat);
    const price = this.formatPrice(seat.price);
    return `Row ${seat.rowLabel}, Seat ${seat.seatNumber} - ${status} - ${price}`;
  }

  toggleSeatSelection(seat: Seat): void {
    if (![SeatStatus.AVAILABLE, SeatStatus.SELECTED].includes(seat.status)) {
      return;
    }

    if (seat.status === SeatStatus.SELECTED) {
      this.deselectSeat(seat);
    } else {
      this.selectSeat(seat);
    }
  }

  private selectSeat(seat: Seat) {
    if (this.selectedSeats.length >= this.maxSeats) {
      this.showError(`Maximum ${this.maxSeats} seats allowed`);
      return;
    }

    seat.status = SeatStatus.SELECTED;
    this.selectedSeats.push({
      id: seat.id,
      row: seat.rowLabel,
      number: seat.seatNumber,
      sectionName: seat.sectionName,
      tier: {
        id: seat.ticketType,
        name: seat.ticketType,
        price: seat.price,
        color: seat.color
      },
      price: seat.price,
      features: seat.features || [],
      isStandingArea: false
    });
  }

  private deselectSeat(seat: Seat) {
    seat.status = SeatStatus.AVAILABLE;
    this.selectedSeats = this.selectedSeats.filter(s => s.id !== seat.id);
  }

  // Error Handling
  private showError(message: string) {
    this.selectionError = message;
    setTimeout(() => this.selectionError = null, 3000);
  }

  // Navigation & Actions
  goBack() {
    this.router.navigate(['events', this.eventId, 'mobileseatmap']);
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

  addToCart() {
    if (this.selectedSeats.length === 0) return;
    const seatIds = this.selectedSeats.map(seat => seat.id);
    this.cartService.addToCart(this.eventId, seatIds);
    this.router.navigate(['/cart']);
  }

  // Helper Methods
  private findSeatById(seatId: string): Seat | undefined {
    for (const row of this.rows) {
      const seat = row.seats.find(s => s.id === seatId);
      if (seat) return seat;
    }
    return undefined;
  }

  getMinPrice(): number {
    if (!this.rows.length) return 0;
    return Math.min(...this.rows.map(row => row.price));
  }

  getTotalPrice(): number {
    return this.selectedSeats.reduce((total, seat) => total + seat.price, 0);
  }

  formatPrice(price: number): string {
    return `£${price.toFixed(2)}`;
  }

  // Add these helper methods to your component
getAllRows(): RowData[] {
  return this.rows;
}

hasBothSides(): boolean {
  return this.getLeftRows().length > 0 && this.getRightRows().length > 0;
}

isLeftSideBlock(blockLetter: string): boolean {
  return ['A', 'B', 'C', 'L', '1', '2', '3', 'Left'].includes(blockLetter);
}

isRightSideBlock(blockLetter: string): boolean {
  return ['X', 'Y', 'Z', 'R', '7', '8', '9', 'Right'].includes(blockLetter);
}


}