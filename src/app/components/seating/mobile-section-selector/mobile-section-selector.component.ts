// features/seating/sections/mobile-section-selector.component.ts
import { Component, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild, NgZone, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { SeatStatus, VenueData, VenueSection } from '../../../core/models/seats.model';

@Component({
  selector: 'app-mobile-section-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mobile-section-selector.component.html',
  styleUrls: ['./mobile-section-selector.component.scss']
})
export class MobileSectionSelectorComponent implements OnInit, AfterViewInit, OnDestroy {
   @Output() sectionSelected = new EventEmitter<VenueSection>();

  @ViewChild('svgContainer') svgContainer!: ElementRef<HTMLDivElement>;
  selectedSection: VenueSection | null = null;

  // Local venue data
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

  // Zoom/pan properties
  scale = 0.3;
  offsetX = 0;
  offsetY = 0;
  readonly CANVAS_WIDTH = 1400;
  readonly CANVAS_HEIGHT = 900;
  readonly STAGE_WIDTH = 500;
  readonly STAGE_HEIGHT = 60;
  readonly SEAT_SIZE = 20;
  
  // Gesture state
  private isDragging = false;
  private isPinching = false;
  private lastTouchDistance = 0;
  private lastTouchCenter = { x: 0, y: 0 };
  private lastTapTime = 0;

  constructor(
    private ngZone: NgZone,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    setTimeout(() => this.resetView(), 100);
  }

  ngAfterViewInit() {
    this.setupGestures();
  }

  ngOnDestroy() {
    // Cleanup if needed
  }

  private setupGestures() {
    const container = this.svgContainer?.nativeElement;
    if (!container) return;

    container.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
    container.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
    container.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
    container.addEventListener('touchcancel', this.handleTouchEnd.bind(this), { passive: false });
  }

  // Keep all your existing gesture methods...
  private handleTouchStart(event: TouchEvent) {
    if (event.touches.length === 1) {
      this.isDragging = true;
      const touch = event.touches[0];
      const rect = this.svgContainer.nativeElement.getBoundingClientRect();
      this.lastTouchCenter = { 
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      };
      
      // Double tap detection
      const currentTime = Date.now();
      if (currentTime - this.lastTapTime < 300) {
        this.resetView();
        this.lastTapTime = 0;
      } else {
        this.lastTapTime = currentTime;
      }
    } else if (event.touches.length === 2) {
      event.preventDefault();
      this.isPinching = true;
      this.isDragging = false;
      
      const touch1 = event.touches[0];
      const touch2 = event.touches[1];
      this.lastTouchDistance = this.getTouchDistance(touch1, touch2);
      this.lastTouchCenter = this.getTouchCenter(touch1, touch2);
    }
  }

  private handleTouchMove(event: TouchEvent) {
    if (!this.svgContainer?.nativeElement) return;
    
    const container = this.svgContainer.nativeElement;
    const rect = container.getBoundingClientRect();
    
    if (this.isPinching && event.touches.length === 2) {
      event.preventDefault();
      
      const touch1 = event.touches[0];
      const touch2 = event.touches[1];
      const currentDistance = this.getTouchDistance(touch1, touch2);
      const currentCenter = this.getTouchCenter(touch1, touch2);
      
      const zoomFactor = currentDistance / this.lastTouchDistance;
      const centerX = currentCenter.x - rect.left;
      const centerY = currentCenter.y - rect.top;
      
      this.zoomAt(zoomFactor, centerX, centerY);
      
      this.lastTouchDistance = currentDistance;
      this.lastTouchCenter = currentCenter;
      
    } else if (this.isDragging && event.touches.length === 1) {
      event.preventDefault();
      
      const touch = event.touches[0];
      const currentX = touch.clientX - rect.left;
      const currentY = touch.clientY - rect.top;
      
      const deltaX = currentX - this.lastTouchCenter.x;
      const deltaY = currentY - this.lastTouchCenter.y;
      
      this.offsetX += deltaX;
      this.offsetY += deltaY;
      this.enforceBoundaries();
      
      this.lastTouchCenter = { x: currentX, y: currentY };
    }
  }

  private handleTouchEnd(event: TouchEvent) {
    if (event.touches.length === 0) {
      this.isDragging = false;
      this.isPinching = false;
      
      // Handle single tap for section selection
      if (event.changedTouches.length === 1 && !this.isPinching) {
        const touch = event.changedTouches[0];
        const rect = this.svgContainer.nativeElement.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        this.handleTap(x, y);
      }
    }
  }

  private handleTap(x: number, y: number) {
    const section = this.findSectionAtPoint(x, y);
    if (section) {
      this.navigateToSection(section);
    }
  }

  private findSectionAtPoint(x: number, y: number): VenueSection | null {
    const svgX = (x - this.offsetX) / this.scale;
    const svgY = (y - this.offsetY) / this.scale;
    
    for (const section of this.venueData.sections) {
      const width = section.seatsPerRow * this.SEAT_SIZE;
      const height = section.rows * this.SEAT_SIZE;
      const sectionY = section.y + (section.rowOffset || 0);
      
      if (svgX >= section.x && svgX <= section.x + width &&
          svgY >= sectionY && svgY <= sectionY + height) {
        return section;
      }
    }
    return null;
  }

  navigateToSection(section: VenueSection) {
    const sectionId = this.getSectionRouteId(section);
     this.router.navigate(['events', 'eventId', 'section', sectionId]);
    //this.router.navigate(['events/:id/section/:sectionId', sectionId]);
  }

  private getSectionRouteId(section: VenueSection): string {
    if (section.id) return section.id;
    return (section.sectionLabel || section.name)
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
  }

  resetView() {
    const container = this.svgContainer?.nativeElement;
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    this.scale = 0.3;
    
    // Center the stage at top
    const stageCenterX = this.CANVAS_WIDTH / 2;
    const stageCenterY = 30 + (this.STAGE_HEIGHT / 2);
    const targetScreenY = rect.height * 0.25;
    
    const scaledStageCenterX = stageCenterX * this.scale;
    const scaledStageCenterY = stageCenterY * this.scale;
    
    this.offsetX = (rect.width / 2) - scaledStageCenterX;
    this.offsetY = targetScreenY - scaledStageCenterY;
    
    this.enforceBoundaries();
  }

  zoomAt(factor: number, centerX: number, centerY: number) {
    const prevScale = this.scale;
    this.scale = Math.max(0.1, Math.min(3, this.scale * factor));
    
    const relativeX = (centerX - this.offsetX) / prevScale;
    const relativeY = (centerY - this.offsetY) / prevScale;
    
    this.offsetX = centerX - relativeX * this.scale;
    this.offsetY = centerY - relativeY * this.scale;
    
    this.enforceBoundaries();
  }

  enforceBoundaries() {
    const container = this.svgContainer?.nativeElement;
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    const scaledWidth = this.CANVAS_WIDTH * this.scale;
    const scaledHeight = this.CANVAS_HEIGHT * this.scale;
    
    // Horizontal boundaries
    if (scaledWidth <= rect.width) {
      this.offsetX = (rect.width - scaledWidth) / 2;
    } else {
      const maxOffsetX = rect.width - scaledWidth;
      this.offsetX = Math.max(maxOffsetX, Math.min(0, this.offsetX));
    }
    
    // Vertical boundaries
    if (scaledHeight <= rect.height) {
      this.offsetY = (rect.height - scaledHeight) / 2;
    } else {
      const maxOffsetY = rect.height - scaledHeight;
      this.offsetY = Math.max(maxOffsetY, Math.min(0, this.offsetY));
    }
  }

  zoomIn() {
    const container = this.svgContainer?.nativeElement;
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    this.zoomAt(1.2, rect.width / 2, rect.height / 2);
  }

  zoomOut() {
    const container = this.svgContainer?.nativeElement;
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    this.zoomAt(0.8, rect.width / 2, rect.height / 2);
  }

  // Keep all your existing helper methods...
  getSectionColor(section: VenueSection): string {
    const colorMap: Record<string, string> = {
      'VIP': '#8a6b8c',
      'DIAMOND': '#8a9a5b',
      'GOLD': '#b3543a',
      'SILVER': '#4a8bc9'
    };
    return colorMap[section.name] || '#cccccc';
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-UK', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0
    }).format(price);
  }

  getSectionMinPrice(section: VenueSection): number {
    if (!section.rowConfigs || section.rowConfigs.length === 0) return 0;
    return Math.min(...section.rowConfigs.map(config => config.customPrice || 0));
  }

  private getTouchDistance(touch1: Touch, touch2: Touch): number {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  private getTouchCenter(touch1: Touch, touch2: Touch): { x: number, y: number } {
    return {
      x: (touch1.clientX + touch2.clientX) / 2,
      y: (touch1.clientY + touch2.clientY) / 2
    };
  }

  goBack() {
    this.router.navigate(['/events']);
  }

  goToCart() {
    this.router.navigate(['/cart']);
  }

   getUniqueSections(): VenueSection[] {
    const uniqueSections: VenueSection[] = [];
    const seenNames = new Set<string>();
    
    this.venueData.sections.forEach(section => {
      const name = section.sectionLabel || section.name;
      if (!seenNames.has(name)) {
        seenNames.add(name);
        uniqueSections.push(section);
      }
    });
    
    return uniqueSections;
  }

   getFOHBounds(): any | null {
    const vipSections = this.venueData.sections.filter(s => s.name === 'VIP');
    if (vipSections.length === 0) return null;
    
    const middleMinX = Math.min(...vipSections.map(s => s.x));
    const middleMaxX = Math.max(...vipSections.map(s => s.x + this.getSectionWidth(s)));
    const middleBottomY = Math.max(...vipSections.map(s => s.y + this.getSectionHeight(s)));
    
    const paddingY = 25;
    const height = 30;
    const y = middleBottomY + paddingY;
    const width = (middleMaxX - middleMinX) / 2 + 35;
    const leftFOHX = middleMinX - 15;
    const rightFOHX = (middleMinX + middleMaxX) / 2 + 15;
    
    return { leftFOHX, rightFOHX, y, width, height };
  }

  
  // Calculate section width based on seats per row
  getSectionWidth(section: VenueSection): number {
    return section.seatsPerRow * this.SEAT_SIZE;
  }

   // Calculate section height based on rows
  getSectionHeight(section: VenueSection): number {
    return section.rows * this.SEAT_SIZE;
  }

}