import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Ticket } from '../models/order.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private apiUrl = environment.apiUrl + '/api';

  constructor(private http: HttpClient) {}

  getTicketsByOrder(orderId: string): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(`${this.apiUrl}/order/${orderId}`);
  }

  getTicket(id: string): Observable<Ticket> {
    return this.http.get<Ticket>(`${this.apiUrl}/${id}`);
  }

  downloadTicket(id: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/download`, {
      responseType: 'blob'
    });
  }

  resendEmail(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/orders/resend/${id}`, {});
  }

  validateTicket(qrCode: string): Observable<{ valid: boolean; ticket?: Ticket }> {
    return this.http.post<{ valid: boolean; ticket?: Ticket }>(
      `${this.apiUrl}/validate`,
      { qrCode }
    );
  }
}