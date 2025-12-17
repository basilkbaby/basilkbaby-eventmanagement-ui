import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Order, TicketEmailData } from '../models/order.model';

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  private apiUrl = 'https://your-api.com/api/email';

  constructor(private http: HttpClient) {}

  sendOrderConfirmation(order: Order, tickets: any[]): Observable<any> {
    const emailData: TicketEmailData = {
      order,
      tickets,
      customer: order.customer
    };

    // In production, make HTTP request to your backend
    // return this.http.post(`${this.apiUrl}/send-tickets`, emailData);
    
    console.log('Sending confirmation email to:', order.customer.email);
    console.log('Email data:', emailData);
    
    // For demo, simulate success
    return of({ success: true, message: 'Email sent successfully' });
  }

  sendTicketReminder(ticket: any): Observable<any> {
    // Send reminder email 24 hours before event
    console.log('Sending reminder for ticket:', ticket.id);
    return of({ success: true });
  }

  resendTickets(orderId: string): Observable<any> {
    // Resend all tickets for an order
    console.log('Resending tickets for order:', orderId);
    return of({ success: true });
  }
}