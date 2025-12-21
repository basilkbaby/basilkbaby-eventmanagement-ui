import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { OrderService } from '../../core/services/order.service';
import { TicketService } from '../../core/services/ticket.service';
import { Order, Ticket } from '../../core/models/order.model';

@Component({
  selector: 'app-ticket-lookup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './ticket-lookup.component.html',
  styleUrls: ['./ticket-lookup.component.scss']
})
export class TicketLookupComponent implements OnInit {
  lookupForm: FormGroup;
  loading: boolean = false;
  errorMessage: string = '';
  showHelpModal: boolean = false;
  autoNavigate: boolean = true; // Set to true to auto-navigate to confirmation
  
  order: Order | null = null;
  tickets: Ticket[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private orderService: OrderService,
    private ticketService: TicketService
  ) {
    this.lookupForm = this.fb.group({
      orderRef: ['', [Validators.required]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.email]]
    });
  }

  ngOnInit(): void {
    // Check if auto-navigate is disabled via query param
    this.route.queryParams.subscribe(params => {
      const noAutoNav = params['noAutoNav'] === 'true';
      if (noAutoNav) {
        this.autoNavigate = false;
      }
      
      const orderRef = params['ref'];
      const lastName = params['lastName'];
      const email = params['email'];
      
      if (orderRef) {
        this.lookupForm.patchValue({ orderRef });
      }
      if (lastName) {
        this.lookupForm.patchValue({ lastName });
      }
      if (email) {
        this.lookupForm.patchValue({ email });
      }
      
      // Auto-submit if all required fields are present
      if (orderRef && lastName && this.lookupForm.valid) {
        setTimeout(() => this.onSubmit(), 300);
      }
    });
  }

  onSubmit(): void {
  if (this.lookupForm.valid) {
    this.loading = true;
    this.errorMessage = '';
    this.order = null;
    this.tickets = [];

    const { orderRef, lastName, email } = this.lookupForm.value;

    this.orderService.lookupOrder(orderRef, lastName, email).subscribe({
      next: (order) => {
        // Redirect to confirmation page with order ID
        this.router.navigate(['/confirmation', order.orderId]);
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = error.message || 'Order not found. Please check your details and try again.';
        this.loading = false;
      }
    });
  } else {
    this.lookupForm.markAllAsTouched();
  }
}

  loadTickets(orderId: string): void {
    this.ticketService.getTicketsByOrder(orderId).subscribe({
      next: (tickets) => {
        this.tickets = tickets;
        // If not auto-navigating, show tickets here
        if (!this.autoNavigate) {
          console.log('Tickets loaded, showing in lookup page');
        }
      },
      error: (error) => {
        console.error('Error loading tickets:', error);
      }
    });
  }

  // Navigate to confirmation page with order ID
  navigateToConfirmation(orderId: string): void {
    setTimeout(() => {
      this.router.navigate(['/confirmation', orderId], {
        state: {
          fromLookup: true,
          lookupData: {
            orderRef: this.lookupForm.get('orderRef')?.value,
            lastName: this.lookupForm.get('lastName')?.value
          }
        }
      });
    }, 500); // Small delay to show loading state
  }

  // Manual navigation to confirmation
  viewOrderConfirmation(): void {
    if (this.order) {
      this.navigateToConfirmation(this.order.orderId);
    }
  }

  // Navigation methods
  viewTicket(ticket: Ticket): void {
    this.router.navigate(['/ticket', ticket.id]);
  }

  contactSupport(): void {
    this.router.navigate(['/contact']);
    this.hideHelp();
  }

  viewFAQ(): void {
    this.router.navigate(['/faq']);
  }

  goHome(): void {
    this.router.navigate(['/']);
  }

  browseEvents(): void {
    this.router.navigate(['/events']);
  }

  newSearch(): void {
    this.clearResults();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  clearResults(): void {
    this.order = null;
    this.tickets = [];
    this.lookupForm.reset();
    this.router.navigate([], {
      queryParams: {},
      relativeTo: this.route
    });
  }

  showHelp(event: Event): void {
    event.preventDefault();
     this.router.navigate(['/contact']);
  }

  hideHelp(): void {
    this.showHelpModal = false;
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-UK', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(date));
  }

  formatDateTime(date: Date): string {
    return new Intl.DateTimeFormat('en-UK', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  }

  // For testing - toggle auto-navigation
  toggleAutoNavigate(): void {
    this.autoNavigate = !this.autoNavigate;
    //alert(`Auto-navigation ${this.autoNavigate ? 'enabled' : 'disabled'}. Next search will ${this.autoNavigate ? 'auto-navigate' : 'show results here'}.`);
  }
}