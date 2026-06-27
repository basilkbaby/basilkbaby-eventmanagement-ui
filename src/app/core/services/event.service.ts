import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { EventCouponDto, EventDetailDto, EventDto} from '../models/DTOs/event.DTO.model';

export interface EventFilter {
  searchTerm?: string;
  type?: string;
  status?: string;
  startDateFrom?: Date;
  startDateTo?: Date;
  isActive?: boolean;
  featured?: boolean;
  organizerId?: string;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: string;
  sortDescending?: boolean;
}

export interface ToggleResponse {
  isActive?: boolean;
  featured?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private baseUrl = environment.apiUrl + '/api/Event';

  constructor(private http: HttpClient) {}

  // GET: Get all events (list view)
  getEvents(filter?: EventFilter): Observable<EventDto[]> {
    let params = this.buildFilterParams(filter);
    
    return this.http.get<EventDto[]>(this.baseUrl, { params });
  }

  // GET: all events that belong to a group (artist/tour across venues).
  getEventsByGroup(groupId: string): Observable<EventDto[]> {
    return this.http.get<EventDto[]>(`${this.baseUrl}/group/${groupId}`);
  }

  // GET: Get single event by ID. `preview` lets an admin view an inactive event.
  getEventById(eventId: string, preview?: string | null): Observable<EventDetailDto> {
    let params = new HttpParams();
    if (preview) params = params.set('preview', preview);
    return this.http.get<EventDetailDto>(`${this.baseUrl}/${eventId}`, { params });
  }

  // GET: Get event details with all related data. `preview` lets an admin view an inactive event.
  getEventDetails(eventId: string, preview?: string | null): Observable<EventDetailDto> {
    let params = new HttpParams();
    if (preview) params = params.set('preview', preview);
    return this.http.get<EventDetailDto>(`${this.baseUrl}/GetEventDetails/${eventId}`, { params });
  }


  // Helper methods
  private buildFilterParams(filter?: EventFilter): HttpParams {
    let params = new HttpParams();
    
    if (!filter) return params;
    
    if (filter.searchTerm) params = params.set('searchTerm', filter.searchTerm);
    if (filter.type) params = params.set('type', filter.type);
    if (filter.status) params = params.set('status', filter.status);
    if (filter.startDateFrom) params = params.set('startDateFrom', filter.startDateFrom.toISOString());
    if (filter.startDateTo) params = params.set('startDateTo', filter.startDateTo.toISOString());
    if (filter.isActive !== undefined) params = params.set('isActive', filter.isActive.toString());
    if (filter.featured !== undefined) params = params.set('featured', filter.featured.toString());
    if (filter.organizerId) params = params.set('organizerId', filter.organizerId);
    if (filter.pageNumber) params = params.set('pageNumber', filter.pageNumber.toString());
    if (filter.pageSize) params = params.set('pageSize', filter.pageSize.toString());
    if (filter.sortBy) params = params.set('sortBy', filter.sortBy);
    if (filter.sortDescending !== undefined) params = params.set('sortDescending', filter.sortDescending.toString());
    
    return params;
  }

  validateCoupon(eventId: string, couponCode: string): Observable<EventCouponDto> {
    return this.http.post<any>(`${this.baseUrl}/${eventId}/coupons/validate`, { couponCode });
  }
}