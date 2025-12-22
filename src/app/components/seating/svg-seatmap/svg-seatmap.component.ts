import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { SeatService } from '../../../core/services/seat.service';
import { getSeatColor, getSeatDisplayText, getSeatStatusConfig, isSeatSelectable, Seat, SEAT_STATUS_CONFIG, SeatManagement, SeatOverride, SeatSectionType, SeatStatus, SectionRowConfig, SelectedSeat, TicketType, VenueData, VenueSection } from '../../../core/models/seats.model';
import { SeatMapVisualComponent } from './seat-map-visual/seat-map-visual.component';
import { FormatDatePipe } from '../../../core/pipes/format-date.pipe';

@Component({
  selector: 'app-svg-seatmap',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SeatMapVisualComponent, FormatDatePipe],
  templateUrl: './svg-seatmap.component.html',
  styleUrls: ['./svg-seatmap.component.scss']
})
export class SVGSeatmapComponent implements OnInit, OnDestroy {
  // Data
  loading : boolean = false;
  venueData!: VenueData;
  seats: Seat[] = [];
  selectedSeats: SelectedSeat[] = [];
  selectedSeatIds: string[] = [];
  hoveredSeatId: string | null = null;
  eventId: string = "";
  
  // Zoom & Pan
  scale = 1;
  offsetX = 0;
  offsetY = 0;
  private zoomSpeed = 0.1;
  private isDragging = false;
  private lastMousePos = { x: 0, y: 0 };
  
  
  // Seat status configuration
  readonly seatStatusConfig = SEAT_STATUS_CONFIG;
  readonly SeatStatus = SeatStatus;
  readonly SeatSectionType = SeatSectionType;
  
  // Track middle section bounds
  middleMinX = Number.MAX_VALUE;
  middleMaxX = 0;
  middleBottomY = 0;

