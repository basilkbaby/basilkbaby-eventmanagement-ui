import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './ticket-selection.component.html',
  styleUrls: ['./ticket-selection.component.scss']
})
export class TicketSelectionComponent implements OnInit {
  // When used as a child (e.g. embedded in the event-details page for general-admission
  // events) the host passes the id + sets embedded=true. Standalone (routed) use falls
  // back to the route param and shows its own header.
  @Input() eventId = '';
  @Input() embedded = false;
  event: any = null;
  tickets: SelectableTicket[] = [];
  loading = true;
  adding = false;
  error = '';

  // ── Shared access code (reveals access-code-gated categories) ──────────────
  accessCodeInput = '';
  appliedAccessCode = '';
  checkingCode = false;
  accessCodeError = '';
  showAccessCodeBox = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ticketTypeService: TicketTypeService,
    private cartService: CartService,
    private eventService: EventService
  ) {}

  ngOnInit(): void {
    // Prefer an explicitly-bound id (embedded mode); otherwise read it from the route.
    this.eventId = this.eventId || this.route.snapshot.paramMap.get('id') || '';

    this.eventService.getEventDetails(this.eventId).subscribe({
      next: (e) => this.event = e,
      error: () => {}
    });

    this.reloadTickets();
  }

  /** (Re)loads ticket categories, preserving current quantities. Passes the applied access code
   *  so revealed (gated) categories are included. */
  private reloadTickets(): void {
    this.ticketTypeService.getForEvent(this.eventId, this.appliedAccessCode || undefined).subscribe({
      next: (items) => {
        const prevQty = new Map(this.tickets.map(t => [t.id, t.qty]));
        this.tickets = items.map(t => ({ ...t, qty: prevQty.get(t.id) ?? 0 }));
        this.loading = false;
      },
      error: () => { this.error = 'Could not load tickets. Please try again.'; this.loading = false; }
    });
  }

  /** Validates the entered code; on success re-fetches so gated categories appear. */
  applyAccessCode(): void {
    const code = this.accessCodeInput?.trim();
    if (!code) { this.accessCodeError = 'Enter a code.'; return; }
    this.checkingCode = true;
    this.accessCodeError = '';
    this.ticketTypeService.validateAccessCode(this.eventId, code).subscribe({
      next: (valid) => {
        this.checkingCode = false;
        if (valid) {
          this.appliedAccessCode = code;
          this.reloadTickets();
        } else {
          this.accessCodeError = 'That code is not valid for this event.';
        }
      },
      error: () => { this.checkingCode = false; this.accessCodeError = 'Could not verify the code. Try again.'; }
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
    // Per-ticket service fee is configured per category by the admin.
    return this.tickets.reduce((s, t) => s + t.qty * (t.serviceFee || 0), 0);
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
    this.cartService.addTicketsToCart(this.eventId, selected, this.appliedAccessCode || undefined).subscribe({
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
