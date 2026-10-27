import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TicketTypeService, PublicTicketType } from '../../../core/services/ticket-type.service';
import { CartService } from '../../../core/services/cart.service';
import { EventService } from '../../../core/services/event.service';

interface SelectableTicket extends PublicTicketType {
  qty: number;
}

@Component({
  selector: 'app-ticket-selection',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './ticket-selection.component.html',
  styleUrls: ['./ticket-selection.component.scss']
})
export class TicketSelectionComponent implements OnInit {
  eventId = '';
  event: any = null;
  tickets: SelectableTicket[] = [];
  loading = true;
  adding = false;
  error = '';

  private readonly serviceFeePerTicket = 1; // matches backend PerSeatServiceFee

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ticketTypeService: TicketTypeService,
    private cartService: CartService,
    private eventService: EventService
  ) {}

  ngOnInit(): void {
    this.eventId = this.route.snapshot.paramMap.get('id') || '';

    this.eventService.getEventDetails(this.eventId).subscribe({
      next: (e) => this.event = e,
      error: () => {}
    });

    this.ticketTypeService.getForEvent(this.eventId).subscribe({
      next: (items) => {
        this.tickets = items.map(t => ({ ...t, qty: 0 }));
        this.loading = false;
      },
      error: () => { this.error = 'Could not load tickets. Please try again.'; this.loading = false; }
    });
  }

  maxFor(t: SelectableTicket): number {
    return Math.min(t.maxPerOrder, t.available);
  }

  inc(t: SelectableTicket): void {
    if (t.qty < this.maxFor(t)) t.qty++;
  }

  dec(t: SelectableTicket): void {
    if (t.qty > 0) t.qty--;
  }

  get totalQty(): number {
    return this.tickets.reduce((s, t) => s + t.qty, 0);
  }

  get subtotal(): number {
    return this.tickets.reduce((s, t) => s + t.qty * t.price, 0);
  }

  get serviceFee(): number {
    return this.totalQty * this.serviceFeePerTicket;
  }

  get total(): number {
    return this.subtotal + this.serviceFee;
  }

  continue(): void {
    const selected = this.tickets
      .filter(t => t.qty > 0)
      .map(t => ({ ticketTypeId: t.id, quantity: t.qty }));

    if (selected.length === 0) { this.error = 'Please select at least one ticket.'; return; }

    // Enforce per-order minimums.
    for (const t of this.tickets) {
      if (t.qty > 0 && t.qty < t.minPerOrder) {
        this.error = `Minimum ${t.minPerOrder} for ${t.name}.`;
        return;
      }
    }

    this.error = '';
    this.adding = true;
    this.cartService.addTicketsToCart(this.eventId, selected).subscribe({
      next: (res) => {
        this.adding = false;
        if (res.success) {
          this.router.navigate(['/checkout']);
        } else {
          this.error = res.error || 'Could not add tickets to cart.';
        }
      },
      error: (e) => {
        this.adding = false;
        this.error = e?.error?.error || 'Could not add tickets to cart.';
      }
    });
  }
}