  constructor(
    private cartService: CartService,
    private seatService: SeatService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.eventId = params['id'];
      this.getSeatMap(this.eventId);
    });
  }

  ngOnDestroy() {
    this.cleanup();
  }

  getSeatMap(eventId: string) {
    this.loading = true;
    this.seatService.getSeatMap(eventId).subscribe({
      next: (seatmap) => {
        this.venueData = seatmap;
        this.generateSeats();

        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        console.error('Error loading event:', error);
      }
    });
  }

  // ========== SEAT GENERATION ==========
  generateSeats() {
    this.seats = [];
    this.middleMinX = Number.MAX_VALUE;
    this.middleMaxX = 0;
    this.middleBottomY = 0;
    
    const statusMap = new Map<string, SeatOverride>();
    const categories: (keyof SeatManagement)[] = ['reservedSeats', 'blockedSeats', 'soldSeats'];
    
    categories.forEach(category => {
      this.venueData.seatManagement[category].forEach(seatOverride => {
        statusMap.set(seatOverride.seatId, seatOverride);
      });
    });
    
    this.venueData.sections.forEach((section) => {
      const sectionType = section.seatSectionType || SeatSectionType.SEAT;
      
      if (sectionType === SeatSectionType.FOH) {
        return;
      }
      
      if (sectionType === SeatSectionType.STANDING) {
        const sectionPrefix = section.name.toUpperCase();
        const seatId = `${sectionPrefix}-ST`;
        
        const cx = section.x+ 22;
        const cy = section.y;
        
        const rowConfig = section.rowConfigs[0] || this.getDefaultRowConfig();
        
        const seat: Seat = {
          id: seatId,
          cx,
          cy,
          r: Math.max(section.seatsPerRow, section.rows) * 22 / 4,
          rowLabel: 'ST',
          seatNumber: 0,
          sectionId: section.id,
          sectionName: section.sectionLabel || section.name,
          sectionConfigId: rowConfig.id,
          ticketType: rowConfig.type, 
          status: SeatStatus.AVAILABLE,
          price: rowConfig.customPrice || 0,
          color: rowConfig.color,
          gridRow: section.rows,
          gridColumn: section.seatsPerRow,
          isStandingArea: true
        };
        
        this.seats.push(seat);
        return;
      }
      
      // Original logic for SEAT sections
      const rowOffset = section.rowOffset || 0;
      const sectionPrefix = section.name.toUpperCase();
      
      for (let r = 0; r < section.rows; r++) {
        const globalRow = r + rowOffset;
        const rowLetter = this.getRowLetter(r);
        
        const rowConfig = this.getRowConfigForSeat(section, r);
        const seatPrice = rowConfig.customPrice || 0;
        
        for (let c = 1; c <= section.seatsPerRow; c++) {
          const seatId = `${sectionPrefix}-${rowLetter}-${c}`;
          const cx = section.x + (c * 22);
          const cy = section.y + (globalRow * 22);
          
          const seatOverride = statusMap.get(seatId);
          const seatStatus: SeatStatus = seatOverride?.status || SeatStatus.AVAILABLE;
          
          const seat: Seat = {
            id: seatId,
            cx,
            cy,
            r: 8,
            rowLabel: rowLetter,
            seatNumber: c,
            sectionId: section.id,
            sectionName: section.sectionLabel || section.name,
            sectionConfigId: rowConfig.id,
            ticketType: rowConfig.type, 
            status: seatStatus,
            price: seatPrice,
            color: rowConfig.color,
            gridRow: globalRow,
            gridColumn: c,
            isStandingArea: false
          };
          
          this.seats.push(seat);
        }
      }
    });
  }
  
  private getRowConfigForSeat(section: VenueSection, rowIndex: number): SectionRowConfig {
    const config = section.rowConfigs.find(rc => 
      rowIndex >= rc.fromRow && rowIndex <= rc.toRow
    );
    
    if (!config) {
      return {
        id: crypto.randomUUID(),
        fromRow: 0,
        toRow: section.rows - 1,
        fromColumn: 0,
        toColumn: 0,
        type: 'SILVER',
        customPrice: 0,
        color: '#cccccc'
      };
    }
    
    return config;
  }

  private getDefaultRowConfig(): SectionRowConfig {
    return {
      id: crypto.randomUUID(),
      fromRow: 0,
      toRow: 0,
      fromColumn: 0,
      toColumn: 0,
      type: 'STANDING',
      customPrice: 0,
      color: '#cccccc'
    };
  }
  
  public getRowLetter(rowIndex: number): string {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    return letters[rowIndex % letters.length];
  }
  
  // ========== EVENT HANDLERS FROM VISUAL COMPONENT ==========
  onSeatClicked(seat: Seat) {
    if (!isSeatSelectable(seat.status)) return;
    
    if (seat.status === SeatStatus.SELECTED) {
      this.deselectSeat(seat);
    } else {
      this.selectSeat(seat);
    }
  }

  onSeatHovered(event: {seat: Seat | null, mouseX: number, mouseY: number}) {
    this.hoveredSeatId = event.seat?.id || null;
  }

  onDragStarted(event: MouseEvent) {
    if (event.button !== 0) return;
    
    this.isDragging = true;
    this.lastMousePos = { x: event.clientX, y: event.clientY };
  }

  onDragMoved(event: MouseEvent) {
    if (!this.isDragging) return;
    
    const container = document.querySelector('.svg-container');
    if (!container) return;
    
    const deltaX = this.lastMousePos.x - event.clientX;
    const deltaY = this.lastMousePos.y - event.clientY;
    
    container.scrollLeft += deltaX;
    container.scrollTop += deltaY;
    
    this.lastMousePos = { x: event.clientX, y: event.clientY };
  }

  onDragEnded() {
    this.isDragging = false;
  }

  onZoomed(event: WheelEvent) {
    event.preventDefault();
    
    const delta = event.deltaY > 0 ? -this.zoomSpeed : this.zoomSpeed;
    this.scale = Math.max(0.5, Math.min(3, this.scale + delta));
  }

  // ========== SEAT MANAGEMENT ==========
  selectSeat(seat: Seat) {
    seat.status = SeatStatus.SELECTED;
    
    const selectedSeat: SelectedSeat = {
      id: seat.id,
      row: seat.rowLabel,
      number: seat.seatNumber,
      sectionName: seat.sectionName,
      tier: {
        id: seat.id,
        name: seat.ticketType,
        price: seat.price,
        color: seat.color
      },
      price: seat.price,
      features: seat.features || [],
      isStandingArea: seat.isStandingArea || false,
    };
    
    this.selectedSeats.push(selectedSeat);
    this.selectedSeatIds.push(seat.id);
  }
  
  deselectSeat(seat: Seat) {
    seat.status = SeatStatus.AVAILABLE;
    this.selectedSeats = this.selectedSeats.filter(s => s.id !== seat.id);
    this.selectedSeatIds = this.selectedSeatIds.filter(id => id !== seat.id);
  }
  
  // ========== HELPER METHODS ==========
  getSeatById(seatId: string): Seat | undefined {
    return this.seats.find(s => s.id === seatId);
  }
  
  onRemoveSeat(seatId: string, event: MouseEvent) {
    event.stopPropagation();
    const seat = this.getSeatById(seatId);
    if (seat) {
      this.deselectSeat(seat);
    }
  }
  
  getTotalPrice(): number {
    return this.selectedSeats.reduce((total, seat) => total + seat.price, 0);
  }
  
  addToCart() {
    if (this.selectedSeatIds.length === 0) return;
    
    // Collect all seat IDs
    const seatIdsArray: string[] = [];
    
    this.selectedSeats.forEach(seat => {
      const svgSeat = this.seats.find(s => s.id === seat.id);
      if (svgSeat) {
        const cartSeat = {
          id: seat.id,
          sectionName: seat.sectionName,
          row: seat.row,
          number: seat.number,
          price: seat.price,
          type: this.mapTicketTypeToCartType(svgSeat.ticketType) as 'standard' | 'vip' | 'accessible'| 'standing' | 'seated',
          status: 'SELECTED' as 'available' | 'selected' | 'taken' | 'reserved',
          x: svgSeat.cx,
          y: svgSeat.cy,
          rowLabel: svgSeat.rowLabel,
          seatNumber: svgSeat.seatNumber,
          ticketType: svgSeat.ticketType,
          color: svgSeat.color,
          features: seat.features || [],
          isStandingArea: svgSeat.isStandingArea || false
        };
        
        seatIdsArray.push(seat.id);
      }
    });
    
    // Add ALL seats to cart at once
    if (seatIdsArray.length > 0) {
      this.cartService.addSeatsToCart(this.eventId, seatIdsArray);
    }
    
    this.clearSelection();
  }
  
  private mapTicketTypeToCartType(ticketType: TicketType): 'standard' | 'vip' | 'accessible' | 'standing' | 'seated' | 'foh' {
    const typeMap: Record<TicketType, 'standard' | 'vip' | 'accessible' | 'standing' | 'seated' | 'foh'> = {
      VIP: 'vip',
      DIAMOND: 'vip',
      GOLD: 'standard',
      SILVER: 'standard',
      FOH: 'foh',
      STANDING: 'standing'
    };
    
    return typeMap[ticketType] || 'standard';
  }
  
  clearSelection() {
    this.selectedSeats.forEach(seat => {
      const seatElement = this.seats.find(s => s.id === seat.id);
      if (seatElement) {
        seatElement.status = SeatStatus.AVAILABLE;
      }
    });
    this.selectedSeats = [];
    this.selectedSeatIds = [];
  }
  
  zoomIn() {
    this.scale = Math.min(3, this.scale * 1.2);
  }

  zoomOut() {
    this.scale = Math.max(0.5, this.scale * 0.8);
  }

  resetView() {
    this.scale = 1;
    this.offsetX = 0;
    this.offsetY = 0;
  }
  
  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-UK', {
      style: 'currency',
      currency: 'GBP'
    }).format(price);
  }
  
  
  getRowArray(count: number): any[] {
    return new Array(count);
  }
  
  getUniqueTicketTiers(): Array<{name: string, price: number, color: string}> {
    const tiers = new Map<string, {name: string, price: number, color: string}>();
    
    this.venueData.sections.forEach(section => {
      section.rowConfigs.forEach(rowConfig => {
        const key = rowConfig.type;
        if (!tiers.has(key)) {
          tiers.set(key, {
            name: rowConfig.type,
            price: rowConfig.customPrice || 0,
            color: rowConfig.color
          });
        }
      });
    });
    
    return Array.from(tiers.values());
  }
  
  getDisplayStatuses() {
    const statuses = [
      SeatStatus.SELECTED,
      SeatStatus.BOOKED,
      SeatStatus.UNAVAILABLE,
      SeatStatus.PARTIAL_VIEW,
      SeatStatus.RESERVED,
      SeatStatus.BLOCKED
    ];
    
    return statuses.map(status => ({
      status,
      displayText: this.getSeatStatusText(status, 'VIP'),
      price: ''
    }));
  }
  
  getSeatStatusText(status: SeatStatus, ticketType: TicketType): string {
    return getSeatDisplayText(status, ticketType);
  }

  getSeatColor(seat: Seat): string {
    return getSeatColor(seat);
  }

  getSeatStroke(seat: Seat): string {
    return getSeatStatusConfig(seat.status).stroke;
  }

  getSeatStrokeWidth(seat: Seat): number {
    return getSeatStatusConfig(seat.status).strokeWidth;
  }

  getSeatOpacity(seat: Seat): number {
    return getSeatStatusConfig(seat.status).opacity;
  }

  getSeatCursor(seat: Seat): string {
    return getSeatStatusConfig(seat.status).cursor;
  }

  canSelectSeat(seat: Seat): boolean {
    return isSeatSelectable(seat.status);
  }

  private cleanup() {
    // Clean up if needed
  }
}