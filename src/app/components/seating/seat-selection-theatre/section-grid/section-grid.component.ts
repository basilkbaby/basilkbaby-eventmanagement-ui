// import { CommonModule } from "@angular/common";
// import { Component, EventEmitter, Input, Output } from "@angular/core";

// // simplified-venue-render.component.ts
// @Component({
//   selector: 'app-simplified-venue-render',
//   standalone: true,
//   imports: [CommonModule],
//   template: `
    
//   `
// })
// export class SimplifiedVenueRenderComponent {
//   @Input() layout?: SimplifiedVenueLayout;
//   @Input() cellSize = 100;
//   @Input() gap = 5;
  
//   @Output() sectionSelected = new EventEmitter<SimplifiedVenueSection>();
  
//   get totalWidth(): number {
//     return (this.layout?.gridCols || 0) * (this.cellSize + this.gap) - this.gap;
//   }
  
//   get totalHeight(): number {
//     return (this.layout?.gridRows || 0) * (this.cellSize + this.gap) - this.gap;
//   }
  
//   getSectionX(section: SimplifiedVenueSection): number {
//     return (section.gridArea.startCol) * (this.cellSize + this.gap);
//   }
  
//   getSectionY(section: SimplifiedVenueSection): number {
//     return (section.gridArea.startRow) * (this.cellSize + this.gap);
//   }
  
//   getSectionWidth(section: SimplifiedVenueSection): number {
//     const cols = section.gridArea.endCol - section.gridArea.startCol + 1;
//     return cols * this.cellSize + (cols - 1) * this.gap;
//   }
  
//   getSectionHeight(section: SimplifiedVenueSection): number {
//     const rows = section.gridArea.endRow - section.gridArea.startRow + 1;
//     return rows * this.cellSize + (rows - 1) * this.gap;
//   }
  
//   getSectionGradient(color: string): string {
//     return `linear-gradient(135deg, ${color} 0%, ${this.darkenColor(color, 20)} 100%)`;
//   }
  
//   getBorderColor(section: SimplifiedVenueSection): string {
//     switch(section.type) {
//       case 'stage': return '#fbbf24';
//       case 'vip': return '#f0abfc';
//       default: return '#ffffff';
//     }
//   }
  
//   selectSection(section: SimplifiedVenueSection): void {
//     this.sectionSelected.emit(section);
//   }
  
//   private darkenColor(color: string, percent: number): string {
//     // Same as previous implementation
//     const num = parseInt(color.replace('#', ''), 16);
//     const amt = Math.round(2.55 * percent);
//     const R = Math.max(0, (num >> 16) - amt);
//     const G = Math.max(0, (num >> 8 & 0x00FF) - amt);
//     const B = Math.max(0, (num & 0x0000FF) - amt);
//     return `#${((1 << 24) + (R << 16) + (G << 8) + B).toString(16).slice(1)}`;
//   }
// }