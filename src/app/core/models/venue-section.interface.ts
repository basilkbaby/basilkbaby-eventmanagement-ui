export interface SectionConfig {
  id: string;
  name: string;
  price: number;
  color: string;
  type?: 'stage' | 'section' | 'standing' | 'aisle' |'foh';
  
  // Grid properties
  col?: number; // 1-12 columns
  rows?: number; // Number of rows this section spans (REPLACES height)
  offset?: number; // 0-11 offset columns
  gap?: number; // Gap in columns (0-12)
  
  // Seat configuration (for seated sections)
  seatRows?: number; // Number of seat rows within the section
  seatColumns?: number; // Number of seat columns within the section
  hasAisle?: boolean;
  aislePosition?: number;
  
  // Other properties
  position?: string;
  order?: number;
  icon?: string;
  align?: 'start' | 'center' | 'end';
  verticalAlign?: 'top' | 'middle' | 'bottom';
  textAlign?: 'left' | 'center' | 'right';
  isRowStart?: boolean;
  isFullWidth?: boolean;
  margin?: {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
  };
  
  // Seat spacing (moved to separate interface)
  seatSpacing?: {
    horizontal: number;
    vertical: number;
    padding: number;
  };
}
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
  height?: number; // In rows (optional)
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

export interface SeatPosition {
  x: number;
  y: number;
  row: number;
  column: number;
  id: string;
}

