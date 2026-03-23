import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-production-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './production-section.component.html',
  styleUrls: ['./production-section.component.scss']
})
export class ProductionSectionComponent {
  @Input() productions: Array<{ icon: string; title: string; description: string }> = [];
}