import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { SeatService } from '../../../core/services/seat.service';
import { getSeatColor, getSeatDisplayText, getSeatStatusConfig, isSeatSelectable, RowNumberingType, Seat, SEAT_STATUS_CONFIG, SeatManagement, SeatOverride, SeatSectionType, SeatStatus, SectionRowConfig, SelectedSeat, TicketType, VenueData, VenueSection } from '../../../core/models/seats.model';
import { SeatMapVisualComponent } from './seat-map-visual/seat-map-visual.component';
import { FormatDatePipe } from '../../../core/pipes/format-date.pipe';
import { NotificationService } from '../../../core/services/notification.service';

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
  isLoading: boolean = false;

  // Zoom & Pan
  scale = .75;
  offsetX = 0;
  offsetY = 0;
  private zoomSpeed = 0.1;
  private isDragging = false;
  private lastMousePos = { x: 0, y: 0 };
  public rowLabels: {x: number, y: number, label: string, side: 'left' | 'right'}[] = [];

  
  // Seat status configuration
  readonly seatStatusConfig = SEAT_STATUS_CONFIG;
  readonly SeatStatus = SeatStatus;
  readonly SeatSectionType = SeatSectionType;
  
  // Track middle section bounds
  middleMinX = Number.MAX_VALUE;
  middleMaxX = 0;
  middleBottomY = 0;
  usedStandingIds: string[] = [];

  constructor(
    private cartService: CartService,
    private seatService: SeatService,
    private route: ActivatedRoute,
    private router: Router,
    private notificationService: NotificationService
  ) {

  }

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

        //this.venueData = this.seatService.getSeatMapConfigContinous();
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
  this.rowLabels = [];
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
  
  // Helper function to get default block letter if not specified
  const getDefaultBlockLetter = (index: number): string => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    return letters[index % letters.length];
  };
  
  // Get global row numbering type (fallback)
  const defaultRowNumberingType = RowNumberingType.PERSECTION;
  
  // Create letter generator for CONTINUOUS sections (across sections)
  const continuousLetterGenerator = this.createLetterGenerator();
  
  // Sort sections by position for proper continuous row ordering
  const sortedSections = [...this.venueData.sections].sort((a, b) => {
    if (a.y !== b.y) return a.y - b.y;
    return a.x - b.x;
  });
  
  sortedSections.forEach((section) => {
    const sectionType = section.seatSectionType || SeatSectionType.SEAT;
    
    if (sectionType === SeatSectionType.FOH) {
      return;
    }
    
    // Handle STANDING sections
    if (sectionType === SeatSectionType.STANDING) {
      this.createStandingSection(section);
      return;
    }
    
    const sectionName = section.name.toUpperCase();
    const rowOffset = section.rowOffset || 0;
    const rowConfigs = section.rowConfigs || [];
    
    // Get section's numbering type
    const sectionRowNumberingType = section.rowNumberingType || defaultRowNumberingType;
    
    // Get section-level skip letters
    const sectionSkipLetters = section.skipRowLetters || [];
    
    // Sort row configs by fromColumn
    const sortedConfigs = [...rowConfigs].sort((a, b) => 
      (a.fromColumn || 0) - (b.fromColumn || 0)
    );
    
    const rowLabelPositions = new Map<string, {
      minX: number,
      maxX: number,
      y: number,
      numberingDirection: 'left' | 'right' | 'center',
      blockLetter: string,
      rowLetter: string
    }>();
    
    let currentColumnPosition = 0;
    
    sortedConfigs.forEach((rowConfig, configIndex) => {
      const fromRow = rowConfig.fromRow;
      const toRow = rowConfig.toRow;
      const fromColumn = rowConfig.fromColumn || 1;
      const toColumn = rowConfig.toColumn || section.seatsPerRow;
      
      const blockLetter = rowConfig.blockLetter || getDefaultBlockLetter(configIndex);
      const numberingDirection: 'left' | 'right' | 'center' = 
        (rowConfig.numberingDirection as 'left' | 'right' | 'center') || 'left';
      
      // Get gap configuration
      const gapAfterColumn = rowConfig.gapAfterColumn;
      const gapSize = rowConfig.gapSize || 1;
      
      // Get skip letters (row config overrides section)
      const skipLetters = rowConfig.skipRowLetters || sectionSkipLetters;
      
      // Add gap before this block (except first block)
      if (configIndex > 0) {
        currentColumnPosition += 2; // 2 columns gap between blocks
      }
      
      // Reset row counter for EACH row config in PERSECTION mode
      let perConfigRowIndex = 0;
      
      // Calculate seat number
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
        let rowLetter: string;
        
        // Calculate correct row letter based on numbering type
        if (sectionRowNumberingType === RowNumberingType.CONTINUOUS) {
          // CONTINUOUS: Get next letter from continuous generator (across sections)
          rowLetter = continuousLetterGenerator.getNextLetter(skipLetters);
          console.log(`CONTINUOUS: Section ${section.name}, Config ${configIndex}, Row ${r}, letter ${rowLetter}`);
        } else {
          // PERSECTION: Each row config starts with A
          rowLetter = this.getRowLetterForIndex(perConfigRowIndex, skipLetters);
          console.log(`PERSECTION: Section ${section.name}, Config ${configIndex}, Row ${r}, index ${perConfigRowIndex}, letter ${rowLetter}`);
          perConfigRowIndex++;
        }
        
        let rowMinX = Infinity;
        let rowMaxX = -Infinity;
        
        for (let c = fromColumn; c <= toColumn; c++) {
          // Calculate column offset for gap
          let columnOffset = 0;
          if (gapAfterColumn && c > gapAfterColumn) {
            columnOffset = gapSize;
          }
          
          const numericSeatNumber = calculateSeatNumber(c);
          const shortSectionName = sectionName.charAt(0);
          
          // Generate seat ID based on numbering type
          let seatId: string;
          if (sectionRowNumberingType === RowNumberingType.CONTINUOUS) {
            seatId = `${shortSectionName}-${rowLetter}${numericSeatNumber}`;
          } else {
            seatId = `${shortSectionName}-${blockLetter}-${rowLetter}${numericSeatNumber}`;
          }
          
          const columnPosition = currentColumnPosition + (c - fromColumn) + columnOffset;
          const cx = section.x + (columnPosition * 22);
          const cy = section.y + (globalRow * 22);
          
          rowMinX = Math.min(rowMinX, cx);
          rowMaxX = Math.max(rowMaxX, cx);
          
          const seatOverride = statusMap.get(seatId);
          const seatStatus: SeatStatus = seatOverride?.status || SeatStatus.AVAILABLE;
          
          const seat: Seat = {
            id: seatId,
            cx,
            cy,
            r: 8,
            rowLabel: rowLetter,
            seatNumber: numericSeatNumber,
            sectionId: section.id,
            sectionName: section.sectionLabel || section.name,
            sectionConfigId: rowConfig.id,
            ticketType: rowConfig.type, 
            status: seatStatus,
            price: rowConfig.customPrice || 0,
            color: rowConfig.color,
            gridRow: globalRow,
            gridColumn: columnPosition + 1,
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
        }
        
        // Store row label position
        const rowKey = `${section.id}-${blockLetter}-${rowLetter}`;
        rowLabelPositions.set(rowKey, {
          minX: rowMinX,
          maxX: rowMaxX,
          y: section.y + (globalRow * 22),
          numberingDirection: numberingDirection,
          blockLetter: blockLetter,
          rowLetter: rowLetter
        });
      }
      
      // Update column position for next block
      currentColumnPosition += (toColumn - fromColumn + 1);
      if (gapAfterColumn) {
        currentColumnPosition += gapSize; // Account for gap in total width
      }
    });
    
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
  });
}


