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
}

@Injectable({ providedIn: 'root' })
export class TicketTypeService {
  private baseUrl = environment.apiUrl + '/api';

  constructor(private http: HttpClient) {}

  getForEvent(eventId: string): Observable<PublicTicketType[]> {
    return this.http.get<{ success: boolean; data: PublicTicketType[] }>(`${this.baseUrl}/ticket-types/event/${eventId}`)
      .pipe(map(r => r.data ?? []));
  }
}
