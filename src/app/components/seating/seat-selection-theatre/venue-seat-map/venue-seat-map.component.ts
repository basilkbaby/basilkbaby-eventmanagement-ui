import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Event } from '../../../../core/models/event.model';
interface Seat {
  id: string;
  row: string;
  number: number;
  cx: number;
  cy: number;
  isAvailable: boolean;
  isSelected: boolean;
  section: string;
  type: 'standard' | 'wheelchair' | 'premium';
}

interface SeatSection {
  id: string;
  name: string;
  color: string;
  price: number;
}

@Component({
  selector: 'app-venue-seat-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './venue-seat-map.component.html',
  styleUrls: ['./venue-seat-map.component.scss']
})
export class VenueSeatMapComponent implements AfterViewInit {
  @Input() event: Event | null = null;
  @Input() selectedSection: any = null;
  @Output() seatsSelected = new EventEmitter<any[]>();
  
  @ViewChild('svgContainer') svgContainer!: ElementRef<SVGElement>;
  
  seats: Seat[] = [];
  selectedSeats: Seat[] = [];
  zoom: number = 1;
  totalPrice: number = 0;
  
  // Legend items
  legendItems = [
    { label: 'Available', color: '#9CA3AF', type: 'available' },
    { label: 'Selected', color: '#4F46E5', type: 'selected' },
    { label: 'Unavailable', color: '#6B7280', type: 'unavailable' },
    { label: 'Wheelchair', color: '#F59E0B', type: 'wheelchair' },
    { label: 'Premium', color: '#EC4899', type: 'premium' }
  ];

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.generateSeats();
    }, 100);
  }

  ngOnChanges(): void {
    if (this.selectedSection) {
      this.generateSeats();
    }
  }

  private generateSeats(): void {
    if (!this.selectedSection) return;
    
    this.seats = [];
    const sectionId = this.selectedSection.id;
    const totalSeats = this.selectedSection.totalSeats;
    const rows = Math.ceil(totalSeats / 20); // ~20 seats per row
    const seatSpacing = 24;
    const rowSpacing = 30;
    const startY = 200;
    
    // Generate seats based on section type
    for (let row = 1; row <= rows; row++) {
      const rowLetter = this.getRowLetter(row - 1);
      const seatsInRow = Math.min(20, totalSeats - ((row - 1) * 20));
      const rowY = startY + (row - 1) * rowSpacing;
      
      for (let seatNum = 1; seatNum <= seatsInRow; seatNum++) {
        const cx = 400 + (seatNum - seatsInRow/2 - 0.5) * seatSpacing;
        const isAvailable = Math.random() > 0.3; // 70% availability
        const isWheelchair = row === 1 && (seatNum === 1 || seatNum === seatsInRow);
        const isPremium = (sectionId === 'vip' && row <= 3) || 
                         (sectionId === 'diamond' && row === 1);
        
        this.seats.push({
          id: `${sectionId}-${rowLetter}-${seatNum}`,
          row: rowLetter,
          number: seatNum,
          cx: cx,
          cy: rowY,
          isAvailable: isAvailable,
          isSelected: false,
          section: sectionId,
          type: isWheelchair ? 'wheelchair' : isPremium ? 'premium' : 'standard'
        });
      }
    }
  }

  private getRowLetter(rowIndex: number): string {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    let index = rowIndex;
    
    do {
      result = letters[index % 26] + result;
      index = Math.floor(index / 26) - 1;
    } while (index >= 0);
    
    return result || 'A';
  }

  toggleSeat(seat: Seat): void {
    if (!seat.isAvailable) return;

    if (seat.isSelected) {
      seat.isSelected = false;
      this.selectedSeats = this.selectedSeats.filter(s => s.id !== seat.id);
    } else {
      if (this.selectedSeats.length >= 8) {
        return;
      }

      seat.isSelected = true;
      this.selectedSeats.push(seat);
    }
    
    this.updateTotalPrice();
    this.emitSeats();
  }

  clearSelection(): void {
    this.seats.forEach(seat => {
      seat.isSelected = false;
    });
    this.selectedSeats = [];
    this.updateTotalPrice();
    this.emitSeats();
  }

  private updateTotalPrice(): void {
    this.totalPrice = this.selectedSeats.reduce((total, seat) => {
      return total + (this.selectedSection?.price || 0);
    }, 0);
  }

  private emitSeats(): void {
    const seatData = this.selectedSeats.map(seat => ({
      ...seat,
      tier: {
        id: this.selectedSection.id,
        name: this.selectedSection.name,
        price: this.selectedSection.price
      },
      price: this.selectedSection.price,
      sectionName: this.selectedSection.name
    }));
    
    this.seatsSelected.emit(seatData);
  }

  getSeatColor(seat: Seat): string {
    if (!seat.isAvailable) return '#6B7280';
    if (seat.isSelected) return '#4F46E5';
    if (seat.type === 'wheelchair') return '#F59E0B';
    if (seat.type === 'premium') return '#EC4899';
    return this.selectedSection?.color || '#9CA3AF';
  }

  getSeatStrokeColor(seat: Seat): string {
    if (!seat.isAvailable) return '#4B5563';
    if (seat.isSelected) return '#3730A3';
    if (seat.type === 'wheelchair') return '#D97706';
    if (seat.type === 'premium') return '#BE185D';
    return '#6B7280';
  }

  getSeatStrokeWidth(seat: Seat): number {
    if (seat.isSelected) return 2;
    if (seat.type === 'premium') return 1.5;
    return 1;
  }

  zoomIn(): void {
    if (this.zoom < 2) this.zoom += 0.1;
  }

  zoomOut(): void {
    if (this.zoom > 0.5) this.zoom -= 0.1;
  }

  resetZoom(): void {
    this.zoom = 1;
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-UK', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 2
    }).format(price);
  }
}