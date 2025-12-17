import {
  Component,
  AfterViewInit,
  ViewChild,
  ElementRef,
  HostListener,
  OnInit,
  OnDestroy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { Subscription } from 'rxjs';

type TicketType = 'VIP' | 'DIAMOND' | 'GOLD' | 'SILVER';
type SeatStatus = 'AVAILABLE' | 'SELECTED' | 'SOLD' | 'NOT_AVAILABLE' | 'PARTIAL_VIEW';

interface Seat {
  id: string;
  x: number;
  y: number;
  rowIndex: number;
  rowLabel: string;
  seatNumber: number;
  section: string;
  type: TicketType;
  status: SeatStatus;
  price: number;
  features?: string[];
  sectionIndex: number;
}

interface SelectedSeat {
  id: string;
  row: string;
  fullRowLabel: string;
  number: number;
  section: string;
  tier: {
    id: string;
    name: string;
    price: number;
    description?: string;
    color?: string;
  };
  price: number;
  features: string[];
  type: 'standard' | 'vip' | 'accessible' | 'standing' | 'seated';
}

@Component({
  selector: 'app-full-seatmap',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './full-seatmap.component.html',
  styleUrls: ['./full-seatmap.component.scss']
})
export class FullSeatMapComponent implements AfterViewInit, OnInit, OnDestroy {
  @ViewChild('canvas', { static: true })
  canvasRef!: ElementRef<HTMLCanvasElement>;

  private ctx!: CanvasRenderingContext2D;
  private seats: Seat[] = [];
  public hoveredSeat: Seat | null = null;

  /* Zoom & Pan */
  private scale = 1;
  private offsetX = 0;
  private offsetY = 0;
  private isPanning = false;
  private panStart = { x: 0, y: 0 };

  /* Performance grid */
  private seatGrid = new Map<string, Seat[]>();
  private gridSize = 30;

  seatRadius = 8;
  seatGap = 22;
  middleBottomY = 0;
  stageY = 30;
  stageSeatGap = 100;

  // Store original status for each seat
  private originalStatus = new Map<string, SeatStatus>();

  // Selected seats
  selectedSeats: SelectedSeat[] = [];
  cartItemCount: number = 0;
  isCartExpanded: boolean = true;

  // Event details
  event = {
    title: 'SITHARA\'S PROJECT MALABARICUS - Manchester',
    date: new Date('2026-01-15'),
    time: '19:30',
    venue: 'Manchester venue',
    imageUrl: 'https://images.unsplash.com/photo-1501281667305-0d4eb867d3c9?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
  };

  // View options
  zoomLevel: number = 1;

  // Legend
  legendItems = [
    { label: 'VIP', color: '#8a6b8c', price: '£150' },
    { label: 'DIAMOND', color: '#8a9a5b', price: '£95' },
    { label: 'GOLD', color: '#b3543a', price: '£65' },
    { label: 'SILVER', color: '#4a8bc9', price: '£45' },
    { label: 'SELECTED', color: '#f8c51d', price: '' },
    { label: 'SOLD', color: '#cccccc', price: '' },
    { label: 'NOT AVAILABLE', color: '#e9eaec', price: '' },
    { label: 'PARTIAL VIEW', color: 'transparent', border: '#999', price: '' }
  ];

  private middleMinX = Infinity;
  private middleMaxX = 0;

  private cartSubscription: Subscription | undefined;

  readonly colors: Record<TicketType | SeatStatus | 'STAGE' | 'STAGE_INSIDE', string> = {
    VIP: '#8a6b8c',
    DIAMOND: '#8a9a5b',
    GOLD: '#b3543a',
    SILVER: '#4a8bc9',
    AVAILABLE: '#ccc',
    SELECTED: '#f8c51d',
    SOLD: '#cccccc',
    NOT_AVAILABLE: '#e9eaec',
    PARTIAL_VIEW: 'transparent',
    STAGE: '#bebebe',
    STAGE_INSIDE: '#ffffff'
  };

  readonly prices: Record<TicketType, number> = {
    VIP: 150,
    DIAMOND: 95,
    GOLD: 65,
    SILVER: 45
  };

  // Ticket tiers mapping
  readonly ticketTiers = {
    VIP: { id: '1', name: 'VIP', price: 150, description: 'Premium front row seating', color: '#630b79' },
    DIAMOND: { id: '2', name: 'Diamond', price: 95, description: 'Great view with excellent acoustics', color: '#d50657' },
    GOLD: { id: '3', name: 'Gold', price: 65, description: 'Standard seating with good view', color: '#009AE6' },
    SILVER: { id: '4', name: 'Silver', price: 45, description: 'Budget-friendly seating', color: '#4a8bc9' }
  };

  // Section labels configuration - UPDATED FOR NEW LAYOUT
  private readonly sectionLabels = {
    'Silver Left': { x: 30, y: 0, color: '#4a8bc9' },
    'Gold Left': { x: 200, y: 0, color: '#009AE6' },
    'VIP Left': { x: 450, y: 0, color: '#d50657' },
    'VIP Right': { x: 800, y: 0, color: '#d50657' },
    'Gold Right': { x: 1050, y: 0, color: '#009AE6' },
    'Silver Right': { x: 1200, y: 0, color: '#4a8bc9' }
  };

  constructor(private cartService: CartService) { }

  ngOnInit(): void {
    this.cartSubscription = this.cartService.cart$.subscribe(() => {
      this.cartItemCount = this.cartService.getItemCount();
    });
  }

  ngAfterViewInit() {
    const canvas = this.canvasRef.nativeElement;
    canvas.width = 1400;
    canvas.height = 900; // Increased height for more rows

    this.ctx = canvas.getContext('2d')!;
    this.generateSeats();
    this.draw();

    canvas.addEventListener('mousemove', e => this.onHover(e));
    canvas.addEventListener('mousedown', e => this.startPan(e));
    canvas.addEventListener('mouseup', () => this.endPan());
    canvas.addEventListener('mouseleave', () => this.endPan());
    canvas.addEventListener('wheel', e => this.onZoom(e));
    canvas.addEventListener('click', (e) => this.onClick(e));

    // Prevent default wheel behavior for the whole page
    canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
    }, { passive: false });
  }

  ngOnDestroy(): void {
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
  }

  /* ----------------- SEAT GENERATION ----------------- */
  generateSeats() {
    this.seats = [];
    this.seatGrid.clear();
    this.middleBottomY = 0;
    this.middleMinX = Infinity;
    this.middleMaxX = 0;
    this.originalStatus.clear();

    const stageBottomY = this.stageY + 80;
    const sectionLabelHeight = 40;
    const seatStartY = stageBottomY + sectionLabelHeight;

    // Generate sections according to new layout
    // Wing Outer Left: Silver, 5 seats, 20 rows
    this.createBlock('Silver', 30, seatStartY+ 100, 20, 5, 'WING_OUTER', 0, 0, 'SILVER');
    
    // Wing Inner Left: Gold, 10 seats, 19 rows
    this.createBlock('Gold', 200, seatStartY+ 50, 19, 10, 'WING_INNER', 1, 1, 'GOLD');
    
    // Middle Left: First 3 rows VIP (10 seats), then 12 rows Diamond (10 seats)
    this.createMiddleBlock('VIP', 450, seatStartY, 15, 10, 1, 'MIDDLE_LEFT');
    
    // Middle Right: First 3 rows VIP (10 seats), then 12 rows Diamond (10 seats)
    this.createMiddleBlock('VIP', 700, seatStartY, 15, 10, 2, 'MIDDLE_RIGHT');
    
    // Wing Inner Right: Gold, 10 seats, 19 rows
    this.createBlock('Gold', 950, seatStartY+50, 19, 10, 'WING_INNER', 3, 1, 'GOLD');
    
    // Wing Outer Right: Silver, 5 seats, 20 rows
    this.createBlock('Silver', 1230, seatStartY+100, 20, 5, 'WING_OUTER', 4, 0, 'SILVER');

    // Mark some seats as unavailable/sold
    this.markRandomSeatsAsNotAvailable();
    this.markRandomSeatsAsPartialView();
    this.markRandomSeatsAsSold();
  }

  createBlock(
    section: string,
    startX: number,
    startY: number,
    rows: number,
    cols: number,
    blockType: 'WING_OUTER' | 'WING_INNER' | 'MIDDLE_LEFT' | 'MIDDLE_RIGHT',
    sectionIndex: number,
    rowOffset: number,
    fixedType?: TicketType
  ) {
    for (let r = 0; r < rows; r++) {
      const globalRow = r + rowOffset;
      const rowLetter = this.getRowLetterForSection(r, 'A');

      for (let c = 1; c <= cols; c++) {
        let type: TicketType;
        
        if (fixedType) {
          type = fixedType;
        } else if (blockType.includes('MIDDLE')) {
          type = globalRow < 3 ? 'VIP' : 'DIAMOND';
        } else {
          type = blockType === 'WING_INNER' ? 'GOLD' : 'SILVER';
        }

        const y = startY + globalRow * this.seatGap;

        const features = this.generateSeatFeatures(type, blockType, globalRow, c);

        const seat: Seat = {
          id: `${section}-${globalRow}-${c}`,
          x: startX + c * this.seatGap,
          y,
          rowIndex: r,
          rowLabel: rowLetter,
          seatNumber: c,
          section,
          sectionIndex,
          type,
          status: 'AVAILABLE',
          price: this.prices[type],
          features
        };

        this.seats.push(seat);
        this.originalStatus.set(seat.id, 'AVAILABLE');
        this.indexSeat(seat);

        if (blockType.includes('MIDDLE')) {
          this.middleBottomY = Math.max(this.middleBottomY, y);
          this.middleMinX = Math.min(this.middleMinX, seat.x);
          this.middleMaxX = Math.max(this.middleMaxX, seat.x);
        }
      }
    }
  }

  createMiddleBlock(
    section: string,
    startX: number,
    startY: number,
    rows: number,
    cols: number,
    sectionIndex: number,
    blockType: 'MIDDLE_LEFT' | 'MIDDLE_RIGHT'
  ) {
    // First 3 rows: VIP
    for (let r = 0; r < 3; r++) {
      const rowLetter = this.getRowLetterForSection(r, 'A');
      
      for (let c = 1; c <= cols; c++) {
        const y = startY + r * this.seatGap;
        
        const seat: Seat = {
          id: `${section}-VIP-${r}-${c}`,
          x: startX + c * this.seatGap,
          y,
          rowIndex: r,
          rowLabel: rowLetter,
          seatNumber: c,
          section,
          sectionIndex,
          type: 'VIP',
          status: 'AVAILABLE',
          price: this.prices.VIP,
          features: this.generateSeatFeatures('VIP', blockType, r, c)
        };

        this.seats.push(seat);
        this.originalStatus.set(seat.id, 'AVAILABLE');
        this.indexSeat(seat);
        
        this.middleBottomY = Math.max(this.middleBottomY, y);
        this.middleMinX = Math.min(this.middleMinX, seat.x);
        this.middleMaxX = Math.max(this.middleMaxX, seat.x);
      }
    }
    
    // Remaining 12 rows: Diamond
    for (let r = 3; r < rows; r++) {
      const rowLetter = this.getRowLetterForSection(r, 'A');
      
      for (let c = 1; c <= cols; c++) {
        const y = startY + r * this.seatGap;
        
        const seat: Seat = {
          id: `${section}-DIA-${r}-${c}`,
          x: startX + c * this.seatGap,
          y,
          rowIndex: r,
          rowLabel: rowLetter,
          seatNumber: c,
          section,
          sectionIndex,
          type: 'DIAMOND',
          status: 'AVAILABLE',
          price: this.prices.DIAMOND,
          features: this.generateSeatFeatures('DIAMOND', blockType, r, c)
        };

        this.seats.push(seat);
        this.originalStatus.set(seat.id, 'AVAILABLE');
        this.indexSeat(seat);
        
        this.middleBottomY = Math.max(this.middleBottomY, y);
        this.middleMinX = Math.min(this.middleMinX, seat.x);
        this.middleMaxX = Math.max(this.middleMaxX, seat.x);
      }
    }
  }

  // Helper method to get row letter for a specific row in a section
  private getRowLetterForSection(rowIndex: number, startingLetter: string): string {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const startIndex = letters.indexOf(startingLetter);
    return letters[(startIndex + rowIndex) % letters.length];
  }

  generateSeatFeatures(type: TicketType, blockType: string, row: number, seatNumber: number): string[] {
    const features: string[] = [];

    if (type === 'VIP') {
      features.push('Premium View');
      features.push('Early Entry');
      features.push('VIP Lounge');
    }

    if (type === 'DIAMOND') {
      features.push('Great Acoustics');
      features.push('Center View');
    }

    if (type === 'GOLD') {
      features.push('Good View');
    }

    if (type === 'SILVER') {
      features.push('Budget Friendly');
    }

    if (Math.random() < 0.3) features.push('Near Exit');
    if (Math.random() < 0.2 && seatNumber === 1) features.push('Aisle Seat');
    if (Math.random() < 0.1) features.push('Extra Legroom');
    if (Math.random() < 0.05) features.push('Wheelchair Accessible');

    return features;
  }

  markRandomSeatsAsNotAvailable() {
    const notAvailableCount = Math.floor(this.seats.length * 0.1); // Reduced percentage
    for (let i = 0; i < notAvailableCount; i++) {
      const randomIndex = Math.floor(Math.random() * this.seats.length);
      if (this.seats[randomIndex].status === 'AVAILABLE') {
        this.seats[randomIndex].status = 'NOT_AVAILABLE';
        this.originalStatus.set(this.seats[randomIndex].id, 'NOT_AVAILABLE');
      }
    }
  }

  markRandomSeatsAsPartialView() {
    const partialViewCount = Math.floor(this.seats.length * 0.05); // Reduced percentage
    for (let i = 0; i < partialViewCount; i++) {
      const randomIndex = Math.floor(Math.random() * this.seats.length);
      if (this.seats[randomIndex].status === 'AVAILABLE') {
        this.seats[randomIndex].status = 'PARTIAL_VIEW';
        this.originalStatus.set(this.seats[randomIndex].id, 'PARTIAL_VIEW');
        this.seats[randomIndex].features = ['Partial View'];
      }
    }
  }

  markRandomSeatsAsSold() {
    const soldCount = Math.floor(this.seats.length * 0.2); // Increased percentage
    for (let i = 0; i < soldCount; i++) {
      const randomIndex = Math.floor(Math.random() * this.seats.length);
      if (this.seats[randomIndex].status === 'AVAILABLE') {
        this.seats[randomIndex].status = 'SOLD';
        this.originalStatus.set(this.seats[randomIndex].id, 'SOLD');
      }
    }
  }

  /* ----------------- DRAW ----------------- */
  draw() {
    const canvas = this.canvasRef.nativeElement;

    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);

    this.ctx.setTransform(this.scale, 0, 0, this.scale, this.offsetX, this.offsetY);

    this.drawStage();
    //this.drawSectionLabels();
    this.drawRowLabels();
    this.drawFOH();
    this.seats.forEach(seat => this.drawSeat(seat));

    if (this.hoveredSeat) {
      this.drawTooltip(this.hoveredSeat);
    }
  }

  drawSectionLabels() {
    const canvas = this.canvasRef.nativeElement;
    const stageBottomY = this.stageY + 60;

    for (const [sectionName, config] of Object.entries(this.sectionLabels)) {
      let labelY = stageBottomY + 30;
      
      this.ctx.fillStyle = '#bebebe';
      this.ctx.font = 'bold 14px Arial';
      this.ctx.textAlign = 'center';

      let labelX = config.x;
      let sectionWidth = 0;

      // Calculate section width and adjust label position
      if (sectionName === 'Wing Outer Left') {
        sectionWidth = 5 * this.seatGap;
        labelX += sectionWidth / 2 + 10;
      } else if (sectionName === 'Wing Inner Left') {
        sectionWidth = 10 * this.seatGap;
        labelX += sectionWidth / 2 + 10;
      } else if (sectionName === 'Middle Left') {
        sectionWidth = 10 * this.seatGap;
        labelX += sectionWidth / 2 + 20;
      } else if (sectionName === 'Middle Right') {
        sectionWidth = 10 * this.seatGap;
        labelX += sectionWidth / 2 + 20;
      } else if (sectionName === 'Wing Inner Right') {
        sectionWidth = 10 * this.seatGap;
        labelX += sectionWidth / 2 - 10;
      } else if (sectionName === 'Wing Outer Right') {
        sectionWidth = 5 * this.seatGap;
        labelX += sectionWidth / 2 - 10;
      }

      // Draw section name
      this.ctx.fillText(sectionName.toUpperCase(), labelX, labelY);

      // Draw dashed line under label
      this.ctx.beginPath();
      this.ctx.strokeStyle = '#bebebe';
      this.ctx.lineWidth = 1;
      this.ctx.setLineDash([3, 3]);
      this.ctx.moveTo(labelX - 40, labelY + 5);
      this.ctx.lineTo(labelX + 40, labelY + 5);
      this.ctx.stroke();
      this.ctx.setLineDash([]);
    }

    this.ctx.textAlign = 'left';
  }

  drawRowLabels() {
    this.ctx.fillStyle = '#333';
    this.ctx.font = 'bold 12px Arial';

    // Group seats by section and row label
    const sectionGroups = new Map<string, Map<string, Seat[]>>();

    this.seats.forEach(seat => {
      if (!sectionGroups.has(seat.section)) {
        sectionGroups.set(seat.section, new Map<string, Seat[]>());
      }
      const sectionMap = sectionGroups.get(seat.section)!;

      if (!sectionMap.has(seat.rowLabel)) {
        sectionMap.set(seat.rowLabel, []);
      }
      sectionMap.get(seat.rowLabel)!.push(seat);
    });

    // Draw labels for each section
    sectionGroups.forEach((rowsMap, section) => {
      rowsMap.forEach((seats, rowLabel) => {
        if (seats.length > 0) {
          const firstSeat = seats[0];

          // Position label based on section
          let labelX = firstSeat.x - this.seatGap;

          // For outer sections, position labels further left/right
          if (section.includes('Outer')) {
            labelX = firstSeat.x - this.seatGap * 1.5;
          }

          // Draw the row letter
          this.ctx.fillText(rowLabel, labelX, firstSeat.y + 4);

          // Draw seat numbers for the first row of each section
          if (rowLabel === 'A') {
            seats.forEach((seat, index) => {
              // Draw seat number below the seat for first and last seats
              if (index === 0 || index === seats.length - 1) {
                this.ctx.fillStyle = '#666';
                this.ctx.font = '10px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(seat.seatNumber.toString(), seat.x, seat.y + this.seatRadius + 15);
                this.ctx.textAlign = 'left';
                this.ctx.fillStyle = '#333';
                this.ctx.font = 'bold 12px Arial';
              }
            });
          }
        }
      });
    });
  }

  drawFOH() {
    const paddingY = 30;
    const height = 36;

    // Position FOH between middle sections
    const y = this.middleBottomY + paddingY;
    const width = (this.middleMaxX - this.middleMinX) + 30;
    
    // Draw two FOH areas - one for each middle section
    const leftFOHX = this.middleMinX - 20;
    //const rightFOHX = (this.middleMinX + this.middleMaxX) / 2 + 20;

    // Left FOH
    this.ctx.fillStyle = '#ffffffff';
    this.ctx.fillRect(leftFOHX, y, width, height);
    this.ctx.strokeStyle = '#bebebe';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(leftFOHX, y, width, height);

    // Right FOH
    // this.ctx.fillStyle = '#ffffffff';
    // this.ctx.fillRect(rightFOHX, y, width, height);
    // this.ctx.strokeStyle = '#bebebe';
    // this.ctx.lineWidth = 1;
    // this.ctx.strokeRect(rightFOHX, y, width, height);

    this.ctx.fillStyle = '#bebebe';
    this.ctx.font = 'bold 15px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('FOH AREA', leftFOHX + width / 2, y + 24);
    //this.ctx.fillText('FOH AREA', rightFOHX + width / 2, y + 24);
    this.ctx.textAlign = 'left';
  }

  drawStage() {
    const stageWidth = 500;
    const stageHeight = 60;
    const stageX = (this.middleMinX + this.middleMaxX) / 2 - stageWidth / 2;
    const borderRadius = 8;

    this.ctx.fillStyle = this.colors.STAGE_INSIDE;
    this.roundRect(this.ctx, stageX, this.stageY, stageWidth, stageHeight, borderRadius);
    this.ctx.fill();

    this.ctx.strokeStyle = this.colors.STAGE;
    this.ctx.lineWidth = 2;
    this.roundRect(this.ctx, stageX, this.stageY, stageWidth, stageHeight, borderRadius);
    this.ctx.stroke();

    this.ctx.fillStyle = '#bebebe';
    this.ctx.font = 'bold 18px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('STAGE', stageX + stageWidth / 2, this.stageY + stageHeight / 2 + 6);
  }

  drawSeat(seat: Seat) {
    this.ctx.beginPath();
    this.ctx.arc(seat.x, seat.y, this.seatRadius, 0, Math.PI * 2);

    if (seat.status === 'PARTIAL_VIEW') {
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.arc(seat.x, seat.y, this.seatRadius, Math.PI * 0.5, Math.PI * 1.5);
      this.ctx.lineTo(seat.x, seat.y);
      this.ctx.closePath();
      this.ctx.fillStyle = this.colors[seat.type];
      this.ctx.fill();

      this.ctx.beginPath();
      this.ctx.arc(seat.x, seat.y, this.seatRadius, Math.PI * 1.5, Math.PI * 0.5);
      this.ctx.lineTo(seat.x, seat.y);
      this.ctx.closePath();
      this.ctx.fillStyle = this.colors.NOT_AVAILABLE;
      this.ctx.fill();

      this.ctx.strokeStyle = '#999';
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.arc(seat.x, seat.y, this.seatRadius, 0, Math.PI * 2);
      this.ctx.stroke();
      this.ctx.restore();
    } else {
      this.ctx.fillStyle = this.getSeatColor(seat);
      this.ctx.fill();

      if (seat.status === 'NOT_AVAILABLE') {
        this.ctx.strokeStyle = '#ddd';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
      }
    }

    if (seat === this.hoveredSeat) {
      this.ctx.lineWidth = 2;
      this.ctx.strokeStyle = '#bebebe';
      this.ctx.stroke();
    }

    if (seat.status === 'SELECTED') {
      this.drawSelectedSeatIndicator(seat);
    }
  }

  private drawSelectedSeatIndicator(seat: Seat) {
    if (seat.status !== 'SELECTED') return;
    
    this.ctx.save();
    
    // Draw a green circle background
    const indicatorRadius = this.seatRadius * 1.2;
    
    // Draw green circle
    this.ctx.beginPath();
    this.ctx.arc(seat.x, seat.y, indicatorRadius, 0, Math.PI * 2);
    
    // Add subtle shadow/glow
    this.ctx.shadowColor = '#4CAF50';
    this.ctx.shadowBlur = 3;
    this.ctx.shadowOffsetX = 0;
    this.ctx.shadowOffsetY = 0;
    this.ctx.fill();
    this.ctx.shadowColor = 'transparent';
    
    // Draw white border
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = 1.2;
    this.ctx.beginPath();
    this.ctx.arc(seat.x, seat.y, indicatorRadius, 0, Math.PI * 2);
    this.ctx.stroke();
    
    // Draw white checkmark
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = 3;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    
    // Calculate checkmark points
    const size = indicatorRadius;
    this.ctx.beginPath();
    
    // Draw checkmark shape: ✓
    this.ctx.moveTo(seat.x - size * 0.3, seat.y);
    this.ctx.lineTo(seat.x - size * 0.1, seat.y + size * 0.3);
    this.ctx.lineTo(seat.x + size * 0.4, seat.y - size * 0.3);
    
    this.ctx.stroke();
    
    this.ctx.restore();
  }

  drawTooltip(seat: Seat) {
    if (seat.status === 'NOT_AVAILABLE') return;

    const statusText = seat.status === 'PARTIAL_VIEW' ? 'Partial View' :
      seat.status === 'SOLD' ? 'Sold' :
        seat.status === 'SELECTED' ? 'Selected' : seat.type;

    let priceText = '';
    if (seat.status === 'PARTIAL_VIEW') {
      priceText = ` (FX: £${seat.price})`;
    }

    const line1 = `${seat.section}  £${seat.price}${priceText}`;
    const line2 = `${seat.rowLabel}${seat.seatNumber}, ${statusText}`;

    this.ctx.font = 'bold 14px Arial';
    const line1Width = this.ctx.measureText(line1).width;

    this.ctx.font = 'bold 13px Arial';
    const line2Width = this.ctx.measureText(line2).width;

    const horizontalPadding = 16;
    const verticalPadding = 16;
    const maxTextWidth = Math.max(line1Width, line2Width);
    const tooltipWidth = maxTextWidth + horizontalPadding * 2;
    const tooltipHeight = 68;

    const x = seat.x - tooltipWidth / 2;
    const y = seat.y - this.seatRadius - tooltipHeight - 12;

    this.ctx.save();
    this.ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    this.ctx.shadowBlur = 12;
    this.ctx.shadowOffsetX = 3;
    this.ctx.shadowOffsetY = 3;

    const sectionColor = this.colors[seat.type];
    this.ctx.fillStyle = sectionColor;
    const borderRadius = 8;

    this.roundRect(this.ctx, x, y, tooltipWidth, tooltipHeight, borderRadius);
    this.ctx.fill();

    this.ctx.strokeStyle = this.darkenColor(sectionColor, 20);
    this.ctx.lineWidth = 2;
    this.roundRect(this.ctx, x, y, tooltipWidth, tooltipHeight, borderRadius);
    this.ctx.stroke();

    this.ctx.restore();

    const textStartX = x + horizontalPadding;
    const line1Y = y + verticalPadding + 14;
    const line2Y = line1Y + 20;

    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 14px Arial';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(line1, textStartX, line1Y);

    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 13px Arial';
    this.ctx.fillText(line2, textStartX, line2Y);

    this.ctx.save();
    const pointerSize = 10;
    const pointerY = y + tooltipHeight;

    this.ctx.beginPath();
    this.ctx.moveTo(seat.x - pointerSize, pointerY);
    this.ctx.lineTo(seat.x + pointerSize, pointerY);
    this.ctx.lineTo(seat.x, pointerY + pointerSize);
    this.ctx.closePath();

    this.ctx.fillStyle = sectionColor;
    this.ctx.fill();

    this.ctx.strokeStyle = this.darkenColor(sectionColor, 20);
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
    this.ctx.restore();
  }

  /* ----------------- INTERACTION ----------------- */
  onClick(e: MouseEvent) {
    if (!this.hoveredSeat ||
      this.hoveredSeat.status === 'SOLD' ||
      this.hoveredSeat.status === 'NOT_AVAILABLE') {
      return;
    }

    if (this.hoveredSeat.status === 'SELECTED') {
      this.deselectSeat(this.hoveredSeat);
    } else {
      this.selectSeat(this.hoveredSeat);
    }

    this.draw();
  }

  selectSeat(seat: Seat) {
    this.originalStatus.set(seat.id, seat.status);
    seat.status = 'SELECTED';

    const selectedSeat: SelectedSeat = {
      id: seat.id,
      row: seat.rowLabel,
      fullRowLabel: `Row ${seat.rowLabel}`,
      number: seat.seatNumber,
      section: seat.section,
      tier: {
        id: this.ticketTiers[seat.type].id,
        name: this.ticketTiers[seat.type].name,
        price: seat.price,
        description: this.ticketTiers[seat.type].description,
        color: this.ticketTiers[seat.type].color
      },
      price: seat.price,
      features: seat.features || [],
      type: seat.type === 'VIP' ? 'vip' : 'standard'
    };

    this.selectedSeats.push(selectedSeat);
  }

  deselectSeat(seat: Seat) {
    const original = this.originalStatus.get(seat.id);
    seat.status = original || 'AVAILABLE';
    this.selectedSeats = this.selectedSeats.filter(s => s.id !== seat.id);
  }

  onHover(e: MouseEvent) {
    if (this.isPanning) {
      this.offsetX += e.movementX;
      this.offsetY += e.movementY;
      this.draw();
      return;
    }

    const p = this.toWorld(e);
    this.hoveredSeat = this.findSeat(p.x, p.y);
    this.draw();
  }

  findSeat(x: number, y: number): Seat | null {
    const key = `${Math.floor(x / this.gridSize)}-${Math.floor(y / this.gridSize)}`;
    const list = this.seatGrid.get(key);
    if (!list) return null;

    return list.find(s => {
      const dx = s.x - x;
      const dy = s.y - y;
      return Math.sqrt(dx * dx + dy * dy) <= this.seatRadius;
    }) || null;
  }

  startPan(e: MouseEvent) {
    this.isPanning = e.button === 1 || e.altKey;
    this.panStart = { x: e.clientX, y: e.clientY };
  }

  endPan() {
    this.isPanning = false;
  }

  toWorld(e: MouseEvent) {
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left - this.offsetX) / this.scale,
      y: (e.clientY - rect.top - this.offsetY) / this.scale
    };
  }

  resetView() {
    this.scale = 1;
    this.offsetX = 0;
    this.offsetY = 0;
    this.draw();
  }

  onZoom(e: WheelEvent) {
    e.preventDefault();
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();

    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;

    this.zoomAt(e.deltaY < 0 ? 1.15 : 0.85, cx, cy);
  }

  zoomAt(factor: number, centerX: number, centerY: number) {
    const prevScale = this.scale;
    this.scale = Math.min(2.5, Math.max(0.6, this.scale * factor));

    this.offsetX -= (centerX / prevScale - centerX / this.scale);
    this.offsetY -= (centerY / prevScale - centerY / this.scale);

    this.draw();
  }

  /* ----------------- HELPER METHODS ----------------- */
  indexSeat(seat: Seat) {
    const key = `${Math.floor(seat.x / this.gridSize)}-${Math.floor(seat.y / this.gridSize)}`;
    if (!this.seatGrid.has(key)) this.seatGrid.set(key, []);
    this.seatGrid.get(key)!.push(seat);
  }

  getSeatColor(seat: Seat): string {
    switch (seat.status) {
      case 'SELECTED':
        return this.colors.SELECTED;
      case 'SOLD':
        return this.colors.SOLD;
      case 'NOT_AVAILABLE':
        return this.colors.NOT_AVAILABLE;
      case 'PARTIAL_VIEW':
        return this.colors.PARTIAL_VIEW;
      default:
        return this.colors[seat.type];
    }
  }

  private roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
    if (radius > width / 2) radius = width / 2;
    if (radius > height / 2) radius = height / 2;

    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  private darkenColor(color: string, percent: number): string {
    let r = parseInt(color.substr(1, 2), 16);
    let g = parseInt(color.substr(3, 2), 16);
    let b = parseInt(color.substr(5, 2), 16);

    r = Math.floor(r * (100 - percent) / 100);
    g = Math.floor(g * (100 - percent) / 100);
    b = Math.floor(b * (100 - percent) / 100);

    r = Math.max(0, Math.min(255, r));
    g = Math.max(0, Math.min(255, g));
    b = Math.max(0, Math.min(255, b));

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  /* ----------------- CART METHODS ----------------- */
  removeSeat(seat: SelectedSeat) {
    const seatElement = this.seats.find(s => s.id === seat.id);
    if (seatElement) {
      this.deselectSeat(seatElement);
      this.draw();
    }
  }

  getTotalPrice(): number {
    return this.selectedSeats.reduce((total, seat) => total + seat.price, 0);
  }

  getSelectedSeatsByTier() {
    const tierMap = new Map<string, { tier: any, count: number, total: number }>();

    this.selectedSeats.forEach(seat => {
      const key = seat.tier.id;
      if (!tierMap.has(key)) {
        tierMap.set(key, { tier: seat.tier, count: 0, total: 0 });
      }
      const data = tierMap.get(key)!;
      data.count++;
      data.total += seat.price;
    });

    return Array.from(tierMap.values());
  }

  addToCart() {
    if (this.selectedSeats.length === 0) return;

    this.selectedSeats.forEach(seat => {
      this.cartService.addSeat({
        eventId: 'event-123',
        eventTitle: this.event.title,
        eventDate: this.event.date,
        eventTime: this.event.time,
        venueName: this.event.venue,
        ticketTierId: seat.tier.id,
        ticketTierName: seat.tier.name,
        price: seat.price,
        quantity: 1,
        total: seat.price,
        id: this.generateRandomId('full-seatmap'),
        row: seat.row,
        number: seat.number,
        section: seat.section,
        type: seat.type,
        status: 'reserved',
        x: 0,
        y: 0
      });
    });

    this.clearSelection();
  }

  clearSelection() {
    this.selectedSeats.forEach(seat => {
      const seatElement = this.seats.find(s => s.id === seat.id);
      if (seatElement) {
        const original = this.originalStatus.get(seatElement.id);
        seatElement.status = original || 'AVAILABLE';
      }
    });

    this.selectedSeats = [];
    this.draw();
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-UK', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 2
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

  zoomIn(): void {
    this.zoomAt(1.2, 600, 400);
  }

  zoomOut(): void {
    this.zoomAt(0.8, 600, 400);
  }

  scrollToMap(): void {
    const mapElement = document.querySelector('.seat-map-container');
    if (mapElement) {
      mapElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  generateRandomId(prefix: string = ''): string {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 9);
    return prefix ? `${prefix}-${timestamp}-${randomStr}` : `${timestamp}-${randomStr}`;
  }

  toggleCartExpanded() {
    this.isCartExpanded = !this.isCartExpanded;
  }
}