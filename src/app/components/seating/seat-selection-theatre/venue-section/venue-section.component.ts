import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface VenueSection {
  id: string;
  name: string;
  type: 'stage' | 'seated' | 'standing' | 'foh' | 'container';
  price?: number;
  color: string;
  icon?: string;
  description?: string;
  
  // Layout properties
  width: number; // In columns (1-12)
  height?: number; // In rows
  offset?: number; // Offset in columns
  align?: 'left' | 'center' | 'right';
  
  // For seated sections
  rows?: number; // Seat rows
  columns?: number; // Seat columns
  hasAisle?: boolean;
  aislePosition?: number;
  
  // For container sections
  children?: VenueSection[];
  
  // Position (calculated)
  x?: number;
  y?: number;
  calculatedWidth?: number;
  calculatedHeight?: number;
  
  // Additional data
  availableSeats?: number;
  totalSeats?: number;
}

export interface VenueLayout {
  id: string;
  name: string;
  width: number; // Total width in pixels
  height: number; // Total height in pixels
  containerPadding: number;
  columnWidth: number; // Width of one column in pixels
  rowHeight: number; // Height of one row in pixels
  rowGap: number; // Gap between rows in pixels
  sections: VenueSection[];
}

@Component({
  selector: 'app-venue-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './venue-section.component.html',
  styleUrls: ['./venue-section.component.scss']
})
export class VenueSectionComponent implements OnInit {
  @Input() layoutConfig: VenueLayout | null = null;
  @Input() venueName: string = 'Venue Layout';
  @Output() sectionSelected = new EventEmitter<VenueSection>();
  
  // Default layout if none provided
  private defaultLayout: VenueLayout = {
    id: 'classic-theatre',
    name: 'Classic Theatre',
    width: 1200,
    height: 900,
    containerPadding: 40,
    columnWidth: 120, // (1200 - 80) / 12
    rowHeight: 150,
    rowGap: 20,
    sections: []
  };
  
  layout: VenueLayout = this.defaultLayout;
  positionedSections: VenueSection[] = [];
  selectedSection: VenueSection | null = null;
  hoveredSection: VenueSection | null = null;
  
  // Seat preview properties
  showSeatPreview: boolean = false;
  selectedSectionPreview: VenueSection | null = null;
  selectedSeats: any[] = [];
  seatPreviewSeats: any[][] = [];
  