private getRowLetterForIndex(index: number, skipLetters: string[] = []): string {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const uppercaseSkip = skipLetters.map(l => l.toUpperCase());
  
  let currentIndex = 0;
  let foundCount = -1;
  
  while (foundCount < index) {
    let letter: string;
    
    if (currentIndex < 26) {
      letter = letters[currentIndex];
    } else {
      const doubleIndex = currentIndex - 26;
      const firstCharIndex = Math.floor(doubleIndex / 26);
      const secondCharIndex = doubleIndex % 26;
      
      if (firstCharIndex >= 26) {
        return `Row${index + 1}`;
      }
      
      letter = `${letters[firstCharIndex]}${letters[secondCharIndex]}`;
    }
    
    // Check if this letter should be included
    if (!uppercaseSkip.includes(letter)) {
      foundCount++;
    }
    
    // If we found the right letter
    if (foundCount === index) {
      return letter;
    }
    
    currentIndex++;
    
    // Safety check
    if (currentIndex > 1000) {
      console.warn('getRowLetterForIndex: Infinite loop prevented');
      return `Row${index + 1}`;
    }
  }
  
  return `Row${index + 1}`;
}
// Updated getRowLetter method that handles skipping properly
public getRowLetterWithSkip(rowIndex: number, rowConfig?: SectionRowConfig): string {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  
  // Get skip letters from rowConfig (ensure uppercase)
  const skipLetters = rowConfig?.skipRowLetters 
    ? rowConfig.skipRowLetters.map(letter => letter.toUpperCase())
    : [];
  
  console.log(`getRowLetterWithSkip: rowIndex=${rowIndex}, skipLetters=`, skipLetters);
  
  // Simple case: no skipping needed
  if (skipLetters.length === 0) {
    if (rowIndex < letters.length) {
      return letters[rowIndex];
    }
    
    // Handle beyond Z
    const firstIndex = Math.floor((rowIndex - letters.length) / letters.length);
    const secondIndex = (rowIndex - letters.length) % letters.length;
    return `${letters[firstIndex]}${letters[secondIndex]}`;
  }
  
  // For continuous numbering with skipped letters, we need a different approach
  // Generate letters sequentially and count only valid ones
  let letterIndex = 0;
  let validCount = -1;
  
  while (validCount < rowIndex) {
    let letter: string;
    
    if (letterIndex < 26) {
      // Single letters A-Z
      letter = letters[letterIndex];
    } else {
      // Double letters AA, AB, etc.
      const doubleIndex = letterIndex - 26;
      const firstCharIndex = Math.floor(doubleIndex / 26);
      const secondCharIndex = doubleIndex % 26;
      
      if (firstCharIndex >= 0 && firstCharIndex < 26 && 
          secondCharIndex >= 0 && secondCharIndex < 26) {
        letter = `${letters[firstCharIndex]}${letters[secondCharIndex]}`;
      } else {
        letterIndex++;
        continue;
      }
    }
    
    // Check if this letter should be included
    if (!skipLetters.includes(letter)) {
      validCount++;
      
      // If this is the letter we're looking for
      if (validCount === rowIndex) {
        return letter;
      }
    }
    
    letterIndex++;
    
    // Safety check
    if (letterIndex > 1000) {
      console.warn('getRowLetterWithSkip: Infinite loop prevented');
      return `Row${rowIndex + 1}`;
    }
  }
  
  return `Row${rowIndex + 1}`;
}


