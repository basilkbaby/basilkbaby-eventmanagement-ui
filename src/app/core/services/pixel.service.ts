import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

/**
 * Per-event Meta (Facebook) Pixel. Each event's pixel ID comes from backend config
 * (GET /api/meta-pixel/{eventId}); some events share a pixel, some differ. We init each
 * pixel once and fire with fbq('trackSingle', pixelId, ...) so an event's data only ever
 * goes to its own pixel (never cross-contaminating other organizers).
 */
@Injectable({ providedIn: 'root' })
export class PixelService {
  private baseUrl = environment.apiUrl + '/api';
  private pixelCache = new Map<string, Observable<string | null>>();
  private inited = new Set<string>();

  constructor(private http: HttpClient) {}

  private resolve(eventId: string): Observable<string | null> {
    if (!eventId) return of(null);
    if (!this.pixelCache.has(eventId)) {
      const req = this.http
        .get<{ pixelId: string | null }>(`${this.baseUrl}/meta-pixel/${eventId}`)
        .pipe(
          map(r => r?.pixelId ?? null),
          catchError(() => of(null)),
          shareReplay(1)
        );
      this.pixelCache.set(eventId, req);
    }
    return this.pixelCache.get(eventId)!;
  }

  private fire(pixelId: string, eventName: string, data?: object): void {
    const fbq = (window as any).fbq;
    if (!fbq || !pixelId) return;
    if (!this.inited.has(pixelId)) {
      fbq('init', pixelId);
      this.inited.add(pixelId);
    }
    fbq('trackSingle', pixelId, eventName, data || {});
  }

  /** Resolve the event's pixel and fire a standard Meta event against it. */
  track(eventId: string, eventName: string, data?: object): void {
    this.resolve(eventId).subscribe(pixelId => {
      if (pixelId) this.fire(pixelId, eventName, data);
    });
  }

  // ── Convenience wrappers for the funnel ──────────────────────────────────
  pageView(eventId: string): void {
    this.track(eventId, 'PageView');
  }

  viewContent(eventId: string, value?: number): void {
    this.track(eventId, 'ViewContent', this.payload(eventId, value));
  }

  addToCart(eventId: string, value: number): void {
    this.track(eventId, 'AddToCart', this.payload(eventId, value));
  }

  initiateCheckout(eventId: string, value: number, numItems?: number): void {
    this.track(eventId, 'InitiateCheckout', { ...this.payload(eventId, value), num_items: numItems });
  }

  addPaymentInfo(eventId: string, value: number): void {
    this.track(eventId, 'AddPaymentInfo', this.payload(eventId, value));
  }

  purchase(eventId: string, value: number, orderId?: string): void {
    this.track(eventId, 'Purchase', { ...this.payload(eventId, value), order_id: orderId });
  }

  private payload(eventId: string, value?: number): object {
    return {
      value: value ?? undefined,
      currency: 'GBP',
      content_type: 'product',
      content_ids: [eventId]
    };
  }
}