  ngOnInit(): void {
    if (this.layoutConfig) {
      this.layout = this.layoutConfig;
    } else {
      this.layout = this.getDefaultLayout();
    }
    
    // Calculate positions for all sections
    this.positionedSections = this.calculateAllPositions();
  }
  
private getDefaultLayout(): VenueLayout {
  return {
    ...this.defaultLayout,
    sections: [
      // Row 1: Stage (full width at top)
      {
        id: 'stage',
        name: 'STAGE',
        type: 'stage',
        color: '#1e293b',
        icon: '🎭',
        width: 12,
        height: 1,
        align: 'center'
      },
      
      // Row 2: Main seating area (container for side-by-side sections)
      {
        id: 'main-seating-area',
        name: '',
        type: 'container',
        color: 'transparent',
        width: 12,
        height: 4,
        align: 'center',
        children: [
          // Left standing section
          {
            id: 'standing-left',
            name: 'STANDING',
            type: 'standing',
            price: 25,
            color: '#10B981',
            icon: '👤',
            width: 3,  // Takes 3 columns
            height: 4,  // Spans all 4 rows
            align: 'left',
            availableSeats: 150,
            totalSeats: 200
          },
          
          // Middle seated sections (container that stacks vertically)
          {
            id: 'middle-seated-container',
            name: '',
            type: 'container',
            color: 'transparent',
            width: 6,  // Takes 6 columns
            height: 4,
            align: 'center',
            children: [
              // VIP Section (top)
              {
                id: 'vip',
                name: 'VIP',
                type: 'seated',
                price: 75,
                color: '#9333EA',
                icon: '👑',
                width: 6,
                height: 1,
                rows: 6,
                columns: 12,
                hasAisle: true,
                aislePosition: 6,
                align: 'center',
                availableSeats: 50,
                totalSeats: 72
              },
              
              // Diamond Section (below VIP)
              {
                id: 'diamond',
                name: 'DIAMOND',
                type: 'seated',
                price: 50,
                color: '#0EA5E9',
                icon: '💎',
                width: 6,
                height: 1,
                rows: 8,
                columns: 12,
                hasAisle: true,
                aislePosition: 6,
                align: 'center',
                availableSeats: 67,
                totalSeats: 96
              },
              
              // Gold Section (below Diamond)
              {
                id: 'gold',
                name: 'GOLD',
                type: 'seated',
                price: 30,
                color: '#F59E0B',
                icon: '⭐',
                width: 6,
                height: 1,
                rows: 10,
                columns: 14,
                hasAisle: true,
                aislePosition: 7,
                align: 'center',
                availableSeats: 98,
                totalSeats: 140
              },
              
              // Silver Section (bottom)
              {
                id: 'silver',
                name: 'SILVER',
                type: 'seated',
                price: 20,
                color: '#94A3B8',
                icon: '🪙',
                width: 6,
                height: 1,
                rows: 12,
                columns: 16,
                hasAisle: true,
                aislePosition: 8,
                align: 'center',
                availableSeats: 134,
                totalSeats: 192
              }
            ]
          },
          
          // Right standing section
          {
            id: 'standing-right',
            name: 'STANDING',
            type: 'standing',
            price: 25,
            color: '#10B981',
            icon: '👤',
            width: 3,  // Takes 3 columns
            height: 4,  // Spans all 4 rows
            align: 'right',
            availableSeats: 150,
            totalSeats: 200
          }
        ]
      },
      
      // Row 3: FOH Area (full width at bottom)
      // {
      //   id: 'foh',
      //   name: 'FOH AREA',
      //   type: 'foh',
      //   price: 15,
      //   color: '#475569',
      //   icon: '🎤',
      //   width: 12,
      //   height: 1,
      //   align: 'center',
      //   description: 'Front of House with bar and facilities'
      // }
    ]
  };
}
  
private calculateAllPositions(): VenueSection[] {
  const result: VenueSection[] = [];
  let currentY = this.layout.containerPadding;
  
  // First pass: calculate all positions
  const allSections: VenueSection[] = [];
  
  for (const section of this.layout.sections) {
    const positionedSection = this.calculateSectionPosition(section, currentY);
    allSections.push(positionedSection);
    
    // Only move Y position for non-container sections
    if (section.type !== 'container') {
      const sectionHeight = (positionedSection.height || 1) * this.layout.rowHeight;
      currentY += sectionHeight + this.layout.rowGap;
    }
    
    // Process children
    if (section.children && section.children.length > 0) {
      const childSections = this.calculateChildPositions(
        section.children,
        positionedSection.x || 0,
        positionedSection.y || 0,
        positionedSection.calculatedWidth || 0,
        positionedSection.calculatedHeight || 0
      );
      allSections.push(...childSections);
    }
  }
  
  // Second pass: reorder for proper z-index
  // Put containers first, then other sections, FOH last
  const containers = allSections.filter(s => s.type === 'container');
  const nonContainers = allSections.filter(s => s.type !== 'container');
  const fohSections = nonContainers.filter(s => s.type === 'foh');
  const otherSections = nonContainers.filter(s => s.type !== 'foh');
  
  // Order: containers -> other sections -> FOH sections
  return [...containers, ...otherSections, ...fohSections];
}

private calculateSectionPosition(section: VenueSection, startY: number): VenueSection {
  const { containerPadding, columnWidth, rowHeight } = this.layout;
  
  // Calculate dimensions
  const calculatedWidth = section.width * columnWidth;
  const calculatedHeight = (section.height || 1) * rowHeight;
  
  // Calculate X position based on alignment
  let x = containerPadding;
  
  if (section.align === 'center') {
    x = containerPadding + (this.layout.width - (2 * containerPadding) - calculatedWidth) / 2;
  } else if (section.align === 'right') {
    x = this.layout.width - containerPadding - calculatedWidth;
  }
  
  // Apply offset
  if (section.offset) {
    x += section.offset * columnWidth;
  }
  
  // Calculate Y position
  const y = startY;
  
  return {
    ...section,
    x,
    y,
    calculatedWidth,
    calculatedHeight
  };
}
  
private calculateChildPositions(
  children: VenueSection[],
  parentX: number,
  parentY: number,
  parentWidth: number,
  parentHeight: number
): VenueSection[] {
  const result: VenueSection[] = [];
  
  // For each child, calculate its position within the parent
  children.forEach(child => {
    const childCalculatedWidth = child.width * this.layout.columnWidth;
    const childCalculatedHeight = (child.height || 1) * this.layout.rowHeight;
    
    // Calculate X position based on alignment
    let childX = parentX;
    
    if (child.align === 'center') {
      childX = parentX + (parentWidth - childCalculatedWidth) / 2;
    } else if (child.align === 'right') {
      childX = parentX + parentWidth - childCalculatedWidth;
    }
    
    // Apply offset
    if (child.offset) {
      childX += child.offset * this.layout.columnWidth;
    }
    
    // For children in a container, we need to decide on Y positioning
    // Let's stack them vertically for now, but we could implement grid positioning
    let childY = parentY;
    
    // Find previous children at similar X position to stack vertically
    const previousChildrenInColumn = result.filter(c => {
      const isSameColumn = Math.abs(c.x! - childX) < childCalculatedWidth / 2;
      return isSameColumn;
    });
    
    if (previousChildrenInColumn.length > 0) {
      // Stack below the last child in this column
      const lastChild = previousChildrenInColumn[previousChildrenInColumn.length - 1];
      childY = lastChild.y! + lastChild.calculatedHeight!;
    } else {
      // First child in this column, position at top of parent
      childY = parentY;
    }
    
    // Make sure child stays within parent bounds
    if (childY + childCalculatedHeight > parentY + parentHeight) {
      childY = parentY; // Reset to top if doesn't fit
    }
    
    const positionedChild: VenueSection = {
      ...child,
      x: childX,
      y: childY,
      calculatedWidth: childCalculatedWidth,
      calculatedHeight: childCalculatedHeight
    };
    
    result.push(positionedChild);
    
    // Process nested children
    if (child.children && child.children.length > 0) {
      const nestedChildren = this.calculateChildPositions(
        child.children,
        childX,
        childY,
        childCalculatedWidth,
        childCalculatedHeight
      );
      result.push(...nestedChildren);
    }
  });
  
  return result;
}
  // Public methods for template
  onSectionClick(section: VenueSection): void {
    if (section.type === 'seated' || section.type === 'standing') {
      this.selectedSection = section;
      this.sectionSelected.emit(section);
    }
  }
  
