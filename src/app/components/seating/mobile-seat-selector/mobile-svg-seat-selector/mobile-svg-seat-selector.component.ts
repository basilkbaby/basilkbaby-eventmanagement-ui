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
  VenueSection,
  RowNumberingType  // Add this import
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
  readonly RowNumberingType = RowNumberingType; // Make it available in template
  
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

  isLoading: boolean = false;

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
        this.venueData = seatmap;
        //this.venueData = this.seatService.getSeatMapConfigContinous();
        
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

private generateSeats() {
  if (!this.section || !this.venueData) {
    console.warn('Cannot generate seats: section or venueData is null');
    return;
  }
  
  this.seats = [];
  this.rowLabels = [];
  this.gridLines = [];
  this.middleMinX = Number.MAX_VALUE;
  this.middleMaxX = 0;
  this.middleBottomY = 0;
  
  const statusMap = new Map<string, SeatOverride>();
  
  if (this.venueData.seatManagement) {
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
  
  // Get global row numbering type (fallback)
  const defaultRowNumberingType = RowNumberingType.PERSECTION;
  
  // Process the single section
  const section = this.section;
  const sectionType = section.seatSectionType || SeatSectionType.SEAT;
  
  if (sectionType === SeatSectionType.FOH) {
    return;
  }
  
  if (sectionType === SeatSectionType.STANDING) {
    console.log('Generating standing section sectionType:', sectionType);
    this.createStandingSection(section);
    return;
  }
  
  const sectionName = section.name.toUpperCase();
  const rowOffset = section.rowOffset || 0;
  
  // Get section's numbering type
  const sectionRowNumberingType = section.rowNumberingType || defaultRowNumberingType;
  
  // Get section-level skip letters
  const sectionSkipLetters = section.skipRowLetters || [];
  
  // Get all row configs for this section
  const rowConfigs = section.rowConfigs || [];
  
  // Sort row configs by fromColumn to process them in order
  const sortedConfigs = [...rowConfigs].sort((a, b) => 
    (a.fromColumn || 0) - (b.fromColumn || 0)
  );
  
  // For CONTINUOUS numbering on mobile, we need a deterministic approach
  // Since mobile shows one section at a time, we'll calculate based on section position
  let startingRowIndex = 0;
  
  if (sectionRowNumberingType === RowNumberingType.CONTINUOUS) {
    // Calculate starting index based on section's position in the venue
    const allSections = this.venueData.sections || [];
    
    // Filter and sort only CONTINUOUS seat sections
    const continuousSections = allSections.filter(s => {
      if (s.seatSectionType === SeatSectionType.FOH || s.seatSectionType === SeatSectionType.STANDING) {
        return false;
      }
      const sRowNumberingType = s.rowNumberingType || defaultRowNumberingType;
      return sRowNumberingType === RowNumberingType.CONTINUOUS;
    }).sort((a, b) => {
      // Sort by position (Y then X)
      if (a.y !== b.y) return a.y - b.y;
      return a.x - b.x;
    });
    
    // Find this section's index and calculate rows before it
    const currentSectionIndex = continuousSections.findIndex(s => s.id === section.id);
    

    if (currentSectionIndex > 0) {
      var skipLetterCount = 0;
      // Sum rows from all previous CONTINUOUS sections
      for (let i = 0; i < currentSectionIndex; i++) {
        const prevSection = continuousSections[i];
        const prevRowConfigs = prevSection.rowConfigs || [];
        
        prevRowConfigs.forEach(config => {
          const fromRow = config.fromRow || 0;
          const toRow = config.toRow || (prevSection.rows || 0) - 1;
          skipLetterCount += prevSection.skipRowLetters?.length || 0;
          startingRowIndex += (toRow - fromRow + 1) + skipLetterCount;
        });
      }
    }
    
    console.log(`CONTINUOUS: Section ${section.name} is at index ${currentSectionIndex}, starts at row ${startingRowIndex}`);
  }
  
  // Calculate total width needed for SVG (with gaps)
  let totalColumns = 0;
  sortedConfigs.forEach((rowConfig) => {
    const fromColumn = rowConfig.fromColumn || 1;
    const toColumn = rowConfig.toColumn || section.seatsPerRow;
    totalColumns += (toColumn - fromColumn + 1);
    
    if (rowConfig.gapAfterColumn) {
      totalColumns += (rowConfig.gapSize || 1);
    }
  });
  
  // Add gaps between blocks
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
  
  // Track column positions for each block
  const blockColumnStarts: number[] = [];
  let currentBlockStart = 0;
  
  // First pass: calculate column positions
  sortedConfigs.forEach((rowConfig, configIndex) => {
    const fromColumn = rowConfig.fromColumn || 1;
    const toColumn = rowConfig.toColumn || section.seatsPerRow;
    
    if (configIndex > 0) {
      currentBlockStart += 2; // 2 columns gap
    }
    
    blockColumnStarts[configIndex] = currentBlockStart;
    currentBlockStart += (toColumn - fromColumn + 1);
    
    if (rowConfig.gapAfterColumn) {
      currentBlockStart += (rowConfig.gapSize || 1);
    }
  });
  
  // Track row label positions
  const rowLabelPositions = new Map<string, {
    minX: number,
    maxX: number,
    y: number,
    numberingDirection: 'left' | 'right' | 'center',
    blockLetter: string,
    rowLetter: string
  }>();
  
  // Get maximum rows across all configs
  const maxRows = sortedConfigs.reduce((max, config) => {
    const fromRow = config.fromRow || 0;
    const toRow = config.toRow || (section.rows || 0) - 1;
    return Math.max(max, toRow - fromRow + 1);
  }, 0);
  
  // Track current row index for CONTINUOUS numbering
  let currentRowIndex = startingRowIndex;
  
  // Generate seats row by row
  for (let rowNum = 0; rowNum < maxRows; rowNum++) {
    let rowLetter: string;
    const skipLetters = sectionSkipLetters;
    
    // Determine row letter based on numbering type
    if (sectionRowNumberingType === RowNumberingType.CONTINUOUS) {
      // Use the calculated starting index + row number
      rowLetter = this.getRowLetterWithSkip(currentRowIndex, skipLetters);
      currentRowIndex++;
    } else {
      // PERSECTION: Start from A for each row
      rowLetter = this.getRowLetterWithSkip(rowNum, skipLetters);
    }
    
    // Process each block for this row
    sortedConfigs.forEach((rowConfig, configIndex) => {
      const fromRow = rowConfig.fromRow || 0;
      const toRow = rowConfig.toRow || (section.rows || 0) - 1;
      
      if (rowNum < fromRow || rowNum > toRow) {
        return;
      }
      
      const fromColumn = rowConfig.fromColumn || 1;
      const toColumn = rowConfig.toColumn || section.seatsPerRow;
      
      const gapAfterColumn = rowConfig.gapAfterColumn;
      const gapSize = rowConfig.gapSize || 1;
      
      const blockLetter = rowConfig.blockLetter || getDefaultBlockLetter(configIndex);
      
      const numberingDirection: 'left' | 'right' | 'center' = 
        (rowConfig.numberingDirection as 'left' | 'right' | 'center') || 'left';
      
      // Get row-specific skip letters (config overrides section)
      const rowSpecificSkipLetters = rowConfig.skipRowLetters || sectionSkipLetters;
      
      const blockColumnStart = blockColumnStarts[configIndex];
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

      let rowMinX = Infinity;
      let rowMaxX = -Infinity;
      let columnInCurrentRow = 0;
      
      for (let c = fromColumn; c <= toColumn; c++) {
        if (gapAfterColumn && c === gapAfterColumn + 1) {
          columnInCurrentRow += gapSize;
        }
        
        const numericSeatNumber = calculateSeatNumber(c);
        const shortSectionName = sectionName.charAt(0);

        // IMPORTANT: Generate seat ID matching web format
        let seatId: string;
        if (sectionRowNumberingType === RowNumberingType.CONTINUOUS) {
          // Continuous format: VIP-A1 (no block letter)
          seatId = `${shortSectionName}-${rowLetter}${numericSeatNumber}`;
        } else {
          // Per-section format: VIP-L-A1 (with block letter)
          seatId = `${shortSectionName}-${blockLetter}-${rowLetter}${numericSeatNumber}`;
        }
        
        const columnPosition = blockColumnStart + columnInCurrentRow;
        const cx = startX + (columnPosition * this.seatSpacing);
        const cy = this.paddingY + this.stageHeight + (rowNum * this.rowSpacing);
        
        rowMinX = Math.min(rowMinX, cx);
        rowMaxX = Math.max(rowMaxX, cx);
        
        // Check status map - try both formats for backward compatibility
        let seatOverride = statusMap.get(seatId);
        
        // If not found with current format, try alternative format
        if (!seatOverride && sectionRowNumberingType === RowNumberingType.CONTINUOUS) {
          // Try per-section format as fallback
          const altSeatId = `${shortSectionName}-${blockLetter}-${rowLetter}${numericSeatNumber}`;
          seatOverride = statusMap.get(altSeatId);
        } else if (!seatOverride && sectionRowNumberingType === RowNumberingType.PERSECTION) {
          // Try continuous format as fallback
          const altSeatId = `${shortSectionName}-${rowLetter}${numericSeatNumber}`;
          seatOverride = statusMap.get(altSeatId);
        }
        
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
          gridRow: rowNum,
          gridColumn: columnInCurrentRow + 1,
          isStandingArea: false,
          originalColumn: c,
          numberingDirection: numberingDirection,
          blockIndex: configIndex,
          blockLetter: blockLetter,
          blockStartSeat: 1,
          blockTotalSeats: toColumn - fromColumn + 1,
          rowNumberingType: sectionRowNumberingType
        };
        
        this.seats.push(seat);
        columnInCurrentRow++;
      }
      
      // Store row label position
      const rowKey = `${section.id}-${rowNum}`;
      if (!rowLabelPositions.has(rowKey)) {
        rowLabelPositions.set(rowKey, {
          minX: rowMinX,
          maxX: rowMaxX,
          y: this.paddingY + this.stageHeight + (rowNum * this.rowSpacing),
          numberingDirection: numberingDirection,
          blockLetter: blockLetter,
          rowLetter: rowLetter
        });
      } else {
        const existing = rowLabelPositions.get(rowKey)!;
        existing.minX = Math.min(existing.minX, rowMinX);
        existing.maxX = Math.max(existing.maxX, rowMaxX);
      }
    });
  }
  
  // Create row labels
  rowLabelPositions.forEach((position) => {
    let labelX: number;
    let side: 'left' | 'right';
    
    if (position.numberingDirection === 'right') {
      labelX = position.maxX + 15;
      side = 'right';
    } else if (position.numberingDirection === 'left') {
      labelX = position.minX - 15;
      side = 'left';
    } else {
      if (position.blockLetter === 'C' || position.blockLetter === 'L') {
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
    
    const adjustedY = position.y + 4;

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
  
  console.log(`Generated ${this.seats.length} seats for ${section.name}`);
  console.log(`Row letters: ${Array.from(new Set(this.seats.map(s => s.rowLabel))).sort().join(', ')}`);
  console.log(`First seat: ${this.seats[0]?.id}`);
  console.log(`Last seat: ${this.seats[this.seats.length - 1]?.id}`);
  
  this.cdRef.detectChanges();
}

// Also update the seat selection methods to handle both formats:
private selectSeat(seat: Seat) {
  seat.status = SeatStatus.SELECTED;
  
  // Create SelectedSeat object - must match web format exactly!
  const selectedSeat: SelectedSeat = {
    seatId: seat.id,
    row: seat.rowLabel,
    number: seat.seatNumber,
    sectionName: seat.sectionName,
    sectionId: seat.sectionId,
    sectionConfigId: seat.sectionConfigId,
    price: seat.price,
    tier: {
      id: seat.sectionConfigId || '1',
      name: seat.ticketType,
      price: seat.price,
      color: seat.color || '#10b981'
    },
    features: [],
    isStandingArea: seat.isStandingArea,
    isGeneralAdmission: false
  };
  
  this.selectedSeats.push(selectedSeat);
}

// Add a method to clear stored row index when needed
clearStoredRowIndex() {
  const storageKey = `section_${this.section?.id}_row_index`;
  try {
    localStorage.removeItem(storageKey);
  } catch (e) {
    console.warn('Could not clear localStorage:', e);
  }
}
// Also update the getRowLetterWithSkip method to be more robust:
private getRowLetterWithSkip(rowIndex: number, skipLetters: string[] = []): string {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const uppercaseSkip = skipLetters.map(l => l.toUpperCase());
  
  // Handle simple case first
  if (uppercaseSkip.length === 0) {
    // Simple A-Z, AA, AB, etc.
    if (rowIndex < 26) {
      return letters[rowIndex];
    } else {
      const firstLetterIndex = Math.floor(rowIndex / 26) - 1;
      const secondLetterIndex = rowIndex % 26;
      return `${letters[firstLetterIndex]}${letters[secondLetterIndex]}`;
    }
  }
  
  // Build available letters excluding skipped ones
  let availableLetters: string[] = [];
  let currentIndex = 0;
  
  // Generate sequence until we have enough letters
  while (availableLetters.length <= rowIndex) {
    let letter: string;
    
    // Generate letter based on current index
    if (currentIndex < 26) {
      letter = letters[currentIndex];
    } else {
      // Generate double letters
      const doubleIndex = currentIndex - 26;
      const firstCharIndex = Math.floor(doubleIndex / 26);
      const secondCharIndex = doubleIndex % 26;
      
      if (firstCharIndex >= 0 && firstCharIndex < 26 && 
          secondCharIndex >= 0 && secondCharIndex < 26) {
        letter = `${letters[firstCharIndex]}${letters[secondCharIndex]}`;
      } else {
        letter = `Row${currentIndex + 1}`;
      }
    }
    
    // Check if this letter should be included
    if (!uppercaseSkip.includes(letter)) {
      availableLetters.push(letter);
    }
    
    currentIndex++;
    
    // Safety check
    if (currentIndex > 1000) {
      console.warn('getRowLetterWithSkip: Infinite loop prevented');
      return `Row${rowIndex + 1}`;
    }
  }
  
  return availableLetters[rowIndex] || `Row${rowIndex + 1}`;
}



  private createStandingSection(section: VenueSection) {
    // Create standing area seat
    const sectionName = section.name.toUpperCase();
    const rowConfig = section.rowConfigs[0] || this.getDefaultRowConfig();
    
    const cx = this.paddingX + (section.seatsPerRow * this.seatSpacing) / 2;
    const cy = this.paddingY + this.stageHeight + (section.rows * this.rowSpacing) / 2;
    
    const seatId = this.generateStandingTicketId(section);
    
    const seat: Seat = {
      id: seatId,
      cx,
      cy,
      r: Math.max(section.seatsPerRow, section.rows) * this.seatSpacing / 4,
      rowLabel: 'ST',
      seatNumber: 0,
      sectionId: section.id,
      sectionName: section.sectionLabel || section.name,
      sectionConfigId: rowConfig.id || '',
      ticketType: rowConfig.type,
      status: SeatStatus.AVAILABLE,
      price: rowConfig.customPrice || 0,
      color: rowConfig.color || '#cccccc',
      gridRow: section.rows,
      gridColumn: section.seatsPerRow,
      isStandingArea: true,
      originalColumn: 0,
      numberingDirection: 'left',
      blockIndex: 0,
      blockLetter: 'A',
      blockStartSeat: 0,
      blockTotalSeats: 0
    };
    
    this.seats.push(seat);
  }

  // Add these methods to your component

// Helper method to check if there are any standing tickets
hasStandingTickets(): boolean {
  console.log('Checking for standing tickets in selectedSeats:', this.selectedSeats);
  return this.selectedSeats.some(seat => seat.isStandingArea);
}

// Method to add another standing ticket
addAnotherStandingTicket(): void {
  // Find the first standing ticket in selected seats
  const standingSeat = this.selectedSeats.find(seat => seat.isStandingArea);
  if (!standingSeat) return;
  
  // Find the original seat object
  const originalStandingSeat = this.seats.find(seat => seat.id === standingSeat.seatId);
  if (!originalStandingSeat) return;

  // Find the section
  const section = this.venueData?.sections.find(s => s.id === originalStandingSeat.sectionId);
  if (!section) return;

  // Generate a new seat ID
  const newSeatId = this.generateStandingTicketId(section);
  
  // Create a new standing seat object
  const newSeat: Seat = {
    ...originalStandingSeat, // Copy all properties
    id: newSeatId, // New unique ID
    cx: originalStandingSeat.cx + (Math.random() * 20 - 10), // Slightly offset position
    cy: originalStandingSeat.cy + (Math.random() * 20 - 10), // Slightly offset position
  };
  
  // Add to seats array
  //this.seats.push(newSeat);
  
  // Select this new seat
  this.selectSeat(newSeat);
}

// Generate standing ticket ID (matching web format)
generateStandingTicketId(section: any): string {
  const sectionPrefix = section.name.charAt(0).toUpperCase();
  let seatId: string;
  
  do {
    const randomNum = Math.floor(Math.random() * 1000) + 1; // 1-1000
    seatId = `${sectionPrefix}-ST-${randomNum.toString().padStart(3, '0')}`;
  } while (this.selectedSeats.some(s => s.seatId === seatId) || 
           this.seats.some(s => s.id === seatId));
  
  return seatId;
}

  private getDefaultRowConfig(): SectionRowConfig {
    return {
      id: 'default',
      fromRow: 0,
      toRow: 0,
      fromColumn: 0,
      toColumn: 0,
      type: 'STANDING',
      customPrice: 0,
      color: '#cccccc'
    };
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