public getRowLetter(rowIndex: number, rowConfig?: SectionRowConfig): string {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  
  // Get skip letters from rowConfig (ensure uppercase)
  const skipLetters = rowConfig?.skipRowLetters 
    ? rowConfig.skipRowLetters.map(letter => letter.toUpperCase())
    : [];
  
  // Simple case: no skipping needed
  if (skipLetters.length === 0) {
    if (rowIndex < letters.length) {
      return letters[rowIndex];
    }
    
    // Handle beyond Z
    const firstIndex = Math.floor((rowIndex - letters.length) / letters.length);
    const secondIndex = (rowIndex - letters.length) % letters.length;
    return `${letters[firstIndex]}${letters[secondIndex]}`;
  }
  
  // Build sequence of letters, skipping specified ones
  let currentLetterIndex = 0;
  let validLetterCount = -1;
  
  while (validLetterCount < rowIndex) {
    let letter: string;
    
    if (currentLetterIndex < 26) {
      // Single letters A-Z
      letter = letters[currentLetterIndex];
    } else {
      // Double letters AA, AB, etc.
      const doubleIndex = currentLetterIndex - 26;
      const firstCharIndex = Math.floor(doubleIndex / 26);
      const secondCharIndex = doubleIndex % 26;
      
      // Check bounds
      if (firstCharIndex < 0 || firstCharIndex >= 26 || 
          secondCharIndex < 0 || secondCharIndex >= 26) {
        currentLetterIndex++;
        continue;
      }
      
      letter = `${letters[firstCharIndex]}${letters[secondCharIndex]}`;
    }
    
    // Check if this letter should be included
    if (!skipLetters.includes(letter)) {
      validLetterCount++;
      
      // If this is the letter we're looking for
      if (validLetterCount === rowIndex) {
        return letter;
      }
    }
    
    currentLetterIndex++;
    
    // Safety check
    if (currentLetterIndex > 1000) {
      console.warn('getRowLetter: Infinite loop prevented');
      return `Row${rowIndex + 1}`;
    }
  }
  
  return `Row${rowIndex + 1}`;
}