  getSectionGradient(section: VenueSection): string {
    const gradients: Record<string, string> = {
      'stage': 'linear-gradient(135deg, #1e293b 0%, #0f172a 50%, #020617 100%)',
      'vip': 'linear-gradient(135deg, #A855F7 0%, #7C3AED 50%, #6B21A8 100%)',
      'diamond': 'linear-gradient(135deg, #38BDF8 0%, #0EA5E9 50%, #0284C7 100%)',
      'gold': 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 50%, #D97706 100%)',
      'silver': 'linear-gradient(135deg, #94A3B8 0%, #64748b 50%, #475569 100%)',
      'standing': 'linear-gradient(135deg, #34D399 0%, #10B981 50%, #059669 100%)',
      'foh': 'linear-gradient(135deg, #475569 0%, #334155 50%, #1e293b 100%)'
    };
    
    return gradients[section.id] || gradients[section.type] || `linear-gradient(135deg, ${section.color} 0%, ${this.darkenColor(section.color, 20)} 100%)`;
  }
  
  darkenColor(color: string, percent: number): string {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max(0, (num >> 16) - amt);
    const G = Math.max(0, (num >> 8 & 0x00FF) - amt);
    const B = Math.max(0, (num & 0x0000FF) - amt);
    return `#${((1 << 24) + (R << 16) + (G << 8) + B).toString(16).slice(1)}`;
  }
  
