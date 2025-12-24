// features/seating/sections/mobile-section-selector.component.ts
import { Component, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild, NgZone, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { SeatSectionType, SeatStatus, SectionRowConfig, TicketType, VenueData, VenueSection } from '../../../core/models/seats.model';
import { SeatService } from '../../../core/services/seat.service';
import { HelperService } from '../../../core/services/helper.service';
import { CurrencyFormatPipe } from '../../../core/pipes/currency-format.pipe';

@Component({
  selector: 'app-mobile-section-selector',
  standalone: true,
  imports: [CommonModule, CurrencyFormatPipe],
  templateUrl: './mobile-section-selector.component.html',
  styleUrls: ['./mobile-section-selector.component.scss']
})
export class MobileSectionSelectorComponent implements OnInit, AfterViewInit, OnDestroy {
   @Output() sectionSelected = new EventEmitter<VenueSection>();

  @ViewChild('svgContainer') svgContainer!: ElementRef<HTMLDivElement>;
  selectedSection: VenueSection | null = null;

  // Local venue data
  SeatSectionType = SeatSectionType;
  venueData!: VenueData;
  loading : boolean = false;
  eventId: string = "";
  readonly CANVAS_WIDTH = 1400;
  readonly CANVAS_HEIGHT = 1600;
  readonly STAGE_WIDTH = 500;
  readonly STAGE_HEIGHT = 60 *2;
  readonly SEAT_SIZE = 22;
  readonly HEIGHT_MULTIPLIER = 3; // Change this number to adjust height

  // Gesture state
  private isDragging = false;
  private isPinching = false;
  private lastTouchDistance = 0;
  private lastTouchCenter = { x: 0, y: 0 };
  private lastTapTime = 0;

  
  // Zoom/pan properties
  scale = 0.3;
  offsetX = 0;
  offsetY = 10;

  constructor(
    private router: Router,
    private seatService : SeatService,
    private route: ActivatedRoute,
  ) {
  }

  ngOnInit() {
    setTimeout(() => this.resetView(), 100);
    this.route.params.subscribe(params => {
      this.eventId = params['id'];
      this.getSeatMap(this.eventId);
    });
  }

  getSeatMap(eventId: string) {
    this.loading = true;
    this.seatService.getSeatMap(eventId).subscribe({
      next: (seatmap) => {
        //this.venueData = seatmap;
        this.venueData = this.seatService.getSeatMapConfig();
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        console.error('Error loading event:', error);
      }
    });
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
        //this.handleTap(x, y);
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
      const height = section.rows * (this.SEAT_SIZE *20);
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
     this.router.navigate(['events', this.eventId, 'section', sectionId]);
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
    const stageCenterY = 30 + ((this.STAGE_HEIGHT* this.HEIGHT_MULTIPLIER) / 2);
    //const targetScreenY = rect.height * 0.25;
    
    const scaledStageCenterX = stageCenterX * this.scale;
    const scaledStageCenterY = stageCenterY * this.scale;
    
    this.offsetX = (rect.width / 2) - scaledStageCenterX;
    //this.offsetY = targetScreenY - scaledStageCenterY;
    
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
     // this.offsetY = (rect.height - scaledHeight) / 2;
    } else {
      const maxOffsetY = rect.height - scaledHeight;
     // this.offsetY = Math.max(maxOffsetY, Math.min(0, this.offsetY));
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

  // Calculate section width based on seats per row
  getSectionWidth(section: VenueSection): number {
    return section.seatsPerRow * this.SEAT_SIZE;
  }

   // Calculate section height based on rows
  getSectionHeight(section: VenueSection): number {
    return (section.rows * this.SEAT_SIZE) * this.HEIGHT_MULTIPLIER;
  }

  getSectionRowConfigs(section: VenueSection): SectionRowConfig[] {
    return section.rowConfigs || [];
  }
  
  // Get all unique ticket types in a section
  getSectionTicketTypes(section: VenueSection): TicketType[] {
    if (!section.rowConfigs || !section.rowConfigs.length) {
      return ['SILVER']; // Default type
    }
    
    const types = new Set<TicketType>();
    section.rowConfigs.forEach(config => {
      types.add(config.type);
    });
    return Array.from(types);
  }
   
  // Get price range for a section
  getSectionPriceRange(section: VenueSection): { min: number, max: number, types: TicketType[] } {
    const types = this.getSectionTicketTypes(section);
    
    if (!section.rowConfigs || !section.rowConfigs.length) {
      return { min: 0, max: 0, types };
    }
    
    const prices = section.rowConfigs
      .filter(config => config.customPrice !== undefined)
      .map(config => config.customPrice as number);
    
    return {
      min: prices.length ? Math.min(...prices) : 0,
      max: prices.length ? Math.max(...prices) : 0,
      types
    };
  }
  
  // Get rows for a specific ticket type in a section
  getRowsForTicketType(section: VenueSection, ticketType: TicketType): number {
    if (!section.rowConfigs) return 0;
    
    const configs = section.rowConfigs.filter(c => c.type === ticketType);
    return configs.reduce((total, config) => {
      return total + (config.toRow - config.fromRow + 1);
    }, 0);
  }
  
  // Get min price for a specific ticket type
  getMinPriceForType(section: VenueSection, ticketType: TicketType): number {
    if (!section.rowConfigs) return 0;
    
    const config = section.rowConfigs.find(c => c.type === ticketType);
    return config?.customPrice || 0;
  }
  

  
  // Calculate visual representation of row configs
  getRowConfigVisual(section: VenueSection): Array<{
    ticketType: TicketType;
    color: string;
    startY: number;
    height: number;
    rows: number;
    price: number;
  }> {
    const result: Array<{
    ticketType: TicketType;
    color: string;
    startY: number;
    height: number;
    rows: number;
    price: number;
  }> = [];
    const sectionHeight = this.getSectionHeight(section);
    const rowHeight = sectionHeight / section.rows;

    
    // Sort row configs by fromRow
    const sortedConfigs = [...section.rowConfigs].sort((a, b) => a.fromRow - b.fromRow);
    
    sortedConfigs.forEach(config => {
      const rowsCount = config.toRow - config.fromRow + 1;
      const startY = (config.fromRow) * rowHeight;
      const height = rowsCount * rowHeight;
      
      result.push({
        ticketType: config.type,
        color: config.color,
        startY: startY,
        height: height,
        rows: rowsCount,
        price: config.customPrice || 0
      });
    });
    
    return result;
  }



onSectionClick(section: VenueSection): void {
  event?.stopPropagation(); // Prevent event bubbling
  this.selectedSection = section;
  console.log('Section clicked:', section.name);
}


}