private createLetterGenerator() {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let singleLetterIndex = 0;
  let doubleLetterIndex = 0;
  
  return {
    getNextLetter: (skipLetters: string[] = []) => {
      const uppercaseSkip = skipLetters.map(l => l.toUpperCase());
      
      while (true) {
        let letter: string;
        
        // First try single letters A-Z
        if (singleLetterIndex < 26) {
          letter = letters[singleLetterIndex];
          singleLetterIndex++;
        } 
        // Then try double letters AA, AB, etc.
        else {
          const firstCharIndex = Math.floor(doubleLetterIndex / 26);
          const secondCharIndex = doubleLetterIndex % 26;
          
          if (firstCharIndex >= 26) {
            // We've exhausted all possibilities
            return `Row${singleLetterIndex + doubleLetterIndex}`;
          }
          
          letter = `${letters[firstCharIndex]}${letters[secondCharIndex]}`;
          doubleLetterIndex++;
        }
        
        // Check if this letter should be included
        if (!uppercaseSkip.includes(letter)) {
          return letter;
        }
        
        // If we've tried too many letters
        if (singleLetterIndex + doubleLetterIndex > 1000) {
          console.warn('Letter generator: Too many skipped letters');
          return `Row${singleLetterIndex + doubleLetterIndex}`;
        }
      }
    },
    
    // Reset the generator if needed
    reset: () => {
      singleLetterIndex = 0;
      doubleLetterIndex = 0;
    }
  };
}

private getRowLetterForSection(rowIndex: number, skipLetters: string[] = []): string {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const uppercaseSkip = skipLetters.map(l => l.toUpperCase());
  
  let letterCount = 0;
  let currentIndex = 0;
  
  while (letterCount <= rowIndex) {
    let letter: string;
    
    if (currentIndex < 26) {
      letter = letters[currentIndex];
    } else {
      const doubleIndex = currentIndex - 26;
      const firstCharIndex = Math.floor(doubleIndex / 26);
      const secondCharIndex = doubleIndex % 26;
      
      if (firstCharIndex >= 26) {
        return `Row${rowIndex + 1}`;
      }
      
      letter = `${letters[firstCharIndex]}${letters[secondCharIndex]}`;
    }
    
    if (!uppercaseSkip.includes(letter)) {
      if (letterCount === rowIndex) {
        return letter;
      }
      letterCount++;
    }
    
    currentIndex++;
    
    if (currentIndex > 1000) {
      console.warn('getRowLetterForSection: Infinite loop prevented');
      return `Row${rowIndex + 1}`;
    }
  }
  
  return `Row${rowIndex + 1}`;
}