  formatPrice(price?: number): string {
    if (!price) return 'FREE';
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0
    }).format(price);
  }
  
  getSectionIcon(section: VenueSection): string {
    const icons: Record<string, string> = {
      'stage': '🎭',
      'vip': '👑',
      'diamond': '💎',
      'gold': '⭐',
      'silver': '🪙',
      'standing': '👤',
      'foh': '🎤'
    };
    return section.icon || icons[section.type] || '🎫';
  }
  
  getSectionDescription(sectionId: string): string {
    const descriptions: Record<string, string> = {
      'stage': 'Main performance area',
      'vip': 'Premium seating closest to the stage with exclusive amenities',
      'diamond': 'Excellent view with premium amenities and comfortable seating',
      'gold': 'Great value seats with good visibility and comfortable seating',
      'silver': 'Economical seating with decent view and basic amenities',
      'standing': 'General admission standing area with flexible positioning',
      'foh': 'Front of House area with bar, restrooms, and facilities'
    };
    return descriptions[sectionId] || 'Comfortable seating area';
  }
  
  getSectionBenefits(sectionId: string): string[] {
    const benefits: Record<string, string[]> = {
      'vip': ['Best view of stage', 'VIP lounge access', 'Complimentary drinks', 'Early entry'],
      'diamond': ['Great view', 'Premium seating', 'Priority entry', 'Fast lane access'],
      'gold': ['Good view', 'Comfortable seating', 'Value pricing', 'Easy access'],
      'silver': ['Economical pricing', 'Basic seating', 'Standard access'],
      'standing': ['General admission', 'Flexible positioning', 'Close to stage'],
      'foh': ['Bar access', 'Restroom facilities', 'Merchandise stands', 'Food vendors']
    };
    return benefits[sectionId] || [];
  }
  
  // Hover methods
  showTooltip(section: VenueSection): void {
    if (section.type !== 'stage' && section.type !== 'container') {
      this.hoveredSection = section;
    }
  }
  
  hideTooltip(): void {
    this.hoveredSection = null;
  }
  
  getTooltipX(section: VenueSection): number {
    return (section.x || 0) + (section.calculatedWidth || 0) / 2 - 80;
  }
  
  getTooltipY(section: VenueSection): number {
    return (section.y || 0) - 10;
  }
  
  // Seat preview methods
  openSeatPreview(section: VenueSection): void {
    if (section.type !== 'seated') return;
    
    this.selectedSectionPreview = section;
    this.selectedSeats = [];
    this.generateSeatPreview(section);
    this.showSeatPreview = true;
  }
  
  closeSeatPreview(): void {
    this.showSeatPreview = false;
    this.selectedSectionPreview = null;
    this.selectedSeats = [];
  }
  
  private generateSeatPreview(section: VenueSection): void {
    if (!section.rows || !section.columns) return;
    
    const rows = section.rows;
    const cols = section.columns;
    const aislePosition = section.aislePosition || Math.floor(cols / 2);
    
    this.seatPreviewSeats = [];
    
    for (let row = 0; row < rows; row++) {
      const rowSeats: any[] = [];
      
      // Left side seats (before aisle)
      for (let col = 0; col < aislePosition; col++) {
        const seatNumber = (row * cols) + col + 1;
        const available = Math.random() > 0.3;
        
        rowSeats.push({
          id: `${section.id}-${row+1}-${col+1}-left`,
          row: row + 1,
          column: col + 1,
          number: seatNumber,
          available: available,
          selected: false,
          side: 'left'
        });
      }
      
      // Aisle gap
      rowSeats.push({
        id: `${section.id}-${row+1}-aisle`,
        isAisle: true,
        label: 'AISLE'
      });
      
      // Right side seats (after aisle)
      for (let col = aislePosition; col < cols; col++) {
        const seatNumber = (row * cols) + col + 1;
        const available = Math.random() > 0.3;
        
        rowSeats.push({
          id: `${section.id}-${row+1}-${col+1}-right`,
          row: row + 1,
          column: col + 1,
          number: seatNumber,
          available: available,
          selected: false,
          side: 'right'
        });
      }
      
      this.seatPreviewSeats.push(rowSeats);
    }
  }
  
  toggleSeatSelection(seat: any): void {
    if (!seat.available || seat.isAisle) return;
    
    const index = this.selectedSeats.findIndex(s => s.id === seat.id);
    
    if (index > -1) {
      this.selectedSeats.splice(index, 1);
      seat.selected = false;
    } else {
      if (this.selectedSeats.length < 8) {
        this.selectedSeats.push({...seat});
        seat.selected = true;
      }
    }
  }
  
  isSeatSelected(seat: any): boolean {
    return this.selectedSeats.some(s => s.id === seat.id);
  }
  
  bookSelectedSeats(): void {
    if (this.selectedSeats.length === 0 || !this.selectedSectionPreview) return;
    
    const totalPrice = this.selectedSeats.length * (this.selectedSectionPreview.price || 0);
    const seatNumbers = this.selectedSeats.map(s => `Row ${s.row}, Seat ${s.column}`).join(', ');
    
    alert(`Booking confirmed!\n\nSection: ${this.selectedSectionPreview.name}\nSeats: ${seatNumbers}\nTotal Price: ${this.formatPrice(totalPrice)}`);
    
    this.closeSeatPreview();
  }
  
  getSelectedSeatNumbers(): string {
    return this.selectedSeats
      .map(seat => `${seat.row}-${seat.column}`)
      .join(', ');
  }
  
  // Helper method to get availability percentage
  getAvailabilityPercentage(section: VenueSection): number {
    if (!section.availableSeats || !section.totalSeats || section.totalSeats === 0) {
      return 0;
    }
    return (section.availableSeats / section.totalSeats) * 100;
  }
  
  // Check if section is sold out
  isSoldOut(section: VenueSection): boolean {
    return section.availableSeats === 0;
  }
  
  // Get all seated sections for configuration summary
  getSeatedSections(): VenueSection[] {
    return this.positionedSections.filter(s => s.type === 'seated');
  }
  
  // Get all sections excluding containers
  getVisibleSections(): VenueSection[] {
    return this.positionedSections.filter(s => s.type !== 'container');
  }

  getGradientId(section: VenueSection): string {
  const gradientMap: Record<string, string> = {
    'stage': 'stage-gradient',
    'vip': 'vip-gradient',
    'diamond': 'diamond-gradient',
    'gold': 'gold-gradient',
    'silver': 'silver-gradient',
    'standing': 'standing-gradient',
    'foh': 'foh-gradient'
  };
  
  return gradientMap[section.id] || gradientMap[section.type] || 'standing-gradient';
}
}