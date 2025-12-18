import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { VenueData, VenueSection, SectionRowConfig, SeatStatus, TicketType, Seat, SelectedSeat } from '../../../core/models/seats.model';
import { CartService } from '../../../core/services/cart.service';

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
  venueData: VenueData;
  selectedSeats: SelectedSeat[] = [];
  
  rows: RowData[] = [];
  
  readonly SeatStatus = SeatStatus;
  
  // Selection state
  maxSeats = 8;
  selectionError: string | null = null;
  
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private cartService : CartService
  ) {
    this.venueData = this.initializeVenueData();
  }
  
  ngOnInit() {
    // Get section ID from route
    this.route.params.subscribe(params => {
      const sectionId = params['sectionId'];
      this.loadSectionData(sectionId);
      this.generateSeats();
    });
  }
  
  ngOnDestroy() {
    // Cleanup
  }
  
  private initializeVenueData(): VenueData {
    // Keep your existing venue data
    return {
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
            customPrice: 25,
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
            customPrice: 30,
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
            customPrice: 75,
            color: '#8a6b8c'
          },
          { 
            fromRow: 3, 
            toRow: 14, 
            type: 'DIAMOND', 
            customPrice: 50,
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
            customPrice: 75,
            color: '#8a6b8c'
          },
          { 
            fromRow: 3, 
            toRow: 14, 
            type: 'DIAMOND', 
            customPrice: 50,
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
            customPrice: 30,
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
            customPrice: 25,
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
  }
  
  private loadSectionData(sectionId: string) {
    const foundSection = this.venueData.sections.find(s => 
      s.id.toLowerCase() === sectionId.toLowerCase() ||
      (s.sectionLabel && s.sectionLabel.toLowerCase().replace(/\s+/g, '-') === sectionId.toLowerCase())
    );
    
    if (foundSection) {
      this.section = foundSection;
    } else {
      this.section = this.createDefaultSection(sectionId);
    }
  }
  
  private createDefaultSection(sectionId: string): VenueSection {
    const sectionName = sectionId.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
    
    return {
      id: '1',
      name: sectionId.toUpperCase(),
      x: 450,
      y: 150,
      rows: 15,
      seatsPerRow: 10,
      sectionLabel: sectionName,
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
    };
  }
  
  private generateSeats() {
    this.rows = [];
    const rowOffset = this.section.rowOffset || 0;
    
    for (let r = 0; r < this.section.rows; r++) {
      const globalRow = r + rowOffset;
      const rowLetter = this.getRowLetter(r);
      const rowConfig = this.getRowConfigForSeat(r);
      
      const rowData: RowData = {
        letter: rowLetter,
        seats: [],
        ticketType: rowConfig.type,
        price: rowConfig.customPrice || 0,
        color: rowConfig.color
      };
      
      for (let c = 1; c <= this.section.seatsPerRow; c++) {
        const seatId = `${this.section.name}-${rowLetter}-${c}`;
        const status = this.getSeatStatus(seatId);
        
        const seat: Seat = {
          id: seatId,
          cx: c * 40,
          cy: r * 40,
          r: 15,
          rowLabel: rowLetter,
          seatNumber: c,
          section: this.section.sectionLabel || this.section.name,
          ticketType: rowConfig.type,
          status: status,
          price: rowConfig.customPrice || 0,
          color: rowConfig.color,
          features: this.generateSeatFeatures(rowConfig.type, r, c),
          gridRow: globalRow,
          gridColumn: c,
          metadata: {}
        };
        
        rowData.seats.push(seat);
      }
      
      this.rows.push(rowData);
    }
    
    // Reverse rows so A is at the bottom (closest to stage)
    //this.rows.reverse();
  }
  
  private getRowConfigForSeat(rowIndex: number): SectionRowConfig {
    const config = this.section.rowConfigs?.find(rc => 
      rowIndex >= rc.fromRow && rowIndex <= rc.toRow
    );
    
    if (!config) {
      return {
        fromRow: 0,
        toRow: this.section.rows - 1,
        type: 'SILVER' as TicketType,
        customPrice: 0,
        color: '#cccccc'
      };
    }
    
    return config;
  }
  
  private getRowLetter(rowIndex: number): string {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    return letters[rowIndex % letters.length];
  }
  
  private getSeatStatus(seatId: string): SeatStatus {
    const isSold = this.venueData.seatManagement.soldSeats.some(s => s.seatId === seatId);
    const isReserved = this.venueData.seatManagement.reservedSeats.some(s => s.seatId === seatId);
    const isBlocked = this.venueData.seatManagement.blockedSeats.some(s => s.seatId === seatId);
    
    if (isSold) return SeatStatus.SOLD;
    if (isReserved) return SeatStatus.RESERVED;
    if (isBlocked) return SeatStatus.BLOCKED;
    
    const isSelected = this.selectedSeats.some(s => s.id === seatId);
    if (isSelected) return SeatStatus.SELECTED;
    
    return SeatStatus.AVAILABLE;
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
      section: seat.section,
      tier: {
        id: this.getTicketTierId(seat.ticketType),
        name: seat.ticketType,
        price: seat.price,
        color: seat.color
      },
      price: seat.price,
      features: seat.features || []
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
    // Get event ID from route
    const eventId = this.route.snapshot.params['id'];

     this.router.navigate(['events', 'eventId', 'mobileseatmap']);
  }
  
  goToCart() {
    this.saveSelectionToStorage();
    this.router.navigate(['/cart']);
  }
  
  goToSummary() {
    if (this.selectedSeats.length === 0) {
      this.selectionError = 'Please select at least one seat';
      setTimeout(() => this.selectionError = null, 3000);
      return;
    }
    
    this.saveSelectionToStorage();
    
    // Navigate to summary page
    const eventId = this.route.snapshot.params['id'];
    this.router.navigate(['events', eventId, 'seating', 'summary']);
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
      FOH: '5'
    };
    return tierMap[ticketType] || '0';
  }
  
  isSeatSelectable(seat: Seat): boolean {
    return seat.status === SeatStatus.AVAILABLE || seat.status === SeatStatus.SELECTED;
  }
  
  getSeatColor(seat: Seat): string {
    if (seat.status === SeatStatus.SELECTED) return '#4CAF50';
    if (seat.status === SeatStatus.SOLD) return '#999999';
    if (seat.status === SeatStatus.RESERVED) return '#FF9800';
    if (seat.status === SeatStatus.BLOCKED) return '#f44336';
    return seat.color;
  }
  
  getSeatStatusText(seat: Seat): string {
    switch (seat.status) {
      case SeatStatus.SELECTED: return 'Selected';
      case SeatStatus.SOLD: return 'Sold';
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
  
  getMinPrice(): number {
    if (!this.section?.rowConfigs?.length) return 0;
    return Math.min(...this.section.rowConfigs.map(config => config.customPrice || 0));
  }
  
  getMaxPrice(): number {
    if (!this.section?.rowConfigs?.length) return 0;
    return Math.max(...this.section.rowConfigs.map(config => config.customPrice || 0));
  }
  
  getTotalPrice(): number {
    return this.selectedSeats.reduce((total, seat) => total + seat.price, 0);
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
  private mapTicketTypeToCartType(ticketType: TicketType): 'standard' | 'vip' | 'accessible' | 'standing' | 'seated'| 'foh' {
    const typeMap: Record<TicketType, 'standard' | 'vip' | 'accessible' | 'standing' | 'seated'| 'foh'> = {
      VIP: 'vip',
      DIAMOND: 'vip',
      GOLD: 'standard',
      SILVER: 'standard',
      FOH: 'foh'
    };
    
    return typeMap[ticketType] || 'standard';
  }
}