import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface PublicTicketType {
  id: string;
  eventId: string;
  name: string;
  description?: string | null;
  price: number;
  available: number;
  minPerOrder: number;
  maxPerOrder: number;
  soldOut: boolean;
  serviceFee: number;
  requiresAccessCode: boolean;
}

@Injectable({ providedIn: 'root' })
export class TicketTypeService {
  private baseUrl = environment.apiUrl + '/api';

  constructor(private http: HttpClient) {}

  /** Public ticket categories. Supplying a valid accessCode reveals access-code-gated ones. */
  getForEvent(eventId: string, accessCode?: string): Observable<PublicTicketType[]> {
    const url = `${this.baseUrl}/ticket-types/event/${eventId}`
      + (accessCode ? `?accessCode=${encodeURIComponent(accessCode)}` : '');
    return this.http.get<{ success: boolean; data: PublicTicketType[] }>(url)
      .pipe(map(r => r.data ?? []));
  }

  /** Checks a code without fetching the list; true when it matches the event's shared code. */
  validateAccessCode(eventId: string, accessCode: string): Observable<boolean> {
    return this.http.get<{ success: boolean; valid: boolean }>(
      `${this.baseUrl}/ticket-types/event/${eventId}/validate-access-code?accessCode=${encodeURIComponent(accessCode)}`)
      .pipe(map(r => r.valid === true));
  }
}
