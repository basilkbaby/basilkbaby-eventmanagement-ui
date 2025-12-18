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

  // Mobile/tablet detection
  isMobile = false;
  isTablet = false;
  private mobileBreakpoint = 768;
  private tabletBreakpoint = 1024;
  
  // Mobile UI state
  showMobileMenu = false;
  showSelectedSummary = false;
  showLegend = false;
  
  // Canvas dimensions (base values)
  readonly CANVAS_WIDTH = 1400;
  readonly CANVAS_HEIGHT = 900;
  readonly BASE_SEAT_RADIUS = 8;
  readonly BASE_SEAT_GAP = 22;
  readonly STAGE_Y = 30;
  readonly STAGE_WIDTH = 500;
  readonly STAGE_HEIGHT = 60;
  mobileViewMode: 'list' | 'map' = 'list'; // Default to list on mobile

  // Dynamic sizing for responsive design
  get seatRadius(): number {
    if (this.isMobile) return 6;
    if (this.isTablet) return 7;
    return this.BASE_SEAT_RADIUS;
  }
  
  get seatGap(): number {
    if (this.isMobile) return 18;
    if (this.isTablet) return 20;
    return this.BASE_SEAT_GAP;
  }
  
  get stageFontSize(): number {
    if (this.isMobile) return 14;
    if (this.isTablet) return 16;
    return 18;
  }
  
  seats: Seat[] = [];
  hoveredSeat: Seat | null = null;
  
  // Zoom & Pan
  scale = 1;
  offsetX = 0;
  offsetY = 0;
  private isPanning = false;
  private panStart = { x: 0, y: 0 };
  
  // Touch gesture support
  private touchStartX = 0;
  private touchStartY = 0;
  private lastTouchX = 0;
  private lastTouchY = 0;
  private isTouching = false;
  private initialPinchDistance = 0;
  private lastTap = 0;
  
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
public readonly venueData: VenueData = {
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

   mobileAvailableSeats: {
    section: string;
    ticketType: TicketType;
    price: number;
    color: string;
    seats: { id: string; row: string; number: number; features: string[] }[];
  }[] = [];
   // Mobile filter state
mobileFilters = {
  section: 'all',
  ticketType: 'all' as TicketType | 'all', // Add type union
  sortBy: 'price' as 'price' | 'row'
};
    // Mobile selected seat IDs for easy management
  mobileSelectedSeatIds = new Set<string>();
  
    // Mobile seat data organized by section and row
  mobileVenueLayout: {
    section: string;
    rows: {
      rowLabel: string;
      seats: {
        id: string;
        number: number;
        ticketType: TicketType;
        price: number;
        color: string;
        status: SeatStatus;
        features: string[];
      }[];
    }[];
  }[] = [];
  
  constructor(private cartService: CartService, seatservice : SeatService) {
    this.venueData = seatservice.getSeatMapConfig();
  }
  
  // ========== LIFECYCLE HOOKS ==========
  
  ngOnInit() {
    this.checkViewport();
    if (this.isMobile) {
      this.mobileViewMode = 'list'; // Default to list on mobile
      this.generateMobileVenueLayout();
    } else {
      this.generateSeats();
    }
    this.setupResizeListener();
  }
  
  ngAfterViewInit() {
    this.setupInteractions();
    this.setupMobileGestures();
    
  }
  
  ngOnDestroy() {
    this.cleanup();
  }
  
  @HostListener('window:resize')
  onResize() {
    this.checkViewport();
  }
  
  // ========== RESPONSIVE HELPERS ==========
  
  private checkViewport() {
    const width = window.innerWidth;
    this.isMobile = width < this.mobileBreakpoint;
    this.isTablet = width >= this.mobileBreakpoint && width < this.tabletBreakpoint;
    
    // Adjust initial scale for mobile
    if (this.isMobile && this.scale > 1.5) {
      this.scale = 1.5;
    }
  }
  
  private setupResizeListener() {
    window.addEventListener('resize', () => this.checkViewport());
  }
  
  // ========== MOBILE GESTURES ==========
  
  private setupMobileGestures() {
    const svg = this.svgElement.nativeElement;
    
    svg.addEventListener('touchstart', (e) => this.onTouchStart(e), { passive: false });
    svg.addEventListener('touchmove', (e) => this.onTouchMove(e), { passive: false });
    svg.addEventListener('touchend', (e) => this.onTouchEnd(e));
  }

  generateMobileSeatList() {
    this.mobileAvailableSeats = [];
    const seatsBySection = new Map<string, any>();
    
    // Process all seats from venue data
    this.venueData.sections.forEach((section) => {
      const rowOffset = section.rowOffset || 0;
      
      for (let r = 0; r < section.rows; r++) {
        const rowLetter = this.getRowLetter(r);
        const rowConfig = this.getRowConfigForSeat(section, r);
        
        for (let c = 1; c <= section.seatsPerRow; c++) {
          const seatId = `${section.name}-${rowLetter}-${c}`;
          
          // Check if seat is available
          const isSold = this.venueData.seatManagement.soldSeats.some(s => s.seatId === seatId);
          const isReserved = this.venueData.seatManagement.reservedSeats.some(s => s.seatId === seatId);
          const isBlocked = this.venueData.seatManagement.blockedSeats.some(s => s.seatId === seatId);
          
          if (!isSold && !isReserved && !isBlocked) {
            const key = `${section.sectionLabel || section.name}-${rowConfig.type}`;
            
            if (!seatsBySection.has(key)) {
              seatsBySection.set(key, {
                section: section.sectionLabel || section.name,
                ticketType: rowConfig.type,
                price: rowConfig.customPrice || 0,
                color: rowConfig.color,
                seats: []
              });
            }
            
            const group = seatsBySection.get(key)!;
            group.seats.push({
              id: seatId,
              row: rowLetter,
              number: c,
              features: this.generateSeatFeatures(rowConfig.type, section.name, r, c)
            });
          }
        }
      }
    });
    
  // Convert to array and sort with typed parameters
  this.mobileAvailableSeats = Array.from(seatsBySection.values())
    .map(group => ({
      ...group,
      seats: group.seats.sort((a: { row: string; number: number }, b: { row: string; number: number }) => {
        if (this.mobileFilters.sortBy === 'price') {
          return group.price - group.price; // Same price in group
        } else {
          // Sort by row then number
          const rowCompare = a.row.localeCompare(b.row);
          return rowCompare !== 0 ? rowCompare : a.number - b.number;
        }
      })
    }))
    .sort((a, b) => b.price - a.price); // Sort groups by price descending
  }
   // Generate venue layout for mobile list view
  generateMobileVenueLayout() {
    this.mobileVenueLayout = [];
    const sectionsMap = new Map<string, {
      section: string;
      rows: Map<string, any[]>;
    }>();
    
    // Process venue sections in their actual order
    this.venueData.sections.forEach((section) => {
      const sectionKey = section.sectionLabel || section.name;
      
      if (!sectionsMap.has(sectionKey)) {
        sectionsMap.set(sectionKey, {
          section: sectionKey,
          rows: new Map<string, any[]>()
        });
      }
      
      const sectionData = sectionsMap.get(sectionKey)!;
      const rowOffset = section.rowOffset || 0;
      
      for (let r = 0; r < section.rows; r++) {
        const globalRow = r + rowOffset;
        const rowLetter = this.getRowLetter(r);
        const rowKey = rowLetter;
        
        if (!sectionData.rows.has(rowKey)) {
          sectionData.rows.set(rowKey, []);
        }
        
        const rowConfig = this.getRowConfigForSeat(section, r);
        
        for (let c = 1; c <= section.seatsPerRow; c++) {
          const seatId = `${section.name}-${rowLetter}-${c}`;
          
          // Check seat availability
          const isSold = this.venueData.seatManagement.soldSeats.some(s => s.seatId === seatId);
          const isReserved = this.venueData.seatManagement.reservedSeats.some(s => s.seatId === seatId);
          const isBlocked = this.venueData.seatManagement.blockedSeats.some(s => s.seatId === seatId);
          
          const seatStatus: SeatStatus = isSold ? SeatStatus.SOLD :
                                         isReserved ? SeatStatus.RESERVED :
                                         isBlocked ? SeatStatus.BLOCKED :
                                         SeatStatus.AVAILABLE;
          
          const seatData = {
            id: seatId,
            number: c,
            ticketType: rowConfig.type,
            price: rowConfig.customPrice || 0,
            color: rowConfig.color,
            status: seatStatus,
            features: this.generateSeatFeatures(rowConfig.type, section.name, globalRow, c)
          };
          
          sectionData.rows.get(rowKey)!.push(seatData);
        }
      }
    });
    
    // Convert to array format
    this.mobileVenueLayout = Array.from(sectionsMap.values()).map(sectionData => ({
      section: sectionData.section,
      rows: Array.from(sectionData.rows.entries())
        .sort(([rowA], [rowB]) => rowA.localeCompare(rowB)) // Sort rows A-Z
        .map(([rowLabel, seats]) => ({
          rowLabel,
          seats: seats.sort((a, b) => a.number - b.number) // Sort seats by number
        }))
    }));
    
    // Sort sections by their X position (left to right)
    this.mobileVenueLayout.sort((a, b) => {
      const sectionA = this.venueData.sections.find(s => 
        (s.sectionLabel || s.name) === a.section
      );
      const sectionB = this.venueData.sections.find(s => 
        (s.sectionLabel || s.name) === b.section
      );
      
      const xA = sectionA?.x || 0;
      const xB = sectionB?.x || 0;
      
      return xA - xB; // Sort by X position
    });
    
    // Apply current filters
    this.applyMobileFilters();
  }

  

  

  // Update seat status in the layout data
  private updateSeatStatusInLayout(seatId: string, status: SeatStatus) {
    for (const section of this.mobileVenueLayout) {
      for (const row of section.rows) {
        const seat = row.seats.find(s => s.id === seatId);
        if (seat) {
          seat.status = status;
          return;
        }
      }
    }
  }

  getSectionSeatCount(section: any): number {
  return section.rows.reduce((total: number, row: any) => total + row.seats.length, 0);
}
  // Toggle mobile view mode
  toggleMobileViewMode() {
    this.mobileViewMode = this.mobileViewMode === 'list' ? 'map' : 'list';
    
    if (this.mobileViewMode === 'list') {
      this.generateMobileSeatList();
    } else {
      this.generateSeats();
    }
  }
  
  // Mobile seat selection
  toggleMobileSeatSelection(seatId: string) {
    if (this.mobileSelectedSeatIds.has(seatId)) {
      this.mobileSelectedSeatIds.delete(seatId);
      
      // Update SVG seats if in map view
      const seat = this.seats.find(s => s.id === seatId);
      if (seat) {
        seat.status = SeatStatus.AVAILABLE;
      }
    } else {
      this.mobileSelectedSeatIds.add(seatId);
      
      // Update SVG seats if in map view
      const seat = this.seats.find(s => s.id === seatId);
      if (seat && this.canSelectSeat(seat)) {
        seat.status = SeatStatus.SELECTED;
      }
    }
    
    // Update selected seats array
    this.updateSelectedSeatsFromMobile();
  }
  
  // Update selected seats array from mobile selection
  updateSelectedSeatsFromMobile() {
    this.selectedSeats = [];
    
    this.mobileSelectedSeatIds.forEach(seatId => {
      // Find seat in venue data
      const [sectionName, row, number] = seatId.split('-');
      const section = this.venueData.sections.find(s => s.name === sectionName);
      
      if (section) {
        const rowIndex = this.getRowIndex(row);
        const rowConfig = this.getRowConfigForSeat(section, rowIndex);
        
        const selectedSeat: SelectedSeat = {
          id: seatId,
          row: row,
          number: parseInt(number),
          section: section.sectionLabel || section.name,
          tier: {
            id: this.getTicketTierId(rowConfig.type),
            name: rowConfig.type,
            price: rowConfig.customPrice || 0,
            color: rowConfig.color
          },
          price: rowConfig.customPrice || 0,
          features: []
        };
        
        this.selectedSeats.push(selectedSeat);
      }
    });
  }
  
  // Helper to get row index from letter
  private getRowIndex(rowLetter: string): number {
    return rowLetter.charCodeAt(0) - 65; // A=0, B=1, etc.
  }
  
  // Mobile filter methods
// Update the setMobileFilter method
setMobileFilter(filter: keyof typeof this.mobileFilters, value: any) {
  // Use type assertion
  (this.mobileFilters as any)[filter] = value;
  this.applyMobileFilters();
}
  
  applyMobileFilters() {
    this.generateMobileSeatList();
    
    // Apply section filter
    if (this.mobileFilters.section !== 'all') {
      this.mobileAvailableSeats = this.mobileAvailableSeats.filter(
        group => group.section === this.mobileFilters.section
      );
    }
    
    // Apply ticket type filter
    if (this.mobileFilters.ticketType !== 'all') {
      this.mobileAvailableSeats = this.mobileAvailableSeats.filter(
        group => group.ticketType === this.mobileFilters.ticketType
      );
    }
  }
  
  // Get unique sections for filter
  getMobileSections(): string[] {
    const sections = new Set<string>();
    this.mobileAvailableSeats.forEach(group => sections.add(group.section));
    return ['all', ...Array.from(sections)];
  }
  
  // Get unique ticket types for filter
getMobileTicketTypes(): Array<TicketType | 'all'> {
  const types = new Set<TicketType>();
  this.mobileAvailableSeats.forEach(group => types.add(group.ticketType));
  return ['all', ...Array.from(types)];
}
  
  // Clear mobile selection
  clearMobileSelection() {
    this.mobileSelectedSeatIds.clear();
    this.selectedSeats = [];
    
    // Reset SVG seats if in map view
    this.seats.forEach(seat => {
      if (seat.status === SeatStatus.SELECTED) {
        seat.status = SeatStatus.AVAILABLE;
      }
    });
  }

  onTouchStart(event: TouchEvent) {
    if (event.touches.length === 1) {
      event.preventDefault();
      const touch = event.touches[0];
      this.touchStartX = touch.clientX;
      this.touchStartY = touch.clientY;
      this.lastTouchX = touch.clientX;
      this.lastTouchY = touch.clientY;
      this.isTouching = true;
      
      // Handle seat tap
      this.handleMobileTap(touch);
    } else if (event.touches.length === 2) {
      event.preventDefault();
      this.handlePinchStart(event);
    }
  }
  
  onTouchMove(event: TouchEvent) {
    if (!this.isTouching || event.touches.length !== 1) return;
    
    event.preventDefault();
    const touch = event.touches[0];
    
    const deltaX = touch.clientX - this.lastTouchX;
    const deltaY = touch.clientY - this.lastTouchY;
    
    this.offsetX += deltaX;
    this.offsetY += deltaY;
    
    this.lastTouchX = touch.clientX;
    this.lastTouchY = touch.clientY;
  }
  
  onTouchEnd(event: TouchEvent) {
    this.isTouching = false;
    
    // Handle double tap
    if (event.touches.length === 0 && event.changedTouches.length === 1) {
      const currentTime = new Date().getTime();
      const tapLength = currentTime - this.lastTap;
      
      if (tapLength < 300 && tapLength > 0) {
        event.preventDefault();
        this.handleDoubleTap(event);
      }
      this.lastTap = currentTime;
    }
  }
  
  private handleMobileTap(touch: Touch) {
    const container = this.svgContainer?.nativeElement;
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    const adjustedX = (x - this.offsetX) / this.scale;
    const adjustedY = (y - this.offsetY) / this.scale;
    
    const tappedSeat = this.seats.find(seat => {
      const dx = seat.cx - adjustedX;
      const dy = seat.cy - adjustedY;
      return Math.sqrt(dx * dx + dy * dy) <= this.seatRadius * 1.5;
    });
    
    if (tappedSeat && this.canSelectSeat(tappedSeat)) {
      this.onSeatClick(tappedSeat, { stopPropagation: () => {} } as MouseEvent);
    }
  }
  
  private handlePinchStart(event: TouchEvent) {
    const touch1 = event.touches[0];
    const touch2 = event.touches[1];
    
    this.initialPinchDistance = Math.hypot(
      touch2.clientX - touch1.clientX,
      touch2.clientY - touch1.clientY
    );
  }
  
  private handleDoubleTap(event: TouchEvent) {
    const container = this.svgContainer?.nativeElement;
    if (!container || !event.changedTouches[0]) return;
    
    const rect = container.getBoundingClientRect();
    const touch = event.changedTouches[0];
    const cx = touch.clientX - rect.left;
    const cy = touch.clientY - rect.top;
    
    if (this.scale < 1.5) {
      this.zoomAt(1.5, cx, cy);
    } else {
      this.resetView();
    }
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
            features: this.generateSeatFeatures(rowConfig.type, section.name, globalRow, c),
            gridRow: globalRow,
            gridColumn: c,
            metadata: {
              overrideReason: seatOverride?.reason,
              bookingId: seatOverride?.bookingId,
              reservationId: seatOverride?.reservationId
            }
          };
          
          this.seats.push(seat);
          
          if (section.name === 'VIP') {
            this.middleBottomY = Math.max(this.middleBottomY, cy);
            this.middleMinX = Math.min(this.middleMinX, cx);
            this.middleMaxX = Math.max(this.middleMaxX, cx);
          }
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
  
  private generateSeatFeatures(type: TicketType, sectionName: string, row: number, seatNumber: number): string[] {
    const features: string[] = [];
    
    if (type === 'VIP') {
      features.push('Premium View', 'Early Entry', 'VIP Lounge');
    } else if (type === 'DIAMOND') {
      features.push('Great Acoustics', 'Center View');
    }
    
    if (Math.random() < 0.3) features.push('Near Exit');
    if (Math.random() < 0.2 && seatNumber === 1) features.push('Aisle Seat');
    
    return features;
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
    
    // On mobile, show summary after selection
    if (this.isMobile && this.selectedSeats.length > 0) {
      this.showSelectedSummary = true;
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
        id: this.getTicketTierId(seat.ticketType),
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
    
    // Hide summary if no seats selected on mobile
    if (this.isMobile && this.selectedSeats.length === 0) {
      this.showSelectedSummary = false;
    }
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
    
    if (this.isMobile) {
      // Mobile: Position at bottom
      this.tooltipLeft = rect.width / 2;
      this.tooltipTop = rect.height - 150;
    } else {
      // Desktop: Position near cursor
      const seatScreenX = (this.hoveredSeat.cx * this.scale) + this.offsetX;
      const seatScreenY = (this.hoveredSeat.cy * this.scale) + this.offsetY;
      
      this.tooltipLeft = seatScreenX;
      this.tooltipTop = seatScreenY - 50;
      
      this.adjustTooltipPosition(rect.width, rect.height);
    }
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
    
    svg.addEventListener('wheel', (e) => this.onZoom(e), { passive: false });
  }
  
  startPan(event: MouseEvent) {
    this.isPanning = event.button === 1 || event.altKey;
    this.panStart = { x: event.clientX, y: event.clientY };
  }
  
  endPan() {
    this.isPanning = false;
  }
  
  onZoom(event: WheelEvent) {
    event.preventDefault();
    
    const container = this.svgContainer.nativeElement;
    const rect = container.getBoundingClientRect();
    
    const cx = event.clientX - rect.left;
    const cy = event.clientY - rect.top;
    
    this.zoomAt(event.deltaY < 0 ? 1.15 : 0.85, cx, cy);
  }
  
  zoomAt(factor: number, centerX: number, centerY: number) {
    const prevScale = this.scale;
    const maxScale = this.isMobile ? 5.0 : 2.5;
    const minScale = this.isMobile ? 0.5 : 0.6;
    
    this.scale = Math.min(maxScale, Math.max(minScale, this.scale * factor));
    
    this.offsetX -= (centerX / prevScale - centerX / this.scale);
    this.offsetY -= (centerY / prevScale - centerY / this.scale);
  }
  
  resetView() {
    this.scale = this.isMobile ? 0.8 : 1;
    this.offsetX = 0;
    this.offsetY = 0;
  }
  
  // ========== MOBILE UI CONTROLS ==========
  
  toggleMobileMenu() {
    this.showMobileMenu = !this.showMobileMenu;
  }
  
  toggleSelectedSummary() {
    this.showSelectedSummary = !this.showSelectedSummary;
  }
  
  toggleLegend() {
    this.showLegend = !this.showLegend;
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
  
  getFOHBounds() {
    const paddingY = 30;
    const height = 36;
    const y = this.middleBottomY + paddingY;
    const width = (this.middleMaxX - this.middleMinX) / 2 + 40;
    const leftFOHX = this.middleMinX - 20;
    const rightFOHX = (this.middleMinX + this.middleMaxX) / 2 + 20;
    
    return { leftFOHX, rightFOHX, y, width, height };
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
    
    // On mobile, navigate to cart
    if (this.isMobile) {
      // You can add navigation here if needed
    }
  }
  
  private mapTicketTypeToCartType(ticketType: TicketType): 'standard' | 'vip' | 'accessible' | 'standing' | 'seated' | 'foh' {
    const typeMap: Record<TicketType, 'standard' | 'vip' | 'accessible' | 'standing' | 'seated' | 'foh'> = {
      VIP: 'vip',
      DIAMOND: 'vip',
      GOLD: 'standard',
      SILVER: 'standard',
      FOH: 'foh'
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
    this.showSelectedSummary = false;
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
    window.removeEventListener('resize', () => this.checkViewport());
    
    if (this.tooltipUpdateTimeout) {
      clearTimeout(this.tooltipUpdateTimeout);
    }
    
    const svg = this.svgElement?.nativeElement;
    if (svg) {
      svg.removeEventListener('touchstart', this.onTouchStart);
      svg.removeEventListener('touchmove', this.onTouchMove);
      svg.removeEventListener('touchend', this.onTouchEnd);
    }
  }
}