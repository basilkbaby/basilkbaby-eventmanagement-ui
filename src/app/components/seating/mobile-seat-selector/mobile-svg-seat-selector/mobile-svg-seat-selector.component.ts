import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CartService } from '../../../../core/services/cart.service';
import { SeatService } from '../../../../core/services/seat.service';
import { 
  getSeatColor, 
  getSeatDisplayText, 
  getSeatStatusConfig, 
  isSeatSelectable, 
  Seat, 
  SEAT_STATUS_CONFIG, 
  SeatManagement, 
  SeatOverride, 
  SeatSectionType, 
  SeatStatus, 
  SectionRowConfig, 
  SelectedSeat, 
  TicketType, 
  VenueData, 
  VenueSection 
} from '../../../../core/models/seats.model';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-mobile-svg-seat-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mobile-svg-seat-selector.component.html',
  styleUrls: ['./mobile-svg-seat-selector.component.scss']
})
export class MobileSvgSeatSelectorComponent implements OnInit {
  @ViewChild('seatMapSvg') seatMapSvg!: ElementRef<SVGSVGElement>;
  readonly SeatStatus = SeatStatus;
  readonly SeatSectionType = SeatSectionType;
  
  section: VenueSection | null = null;
  loading: boolean = true;
  selectedSeats: SelectedSeat[] = [];
  
  // Multiple sections support
  venueData: VenueData | null = null;
  availableSections: VenueSection[] = [];
  currentSectionId: string = '';
  
  // Use exact same Seat model as web
  seats: Seat[] = [];
  rowLabels: RowLabel[] = [];
  gridLines: GridLine[] = [];
  
  // Layout - match web spacing
  seatSpacing: number = 22; // Web uses 22
  rowSpacing: number = 22; // Web uses 22
  seatRadius: number = 8; // Web uses 8
  paddingX: number = 50;
  paddingY: number = 50;
  stageHeight: number = 80;
  
  // UI State
  selectionError: string | null = null;
  summaryVisible: boolean = false;
  currentRow: string = '';
  totalWidth: number = 1000;
  totalHeight: number = 800;
  
  // Middle section tracking (from web)
  middleMinX: number = Number.MAX_VALUE;
  middleMaxX: number = 0;
  middleBottomY: number = 0;

  // Colors - use web's config
  seatColors = SEAT_STATUS_CONFIG;

  // For mobile legend
  legendItems = [
    { label: 'Selected', color: '#10b981', stroke: '#059669' },
    { label: 'Sold', color: '#9E9E9E', stroke: '#757575' },
    { label: 'Reserved', color: '#FF9800', stroke: '#EF6C00' },
    { label: 'Blocked', color: '#F5F5F5', stroke: '#BDBDBD' }
  ];

