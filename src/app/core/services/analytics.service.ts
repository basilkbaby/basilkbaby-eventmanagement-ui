import { Injectable } from '@angular/core';
import { Order } from '../models/order.model';
import { CartSummaryDto } from '../models/DTOs/cart.DTO.model';
import { SelectedSeat } from '../models/seats.model';

declare global {
  interface Window { dataLayer: any[]; }
}

@Injectable({ providedIn: 'root' })
export class AnalyticsService {

  private push(data: object): void {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(data);
  }

  // Must clear previous ecommerce object before every ecommerce event (GTM best practice)
  private clearEcommerce(): void {
    this.push({ ecommerce: null });
  }

  // ── Page view ─────────────────────────────────────────────────────────────

  trackPageView(url: string, title: string): void {
    this.push({ event: 'page_view', page_path: url, page_title: title });
  }

  // ── Seat map ──────────────────────────────────────────────────────────────

  trackSeatSelected(seat: SelectedSeat, eventId: string, eventName: string): void {
    this.push({
      event: 'seat_selected',
      seat_id: seat.seatId,
      section_name: seat.sectionName,
      seat_price: seat.price,
      event_id: eventId,
      event_name: eventName
    });
  }

  trackSeatDeselected(seat: SelectedSeat, eventId: string, eventName: string): void {
    this.push({
      event: 'seat_deselected',
      seat_id: seat.seatId,
      section_name: seat.sectionName,
      seat_price: seat.price,
      event_id: eventId,
      event_name: eventName
    });
  }

  // ── Add to cart ───────────────────────────────────────────────────────────

  trackAddToCart(seats: SelectedSeat[], eventId: string, eventName: string): void {
    this.clearEcommerce();
    this.push({
      event: 'add_to_cart',
      ecommerce: {
        currency: 'GBP',
        value: seats.reduce((t, s) => t + s.price, 0),
        items: seats.map((s, i) => ({
          item_id: s.seatId,
          item_name: `${eventName} – ${s.sectionName} Seat ${s.number}`,
          item_category: eventName,
          item_category2: s.sectionName,
          item_variant: s.tier?.name,
          price: s.price,
          quantity: 1,
          index: i
        }))
      }
    });
  }

  // ── Cart ──────────────────────────────────────────────────────────────────

  trackViewCart(summary: CartSummaryDto, eventName: string): void {
    this.clearEcommerce();
    this.push({
      event: 'view_cart',
      ecommerce: {
        currency: 'GBP',
        value: summary.total,
        items: summary.cartItems.map((item, i) => ({
          item_id: item.seatId,
          item_name: `${eventName} – ${item.section} Seat ${item.seatNumber}`,
          item_category: eventName,
          item_category2: item.section,
          price: item.price,
          quantity: 1,
          index: i
        }))
      }
    });
  }

  trackRemoveFromCart(
    item: { seatId: string; seatNumber: string; section: string; price: number },
    eventId: string,
    eventName: string
  ): void {
    this.clearEcommerce();
    this.push({
      event: 'remove_from_cart',
      ecommerce: {
        currency: 'GBP',
        value: item.price,
        items: [{
          item_id: item.seatId,
          item_name: `${eventName} – ${item.section} Seat ${item.seatNumber}`,
          item_category: eventName,
          item_category2: item.section,
          price: item.price,
          quantity: 1
        }]
      }
    });
  }

  // ── Checkout funnel ───────────────────────────────────────────────────────

  trackBeginCheckout(summary: CartSummaryDto, eventName: string): void {
    this.clearEcommerce();
    this.push({
      event: 'begin_checkout',
      ecommerce: {
        currency: 'GBP',
        value: summary.total,
        coupon: summary.couponCode || undefined,
        items: summary.cartItems.map((item, i) => ({
          item_id: item.seatId,
          item_name: `${eventName} – ${item.section} Seat ${item.seatNumber}`,
          item_category: eventName,
          item_category2: item.section,
          price: item.price,
          quantity: 1,
          index: i
        }))
      }
    });
  }

  trackAddPaymentInfo(summary: CartSummaryDto, eventName: string, paymentType = 'card'): void {
    this.clearEcommerce();
    this.push({
      event: 'add_payment_info',
      ecommerce: {
        currency: 'GBP',
        value: summary.total,
        payment_type: paymentType,
        coupon: summary.couponCode || undefined,
        items: summary.cartItems.map((item, i) => ({
          item_id: item.seatId,
          item_name: `${eventName} – ${item.section} Seat ${item.seatNumber}`,
          item_category: eventName,
          item_category2: item.section,
          price: item.price,
          quantity: 1,
          index: i
        }))
      }
    });
  }

  // ── Purchase (conversion) ─────────────────────────────────────────────────

  trackPurchase(order: Order): void {
    this.clearEcommerce();
    this.push({
      event: 'purchase',
      ecommerce: {
        transaction_id: order.orderNumber || order.orderId,
        value: order.totalAmount,
        tax: order.serviceFee ?? 0,
        shipping: 0,
        currency: 'GBP',
        coupon: order.couponCode || undefined,
        items: order.seats.map((seat, i) => ({
          item_id: seat.seatId,
          item_name: `${order.eventName} – ${seat.sectionName} Seat ${seat.seatNumber}`,
          item_category: order.eventName,
          item_category2: seat.sectionName,
          price: seat.price,
          quantity: 1,
          index: i
        }))
      }
    });
  }

  // ── Coupon ────────────────────────────────────────────────────────────────

  trackCouponApplied(couponCode: string, discountAmount: number, eventId: string): void {
    this.push({
      event: 'coupon_applied',
      coupon_code: couponCode,
      discount_amount: discountAmount,
      event_id: eventId
    });
  }

  trackCouponRemoved(couponCode: string, eventId: string): void {
    this.push({
      event: 'coupon_removed',
      coupon_code: couponCode,
      event_id: eventId
    });
  }

  // ── Errors ────────────────────────────────────────────────────────────────

  trackPaymentError(errorMessage: string, eventId: string): void {
    this.push({
      event: 'payment_error',
      error_message: errorMessage,
      event_id: eventId
    });
  }
}
