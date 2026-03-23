import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-venues-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './venues-section.component.html',
  styleUrls: ['./venues-section.component.scss']
})
export class VenuesSectionComponent {
  @Input() eventId: string = '';
  @Input() venues: any[] = [];
  @Input() selectedVenueId: string = '';
  @Output() venueSelected = new EventEmitter<string>();
  @Output() buyTickets    = new EventEmitter<string>();

  get selectedVenue() {
    return this.venues.find(v => v.id === this.selectedVenueId) || this.venues[0];
  }

  isTicketAvailable(venue: any): boolean {
    return venue?.ticketsOpen === true;
  }

  getTicketStatusMessage(venue: any): string {
    return venue?.ticketsOpen ? 'Book Now' : 'Tickets Open Soon';
  }

  handleTicketClick(venue: any) {
    if (this.isTicketAvailable(venue)) {
      this.buyTickets.emit(venue.eventId);
    }
    // "Soon" venues: button is disabled so click is blocked at template level
  }

  openMap(url: string) {
    window.open(url, '_blank', 'noopener');
  }
}