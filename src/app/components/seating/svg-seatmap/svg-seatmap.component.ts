import { Component, ElementRef, ViewChild, OnInit, AfterViewInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { getSeatColor, getSeatDisplayText, getSeatStatusConfig, isSeatSelectable, Seat, SEAT_STATUS_CONFIG, SeatManagement, SeatOverride, SeatStatus, SectionRowConfig, SelectedSeat, TicketType, VenueData, VenueSection } from '../../../core/models/seats.model';
import { SeatService } from '../../../core/services/seat.service';

@Component({
  selector: 'app-svg-seatmap',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './svg-seatmap.component.html',
  styleUrls: ['./svg-seatmap.component.scss']
})
export class SVGSeatmapComponent implements OnInit, AfterViewInit {
  @ViewChild('svgElement') svgElement!: ElementRef<SVGSVGElement>;
  @ViewChild('svgContainer') svgContainer!: ElementRef<HTMLDivElement>;

  // Make SeatStatus available in template
  readonly SeatStatus = SeatStatus;
  MAX_VALUE = Number.MAX_VALUE;

  
  // Canvas dimensions (base values)
  readonly CANVAS_WIDTH = 1400;
  readonly CANVAS_HEIGHT = 900;
  readonly BASE_SEAT_RADIUS = 8;
  readonly BASE_SEAT_GAP = 22;
  readonly STAGE_Y = 0;
  readonly STAGE_WIDTH = 500;
  readonly STAGE_HEIGHT = 60;

  // Dynamic sizing for responsive design
  get seatRadius(): number {
    return this.BASE_SEAT_RADIUS;
  }
  
  get seatGap(): number {
    return this.BASE_SEAT_GAP;
  }
  
  get stageFontSize(): number {
    return 18;
  }
  
  seats: Seat[] = [];
  hoveredSeat: Seat | null = null;
  
  // Zoom & Pan
  scale = 1;
  private zoomSpeed = 0.1; // Adjust for faster/slower zoom
  private isDragging = false;
  private lastMousePos = { x: 0, y: 0 };

  offsetX = 0;
  offsetY = 0;
  private isPanning = false;
  private panStart = { x: 0, y: 0 };
  
  private isTouching = false;

  
  // Tooltip
  tooltipLeft = 0;
  tooltipTop = 0;
  private tooltipUpdateTimeout: any;
  private lastHoveredSeatId: string | null = null;
  private isTooltipVisible = false;
  
  // Selected seats
  selectedSeats: SelectedSeat[] = [];
  
  // Track middle section bounds for FOH
  middleMinX = Number.MAX_VALUE;
  middleMaxX = 0;
  middleBottomY = 0;
  
  // Event details
  event = {
    title: 'SITHARA\'S PROJECT MALABARICUS - Manchester',
    date: new Date('2026-01-15'),
    time: '19:30',
    venue: 'Manchester venue'
  };
  
  // Seat status configuration
  readonly seatStatusConfig = SEAT_STATUS_CONFIG;
  
  // Single source of truth: venue configuration
public readonly venueData: VenueData;

  constructor(private cartService: CartService, seatservice : SeatService) {
    this.venueData = seatservice.getSeatMapConfig();
  }
  
  // ========== LIFECYCLE HOOKS ==========
  
  ngOnInit() {
    this.generateSeats();
  }
  
  ngAfterViewInit() {
    this.setupInteractions();
  }
  
  ngOnDestroy() {
    this.cleanup();
  }
  
 


  // ========== SEAT MANAGEMENT ==========
  
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
      const rowOffset = section.rowOffset || 0;
      
      for (let r = 0; r < section.rows; r++) {
        const globalRow = r + rowOffset;
        const rowLetter = this.getRowLetter(r);
        
        const rowConfig = this.getRowConfigForSeat(section, r);
        const seatPrice = rowConfig.customPrice || 0;
        
        for (let c = 1; c <= section.seatsPerRow; c++) {
          const seatId = `${section.name}-${rowLetter}-${c}`;
          const cx = section.x + (c * this.seatGap);
          const cy = section.y + (globalRow * this.seatGap);
          
          const seatOverride = statusMap.get(seatId);
          const seatStatus: SeatStatus = seatOverride?.status || SeatStatus.AVAILABLE;
          
          const seat: Seat = {
            id: seatId,
            cx,
            cy,
            r: this.seatRadius,
            rowLabel: rowLetter,
            seatNumber: c,
            section: section.sectionLabel || section.name,
            ticketType: rowConfig.type,
            status: seatStatus,
            price: seatPrice,
            color: rowConfig.color,
            gridRow: globalRow,
            gridColumn: c,
            metadata: {
              overrideReason: seatOverride?.reason,
              bookingId: seatOverride?.bookingId,
              reservationId: seatOverride?.reservationId
            }
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
        fromRow: 0,
        toRow: section.rows - 1,
        type: 'SILVER',
        customPrice: 0,
        color: '#cccccc'
      };
    }
    
    return config;
  }
  
  public getRowLetter(rowIndex: number): string {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    return letters[rowIndex % letters.length];
  }
  
  // ========== SEAT INTERACTION ==========
  
  onSeatClick(seat: Seat, event: MouseEvent) {
    event.stopPropagation();
    
    if (!this.canSelectSeat(seat)) return;
    
    if (seat.status === SeatStatus.SELECTED) {
      this.deselectSeat(seat);
    } else {
      this.selectSeat(seat);
    }
  }
  
  selectSeat(seat: Seat) {
    seat.status = SeatStatus.SELECTED;
    
    const selectedSeat: SelectedSeat = {
      id: seat.id,
      row: seat.rowLabel,
      number: seat.seatNumber,
      section: seat.section,
      tier: {
        id: seat.id,
        name: seat.ticketType,
        price: seat.price,
        color: seat.color
      },
      price: seat.price,
      features: seat.features || []
    };
    
    this.selectedSeats.push(selectedSeat);
  }
  
  deselectSeat(seat: Seat) {
    seat.status = SeatStatus.AVAILABLE;
    this.selectedSeats = this.selectedSeats.filter(s => s.id !== seat.id);
  }
  
  // ========== TOOLTIP MANAGEMENT ==========
  
  onHover(event: MouseEvent) {
    if (this.isPanning || this.isTouching) {
      this.hideTooltip();
      return;
    }
    
    if (this.tooltipUpdateTimeout) {
      clearTimeout(this.tooltipUpdateTimeout);
    }
    
    this.tooltipUpdateTimeout = setTimeout(() => {
      const container = this.svgContainer?.nativeElement;
      if (!container) return;
      
      const rect = container.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;
      
      const adjustedX = (mouseX - this.offsetX) / this.scale;
      const adjustedY = (mouseY - this.offsetY) / this.scale;
      
      const hoveredSeat = this.seats.find(seat => {
        const dx = seat.cx - adjustedX;
        const dy = seat.cy - adjustedY;
        return Math.sqrt(dx * dx + dy * dy) <= this.seatRadius * 1.5;
      });
      
      if (hoveredSeat?.id !== this.lastHoveredSeatId) {
        this.hoveredSeat = hoveredSeat || null;
        this.lastHoveredSeatId = hoveredSeat?.id || null;
        
        if (this.hoveredSeat && this.hoveredSeat.status !== SeatStatus.UNAVAILABLE) {
          this.updateTooltipPosition(mouseX, mouseY);
          this.showTooltip();
        } else {
          this.hideTooltip();
        }
      } else if (this.hoveredSeat) {
        this.updateTooltipPosition(mouseX, mouseY);
      }
    }, 30);
  }
  
private updateTooltipPosition(mouseX: number, mouseY: number) {
  if (!this.hoveredSeat) return;
  
  const container = this.svgContainer?.nativeElement;
  if (!container) return;
  
  const rect = container.getBoundingClientRect();
  
  // Position tooltip near mouse cursor
  this.tooltipLeft = mouseX + 15;  // 15px right of cursor
  this.tooltipTop = mouseY - 40;   // 40px above cursor
  
  this.adjustTooltipPosition(rect.width, rect.height);
}
  
  private adjustTooltipPosition(containerWidth: number, containerHeight: number) {
    const tooltipWidth = 200;
    const tooltipHeight = 100;
    
    if (this.tooltipLeft + tooltipWidth > containerWidth) {
      this.tooltipLeft = containerWidth - tooltipWidth - 10;
    }
    
    if (this.tooltipLeft < 10) {
      this.tooltipLeft = 10;
    }
    
    if (this.tooltipTop < 10) {
      this.tooltipTop = this.hoveredSeat!.cy * this.scale + this.offsetY + this.seatRadius + 10;
    }
    
    if (this.tooltipTop + tooltipHeight > containerHeight) {
      this.tooltipTop = containerHeight - tooltipHeight - 10;
    }
  }
  
  private showTooltip() {
    this.isTooltipVisible = true;
  }
  
  hideTooltip() {
    this.hoveredSeat = null;
    this.lastHoveredSeatId = null;
    this.isTooltipVisible = false;
  }
  
  shouldShowTooltip(): boolean {
    return this.isTooltipVisible && 
           this.hoveredSeat !== null && 
           this.hoveredSeat.status !== SeatStatus.UNAVAILABLE;
  }
  
  // ========== ZOOM & PAN ==========
  
  setupInteractions() {
    const svg = this.svgElement.nativeElement;
    
    svg.addEventListener('mousedown', (e) => this.startPan(e));
    svg.addEventListener('mousemove', (e) => this.onHover(e));
    svg.addEventListener('mouseup', () => this.endPan());
    svg.addEventListener('mouseleave', () => {
      this.endPan();
      this.onSvgMouseLeave();
    });
    
    //svg.addEventListener('wheel', (e) => this.onZoom(e), { passive: false });
  }
  
  startPan(event: MouseEvent) {
    this.isPanning = event.button === 1 || event.altKey;
    this.panStart = { x: event.clientX, y: event.clientY };
  }
  
  endPan() {
    this.isPanning = false;
  }
  
  zoomIn() {
  this.scale = Math.min(3, this.scale * 1.2);
}

zoomOut() {
  this.scale = Math.max(0.5, this.scale * 0.8);
}

  onZoom(event: WheelEvent) {
  event.preventDefault();
  
  const delta = event.deltaY > 0 ? -this.zoomSpeed : this.zoomSpeed;
  this.scale = Math.max(0.5, Math.min(3, this.scale + delta));
  }
  
  zoomAt(factor: number, centerX: number, centerY: number) {
    const prevScale = this.scale;
    const maxScale = 2.5;
    const minScale = 0.6;
    
    this.scale = Math.min(maxScale, Math.max(minScale, this.scale * factor));
    
    this.offsetX -= (centerX / prevScale - centerX / this.scale);
    this.offsetY -= (centerY / prevScale - centerY / this.scale);
  }
  
  resetView() {
    this.scale = 1;
    this.offsetX = 0;
    this.offsetY = 0;
  }
  

  // ========== SEAT STYLING ==========
  
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
  
  getSeatStatusText(status: SeatStatus, ticketType: TicketType): string {
    return getSeatDisplayText(status, ticketType);
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
  
  getSectionSeatCount(section: any): number {
    return section.rows.reduce((total: number, row: any) => total + row.seats.length, 0);
  }
  
  getTotalPrice(): number {
    return this.selectedSeats.reduce((total, seat) => total + seat.price, 0);
  }
  
  addToCart() {
    if (this.selectedSeats.length === 0) return;
    
    this.selectedSeats.forEach(seat => {
      const svgSeat = this.seats.find(s => s.id === seat.id);
      if (svgSeat) {
        const cartSeat = {
          id: seat.id,
          section: seat.section,
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
          features: seat.features || []
        };

        this.cartService.addSeat(cartSeat);
      }
    });
    
    this.clearSelection();
  }
  
  private mapTicketTypeToCartType(ticketType: TicketType): 'standard' | 'vip' | 'accessible' | 'standing' | 'seated' | 'foh' {
    const typeMap: Record<TicketType, 'standard' | 'vip' | 'accessible' | 'standing' | 'seated' | 'foh'> = {
      VIP: 'vip',
      DIAMOND: 'vip',
      GOLD: 'standard',
      SILVER: 'standard',
      FOH: 'foh',
      STANDING : 'standing'
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
  }
  
  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-UK', {
      style: 'currency',
      currency: 'GBP'
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
      SeatStatus.SOLD,
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
  
  onSvgMouseLeave() {
    this.hideTooltip();
  }
  
  private cleanup() {

    if (this.tooltipUpdateTimeout) {
      clearTimeout(this.tooltipUpdateTimeout);
    }
    
  }

  // On mousedown - start drag
startDrag(event: MouseEvent) {
  // Only left mouse button
  if (event.button !== 0) return;
  
  this.isDragging = true;
  this.lastMousePos = { x: event.clientX, y: event.clientY };
  
  // Change cursor
  const container = this.svgContainer?.nativeElement;
  if (container) {
    container.style.cursor = 'grabbing';
  }
}

// On mousemove - do drag
doDrag(event: MouseEvent) {
  if (!this.isDragging) return;
  
  const container = this.svgContainer?.nativeElement;
  if (!container) return;
  
  // Calculate how far mouse moved
  const deltaX = this.lastMousePos.x - event.clientX;
  const deltaY = this.lastMousePos.y - event.clientY;
  
  // Move the scroll
  container.scrollLeft += deltaX;
  container.scrollTop += deltaY;
  
  // Update mouse position
  this.lastMousePos = { x: event.clientX, y: event.clientY };
}

// On mouseup - stop drag
stopDrag() {
  this.isDragging = false;
  
  // Reset cursor
  const container = this.svgContainer?.nativeElement;
  if (container) {
    container.style.cursor = 'grab';
  }
}
}