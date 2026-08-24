import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { isEventFinished } from '../../../core/utils/event-date.util';

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

  isEventFinished(venue: any): boolean {
    return isEventFinished(venue?.date);
  }

  isTicketAvailable(venue: any): boolean {
    return venue?.ticketsOpen === true && !this.isEventFinished(venue);
  }

  getTicketStatusMessage(venue: any): string {
    if (this.isEventFinished(venue)) return 'Event Finished';
    return venue?.ticketsOpen ? 'Get Tickets' : 'Tickets Open Soon';
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