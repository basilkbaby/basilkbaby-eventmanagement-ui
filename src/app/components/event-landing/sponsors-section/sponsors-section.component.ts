import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilterPipe } from '../../../core/pipes/filter.pipe';

@Component({
  selector: 'app-sponsors-section',
  standalone: true,
  imports: [CommonModule, FilterPipe],
  templateUrl: './sponsors-section.component.html',
  styleUrls: ['./sponsors-section.component.scss']
})
export class SponsorsSectionComponent {
  @Input() sponsors: any[] = [];

  getTierColor(tier: string): string {
    switch(tier) {
      case 'platinum': return '#e5e4e2';
      case 'gold': return '#ffd700';
      case 'silver': return '#c0c0c0';
      case 'partner': return '#cd7f32';
      default: return '#ffffff';
    }
  }
}