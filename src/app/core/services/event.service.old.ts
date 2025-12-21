import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { MOCK_EVENTS } from '../mock/mock-events.data';
import { Event, EventType, QuestionType, SponsorLevel, EventStatus } from '../models/event.model';

@Injectable({
  providedIn: 'root'
})
export class EventServiceOld {
  private mockEvents: Event[] = MOCK_EVENTS;

  // GET methods
  getEvents(): Observable<Event[]> {
    return of(this.mockEvents);
  }

  getEventById(eventId: string): Observable<Event> {
    const event = this.mockEvents.find(e => e.id === eventId);
    if (event) {
      return of(event);
    }
    throw new Error('Event not found');
  }

  getEventsByOrganizer(organizerId: string): Observable<Event[]> {
    const filteredEvents = this.mockEvents.filter(event => event.organizerId === organizerId);
    return of(filteredEvents);
  }

  getEventsByStatus(status: EventStatus): Observable<Event[]> {
    const filteredEvents = this.mockEvents.filter(event => event.status === status);
    return of(filteredEvents);
  }

  getFeaturedEvents(): Observable<Event[]> {
    return of(this.mockEvents.filter(event => event.featured));
  }

  getUpcomingEvents(limit?: number): Observable<Event[]> {
    const now = new Date();
    let events = this.mockEvents
      .filter(event => event.status === EventStatus.PUBLISHED && event.startDate > now)
      .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
    
    if (limit) {
      events = events.slice(0, limit);
    }
    
    return of(events);
  }

  // CREATE method
  createEvent(eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>): Observable<Event> {
    // TODO: Uncomment when API is ready
    // return this.http.post<Event>('/api/events', eventData);
    
    // Mock implementation
    const newEvent: Event = {
      ...eventData,
      id: (this.mockEvents.length + 1).toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.mockEvents.push(newEvent);
    return of(newEvent);
  }

    // UpdateEvent method
  UpdateEvent(eventData:any): Observable<Event> {
    // TODO: Uncomment when API is ready
    // return this.http.post<Event>('/api/events', eventData);
    
    // Mock implementation
    const newEvent: Event = {
      ...eventData,
      id: (this.mockEvents.length + 1).toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.mockEvents.push(newEvent);
    return of(newEvent);
  }


      // UpdateEvent method
  toggleEventStatus(eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>): Observable<Event> {
    // TODO: Uncomment when API is ready
    // return this.http.post<Event>('/api/events', eventData);
    
    // Mock implementation
    const newEvent: Event = {
      ...eventData,
      id: (this.mockEvents.length + 1).toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.mockEvents.push(newEvent);
    return of(newEvent);
  }

      // UpdateEvent method
  deleteEvent(eventId : any): Observable<true> {
    
    return of(true);
  }

  // SEARCH and FILTER methods
  searchEvents(query: string): Observable<Event[]> {
    const searchTerm = query.toLowerCase();
    const events = this.mockEvents.filter(event => 
      event.title.toLowerCase().includes(searchTerm) ||
      event.description.toLowerCase().includes(searchTerm) ||
      event.venue.city.toLowerCase().includes(searchTerm) ||
      event.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
    );
    return of(events);
  }

  getEventsByType(type: EventType): Observable<Event[]> {
    const filteredEvents = this.mockEvents.filter(event => event.type === type);
    return of(filteredEvents);
  }



}