  isLoading : boolean = false;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private cartService: CartService,
    private seatService: SeatService,
    private cdRef: ChangeDetectorRef,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const sectionId = params['sectionId'];
      const eventId = params['id'];
      this.loadSeatMap(eventId, sectionId);
    });
  }

  private loadSeatMap(eventId: string, initialSectionId: string) {
    this.loading = true;
    this.seatService.getSeatMap(eventId).subscribe({
      next: (seatmap: VenueData) => {
        this.venueData = seatmap;//this.seatService.getSeatMapConfig();
        
        if (this.venueData?.sections) {
          this.availableSections = this.venueData.sections.filter((section: VenueSection) => 
            section.rowConfigs && section.rowConfigs.length > 0 &&
            section.seatSectionType !== SeatSectionType.FOH
          );
          
          if (this.availableSections.length === 0) {
            console.warn('No sections with seats found');
            this.loading = false;
            this.cdRef.detectChanges();
            return;
          }
          
          const foundSection = this.availableSections.find(section =>
            section.id.toLowerCase() === initialSectionId.toLowerCase() ||
            (section.sectionLabel && section.sectionLabel.toLowerCase().replace(/\s+/g, '-') === initialSectionId.toLowerCase())
          );
          
          this.section = foundSection || this.availableSections[0];
          this.currentSectionId = this.section.id;
          
          console.log('Loading section:', this.section.name);
          this.generateSeats();
        }
        
        this.loading = false;
        this.cdRef.detectChanges();
      },
      error: (error) => {
        console.error('Error loading seat map:', error);
        this.loading = false;
        this.cdRef.detectChanges();
      }
    });
  }

  onSectionChange() {
    if (!this.currentSectionId || !this.venueData) return;
    
    const foundSection = this.availableSections.find(section =>
      section.id === this.currentSectionId
    );
    
    if (foundSection) {
      this.section = foundSection;
      this.selectedSeats = [];
      this.summaryVisible = false;
      this.seats = [];
      this.rowLabels = [];
      this.generateSeats();
    }
  }

  // EXACT SAME LOGIC AS WEB COMPONENT
  private generateSeats() {
    if (!this.section) {
      console.warn('Cannot generate seats: section is null');
      return;
    }
    
    this.seats = [];
    this.rowLabels = [];
    this.gridLines = [];
    this.middleMinX = Number.MAX_VALUE;
    this.middleMaxX = 0;
    this.middleBottomY = 0;
    
    const statusMap = new Map<string, SeatOverride>();
    
    if (this.venueData?.seatManagement) {
      const categories: (keyof SeatManagement)[] = ['reservedSeats', 'blockedSeats', 'soldSeats'];
      
      categories.forEach(category => {
        if (this.venueData?.seatManagement[category]) {
          this.venueData.seatManagement[category].forEach((seatOverride: SeatOverride) => {
            statusMap.set(seatOverride.seatId, seatOverride);
          });
        }
      });
    }
    
    // Helper function to get default block letter if not specified
    const getDefaultBlockLetter = (index: number): string => {
      const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      return letters[index % letters.length];
    };
    
    // Process the single section (mobile shows one section at a time)
    const section = this.section;
    const sectionType = section.seatSectionType || SeatSectionType.SEAT;
    
    if (sectionType === SeatSectionType.FOH) {
      return;
    }
    
    // Handle STANDING sections
    if (sectionType === SeatSectionType.STANDING) {
      this.createStandingSection(section);
      return;
    }
    
    // For SEAT sections
    const sectionName = section.name.toUpperCase();
    const rowOffset = section.rowOffset || 0;
    
    // Get all row configs for this section
    const rowConfigs = section.rowConfigs || [];
    
    // Track current column position for creating gaps
    let currentColumnPosition = 0;
    
    // Sort row configs by fromColumn to process them in order
    const sortedConfigs = [...rowConfigs].sort((a, b) => 
      (a.fromColumn || 0) - (b.fromColumn || 0)
    );
    
    
    // Track row label positions for each block
    const rowLabelPositions = new Map<string, {
      minX: number,
      maxX: number,
      y: number,
      numberingDirection: 'left' | 'right' | 'center',
      blockLetter: string,
      rowLetter: string
    }>();
    
    // Calculate total width needed for SVG
    let totalColumns = 0;
    sortedConfigs.forEach((rowConfig) => {
      const fromColumn = rowConfig.fromColumn || 1;
      const toColumn = rowConfig.toColumn || section.seatsPerRow;
      totalColumns += (toColumn - fromColumn + 1);
    });
    
    // Add gaps between blocks (same as web - 2 columns gap)
    const totalGaps = (sortedConfigs.length - 1) * 2;
    totalColumns += totalGaps;
    
    // Calculate SVG dimensions
    const contentWidth = totalColumns * this.seatSpacing + this.paddingX * 2;
    const contentHeight = (section.rows || 20) * this.rowSpacing + this.paddingY * 2 + this.stageHeight;
    
    // Calculate optimal height for mobile
    const viewportHeight = window.innerHeight;
    const headerHeight = 120;
    const legendHeight = 80;
    const summaryHeight = 150;
    const availableHeight = viewportHeight - headerHeight - legendHeight - summaryHeight - 40;
    
    this.totalWidth = Math.max(800, contentWidth + 100);
    this.totalHeight = Math.max(availableHeight, contentHeight + 100);
    
    // Center content in SVG
    const centerX = this.totalWidth / 2;
    const startX = centerX - (contentWidth / 2);
    
    // Process each row config (each represents a block)
    sortedConfigs.forEach((rowConfig, configIndex) => {
      const fromRow = rowConfig.fromRow || 0;
      const toRow = rowConfig.toRow || (section.rows || 20) - 1;
      const fromColumn = rowConfig.fromColumn || 1;
      const toColumn = rowConfig.toColumn || section.seatsPerRow;
      
      // Get block letter from config, or use default
      const blockLetter = rowConfig.blockLetter || getDefaultBlockLetter(configIndex);
      
      // Get numbering direction from row config
      const numberingDirection: 'left' | 'right' | 'center' = 
        (rowConfig.numberingDirection as 'left' | 'right' | 'center') || 'left';
      
      // Add gap before this block (except first block)
      if (configIndex > 0) {
        currentColumnPosition += 2; // 2 columns gap (adjust as needed)
      }
      
      // In generateSeats(), add this debugging at the beginning:
console.log('=== GENERATE SEATS DEBUG ===');
console.log('Section:', this.section?.name);
console.log('Row Configs:', rowConfigs);

// Then in the rowConfig loop, add:
console.log('Processing row config:', {
  configIndex,
  fromColumn: rowConfig.fromColumn,
  toColumn: rowConfig.toColumn,
  blockLetter: rowConfig.blockLetter,
  seatsPerRow: section.seatsPerRow,
  fromRow: rowConfig.fromRow,
  toRow: rowConfig.toRow
});

// Simplified and corrected calculateSeatNumber:
      const calculateSeatNumber = (col: number): number => {
        const actualCol = col - fromColumn + 1;
        const totalSeatsInBlock = toColumn - fromColumn + 1;
        
        switch (numberingDirection) {
          case 'right':
            return totalSeatsInBlock - actualCol + 1;
          case 'center':
            const middle = totalSeatsInBlock / 2;
            if (totalSeatsInBlock % 2 === 1) {
              const centerSeat = Math.ceil(middle);
              const distanceFromCenter = Math.abs(actualCol - centerSeat);
              const isLeftSide = actualCol < centerSeat;
              if (actualCol === centerSeat) return 1;
              return isLeftSide ? distanceFromCenter * 2 : distanceFromCenter * 2 + 1;
            } else {
              const leftCenter = Math.floor(middle);
              const rightCenter = Math.ceil(middle);
              if (actualCol <= leftCenter) {
                return (leftCenter - actualCol + 1) * 2;
              } else {
                return (actualCol - rightCenter) * 2 + 1;
              }
            }
          case 'left':
          default:
            return actualCol;
        }
      };
      
      // Generate seats for this block
      for (let r = fromRow; r <= toRow; r++) {
        const globalRow = r + rowOffset;
        const rowLetter = this.getRowLetter(r);
        
        // Track min/max X for this row in this block
        let rowMinX = Infinity;
        let rowMaxX = -Infinity;
        
        for (let c = fromColumn; c <= toColumn; c++) {
          const numericSeatNumber = calculateSeatNumber(c);
          const shortSectionName = sectionName.charAt(0); // Just take first character

          const seatId = `${shortSectionName}-${blockLetter}-${rowLetter}${numericSeatNumber}`;
          
          const columnPosition = currentColumnPosition + (c - fromColumn);
          const cx = startX + (columnPosition * this.seatSpacing);
          const cy = this.paddingY + this.stageHeight + (globalRow * this.rowSpacing);
          
          // Update row min/max X
          rowMinX = Math.min(rowMinX, cx);
          rowMaxX = Math.max(rowMaxX, cx);
          
          const seatOverride = statusMap.get(seatId);
          const seatStatus: SeatStatus = seatOverride?.status || SeatStatus.AVAILABLE;
          
          const seat: Seat = {
            id: seatId,
            cx,
            cy,
            r: this.seatRadius,
            rowLabel: rowLetter,
            seatNumber: numericSeatNumber,
            sectionId: section.id,
            sectionName: section.sectionLabel || section.name,
            sectionConfigId: rowConfig.id || '',
            ticketType: rowConfig.type,
            status: seatStatus,
            price: rowConfig.customPrice || 0,
            color: rowConfig.color || this.getSectionColor(blockLetter),
            gridRow: globalRow,
            gridColumn: columnPosition + 1,
            isStandingArea: false,
            originalColumn: c,
            numberingDirection: numberingDirection,
            blockIndex: configIndex,
            blockLetter: blockLetter,
            blockStartSeat: 1,
            blockTotalSeats: toColumn - fromColumn + 1
          };
          
          this.seats.push(seat);
          
          // Track middle section for labels
          if (['A', 'B', 'C', '4', '5', '6'].includes(blockLetter)) {
            this.middleMinX = Math.min(this.middleMinX, cx);
            this.middleMaxX = Math.max(this.middleMaxX, cx);
            this.middleBottomY = Math.max(this.middleBottomY, cy);
          }
        }
        
        // Store row label position for this block
        const rowKey = `${section.id}-${blockLetter}-${rowLetter}`;
        
        rowLabelPositions.set(rowKey, {
          minX: rowMinX,
          maxX: rowMaxX,
          y: this.paddingY + this.stageHeight + (globalRow * this.rowSpacing),
          numberingDirection: numberingDirection,
          blockLetter: blockLetter,
          rowLetter: rowLetter
        });
      }
      
      currentColumnPosition += (toColumn - fromColumn + 1);
    });
    
    // Create row labels from the collected positions
    rowLabelPositions.forEach((position) => {
      let labelX: number;
      let side: 'left' | 'right';
      
      // Determine label position based on numbering direction
      if (position.numberingDirection === 'right') {
        // Right-to-left numbering: label goes on the RIGHT side
        labelX = position.maxX + 15;
        side = 'right';
      } else if (position.numberingDirection === 'left') {
        // Left-to-right numbering: label goes on the LEFT side
        labelX = position.minX - 15;
        side = 'left';
      } else {
        // Center numbering: decide based on block letter
        if (position.blockLetter === 'C') {
          labelX = position.minX - 15;
          side = 'left';
        } else if (position.blockLetter === 'L') {
          labelX = position.minX - 15;
          side = 'left';
        } else if (position.blockLetter === 'R') {
          labelX = position.maxX + 15;
          side = 'right';
        } else {
          labelX = position.minX - 15;
          side = 'left';
        }
      }
      
      const adjustedY = position.y + 4; // Adjust this value as needed

      this.rowLabels.push({
        x: labelX,
        y: adjustedY,
        label: position.rowLetter,
        side: side
      });
    });
    
    // Generate grid lines
    this.generateGridLines(this.totalWidth, this.totalHeight);
    
    // Update SVG dimensions
    this.updateSvgDimensions(this.totalWidth, this.totalHeight);
    
    console.log(`Generated ${this.seats.length} seats for section: ${section.name}`);
    this.cdRef.detectChanges();
  }

  private createStandingSection(section: VenueSection) {
    // Implement standing section logic if needed
    console.log('Creating standing section:', section.name);
  }

  private generateGridLines(width: number, height: number) {
    this.gridLines = [];
    
    // Vertical grid lines
    for (let x = 0; x <= width; x += 100) {
      this.gridLines.push({
        x1: x,
        y1: 0,
        x2: x,
        y2: height
      });
    }
    
    // Horizontal grid lines
    for (let y = 0; y <= height; y += 100) {
      this.gridLines.push({
        x1: 0,
        y1: y,
        x2: width,
        y2: y
      });
    }
  }

  private updateSvgDimensions(width: number, height: number) {
    if (this.seatMapSvg?.nativeElement) {
      this.seatMapSvg.nativeElement.setAttribute('viewBox', `0 0 ${width} ${height}`);
      this.seatMapSvg.nativeElement.setAttribute('width', width.toString());
      this.seatMapSvg.nativeElement.setAttribute('height', height.toString());
    }
  }

  // Helper Methods
  private getRowLetter(rowIndex: number): string {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    return letters[rowIndex % letters.length];
  }

  private getSectionColor(blockLetter: string): string {
    const colors: {[key: string]: string} = {
      'A': '#4F46E5', 'B': '#059669', 'C': '#DC2626',
      'L': '#4F46E5', '1': '#6366F1', '2': '#818CF8', '3': '#A5B4FC',
      'R': '#DC2626', '7': '#EF4444', '8': '#F87171', '9': '#FCA5A5',
      '4': '#059669', '5': '#10B981', '6': '#34D399'
    };
    return colors[blockLetter] || '#3b82f6';
  }

  private darkenColor(color: string, percent: number): string {
    if (color.startsWith('#')) {
      let r = parseInt(color.slice(1, 3), 16);
      let g = parseInt(color.slice(3, 5), 16);
      let b = parseInt(color.slice(5, 7), 16);
      
      r = Math.floor(r * (100 - percent) / 100);
      g = Math.floor(g * (100 - percent) / 100);
      b = Math.floor(b * (100 - percent) / 100);
      
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
    return '#2563eb';
  }

  // Use web's utility functions
  getSeatStatusText(status: SeatStatus, ticketType: TicketType): string {
    return getSeatDisplayText(status, ticketType);
  }

  getSeatFillColor(seat: Seat): string {
    if (seat.status === SeatStatus.SELECTED) return '#10b981';
    return getSeatColor(seat);
  }

  getSeatStrokeColor(seat: Seat): string {
    if (seat.status === SeatStatus.SELECTED) return '#059669';
    const statusConfig = getSeatStatusConfig(seat.status);
    return statusConfig.stroke;
  }


  getSeatStatusClass(seat: Seat): string {
    return seat.status.toLowerCase();
  }

  // Seat Interaction
  toggleSeat(seat: Seat) {
    if (!isSeatSelectable(seat.status)) {
      return;
    }
    
    if (seat.status === SeatStatus.SELECTED) {
      this.deselectSeat(seat);
    } else {
      if (this.selectedSeats.length >= 8) {
        this.selectionError = 'Maximum 8 seats allowed';
        setTimeout(() => {
          this.selectionError = null;
          this.cdRef.detectChanges();
        }, 3000);
        return;
      }
      this.selectSeat(seat);
    }
    
    this.summaryVisible = this.selectedSeats.length > 0;
    this.cdRef.detectChanges();
  }

  private selectSeat(seat: Seat) {
    seat.status = SeatStatus.SELECTED;
    
    // Create SelectedSeat object matching web format
    const selectedSeat: SelectedSeat = {
      seatId: seat.id,
      row: seat.rowLabel,
      number: seat.seatNumber,
      sectionName: seat.sectionName,
      sectionId: seat.sectionId,
      sectionConfigId: seat.sectionConfigId,
      price: seat.price,
      tier: {
        id: '1',
        name: seat.ticketType,
        price: seat.price,
        color: seat.color || '#10b981'
      },
      features: [],
      isStandingArea: false
    };
    
    this.selectedSeats.push(selectedSeat);
  }

  private deselectSeat(seat: Seat) {
    seat.status = SeatStatus.AVAILABLE;
    this.selectedSeats = this.selectedSeats.filter(s => s.seatId !== seat.id);
  }

  // Remove single seat
  removeSingleSeat(seatToRemove: SelectedSeat) {
    const seat = this.seats.find(s => s.id === seatToRemove.seatId);
    if (seat && seat.status === SeatStatus.SELECTED) {
      seat.status = SeatStatus.AVAILABLE;
    }
    
    this.selectedSeats = this.selectedSeats.filter(s => s.seatId !== seatToRemove.seatId);
    this.summaryVisible = this.selectedSeats.length > 0;
    this.cdRef.detectChanges();
  }

  // Performance
  trackBySeatId(index: number, seat: Seat): string {
    return seat.id;
  }

  // Other Methods
  getAvailableSeatsCount(): number {
    return this.seats.filter(seat => seat.status === SeatStatus.AVAILABLE).length;
  }

  getMinPrice(): number {
    const availableSeats = this.seats.filter(seat => seat.status === SeatStatus.AVAILABLE);
    if (!availableSeats.length) return 0;
    return Math.min(...availableSeats.map(seat => seat.price));
  }

  getTotalPrice(): number {
    return this.selectedSeats.reduce((total, seat) => total + seat.price, 0);
  }

  formatPrice(price: number): string {
    return `£${price.toFixed(2)}`;
  }

  clearSelection() {
    this.seats.forEach(seat => {
      if (seat.status === SeatStatus.SELECTED) {
        seat.status = SeatStatus.AVAILABLE;
      }
    });
    
    this.selectedSeats = [];
    this.summaryVisible = false;
    this.cdRef.detectChanges();
  }

  // Navigation
  goBack() {
    this.router.navigate(['events', this.route.snapshot.params['id'], 'mobileseatmap']);
  }

  addToCart() {
    if (this.selectedSeats.length === 0) return;

    const eventId = this.route.snapshot.params['id'];
    if (this.selectedSeats.length === 0 || this.isLoading) return;  
    // Start loading
    this.isLoading = true;
       
    this.cartService.addToCart(eventId, this.selectedSeats)
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          
          if (response.success && response.data) {
            // Success - navigate to cart
            this.clearSelection();
            this.router.navigate(['/cart']);
          } else {
            // API returned success: false
            this.showError(response.error || 'Failed to add seats to cart');
          }
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Failed to add to cart:', error);
          this.showError(error.message || 'An error occurred. Please try again.');
        }
      });

  }

  private showError(message: string): void {
    // Use toast/notification service
    this.notificationService.showError(message);
  }

  // Get unique blocks for legend
  getUniqueBlocks(): string[] {
    const blocks = new Set<string>();
    this.seats.forEach(seat => {
      blocks.add(seat.blockLetter);
    });
    return Array.from(blocks).sort();
  }

  getBlockColor(blockLetter: string): string {
    const seat = this.seats.find(s => s.blockLetter === blockLetter);
    return seat?.color || this.getSectionColor(blockLetter);
  }

  getBlockStroke(blockLetter: string): string {
    const color = this.getBlockColor(blockLetter);
    return this.darkenColor(color, 20);
  }


  @HostListener('window:resize')
  onWindowResize() {
    if (this.section && this.seats.length > 0) {
      this.cdRef.detectChanges();
    }
  }
}

// Interfaces for rendering (local to this component)
interface RowLabel {
  x: number;
  y: number;
  label: string;
  side: 'left' | 'right';
}

interface GridLine {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}