// ========== STANDING SECTION CREATION ==========
  private createStandingSection(section: VenueSection): void {
    const seatId = this.generateStandingTicketId(section);

    
    // Calculate center position for standing area
    const cx = section.x ;
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
      isStandingArea: true,
      blockIndex : 0,
      blockStartSeat : 0,
      blockTotalSeats : 0,
      blockLetter: 'A'
    };
    
    this.seats.push(seat);
  }
  
generateStandingTicketId(section: any): string {
  const sectionPrefix = section.name.charAt(0).toUpperCase();
  let seatId: string;
  
  do {
    const randomNum = Math.floor(Math.random() * 1000) + 1; // 1-1000
    seatId = `${sectionPrefix}-ST-${randomNum.toString().padStart(3, '0')}`;
  } while (this.usedStandingIds.includes(seatId));
  
  this.usedStandingIds.push(seatId);
  return seatId;
}

hasStandingTickets(): boolean {
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
  const section = this.venueData.sections.find(s => s.id === originalStandingSeat.sectionId);
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
      seatId: seat.id,
      row: seat.rowLabel,
      number: seat.seatNumber,
      sectionName: seat.sectionName,
      sectionId: seat.sectionId,
      sectionConfigId : seat.sectionConfigId,
      tier: {
        id: seat.id,
        name: seat.ticketType,
        price: seat.price,
        color: seat.color
      },
      price: seat.price,
      features: seat.features || [],
      isStandingArea: seat.isStandingArea || false,
      isGeneralAdmission : false
    };
    
    this.selectedSeats.push(selectedSeat);
    this.selectedSeatIds.push(seat.id);
  }
  
  deselectSeat(seat: Seat) {
    seat.status = SeatStatus.AVAILABLE;
    this.selectedSeats = this.selectedSeats.filter(s => s.seatId !== seat.id);
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
    if (this.selectedSeatIds.length === 0 || this.isLoading) return;
    
    // Start loading
    this.isLoading = true;
    
    
    this.cartService.addToCart(this.eventId, this.selectedSeats)
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
  
  private mapTicketTypeToCartType(ticketType: TicketType): 'standard' | 'vip' | 'accessible' | 'standing' | 'seated' | 'foh' | 'balcony' | 'general' {
    const typeMap: Record<TicketType, 'standard' | 'vip' | 'accessible' | 'standing' | 'seated' | 'foh'| 'balcony' | 'general'> = {
      VIP: 'vip',
      DIAMOND: 'vip',
      GOLD: 'standard',
      SILVER: 'standard',
      FOH: 'foh',
      STANDING: 'standing',
      BALCONY: 'balcony',
      GENERAL: 'general'
    };
    
    return typeMap[ticketType] || 'standard';
  }
  
  clearSelection() {
    this.selectedSeats.forEach(seat => {
      const seatElement = this.seats.find(s => s.id === seat.seatId);
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
        // Skip rows with type 'foh'
        if (rowConfig.type === 'FOH') {
          return;
        }
        
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
    
    // Convert to array and sort by price (low to high)
    return Array.from(tiers.values()).sort((a, b) => a.price - b.price);
}
  
  getDisplayStatuses() {
    const statuses = [
      SeatStatus.SELECTED,
      SeatStatus.BOOKED,
      //SeatStatus.UNAVAILABLE,
      //SeatStatus.PARTIAL_VIEW,
      //SeatStatus.RESERVED,
      //SeatStatus.BLOCKED
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