import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-artists-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './artists-section.component.html',
  styleUrls: ['./artists-section.component.scss']
})
export class ArtistsSectionComponent {
  @Input() artists: any[] = [];
  @Output() openArtist      = new EventEmitter<any>();
  @Output() viewAllArtists  = new EventEmitter<void>();
}