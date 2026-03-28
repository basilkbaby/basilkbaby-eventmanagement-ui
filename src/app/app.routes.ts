import { Routes } from '@angular/router';
import { environment } from '../environments/environment';

const isMain = environment.companyId === 'main';

// ── Bespoke routes ─────────────────────────────────────────────────────────────
const bespokeRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/event-landing/event-landing.component')
      .then(m => m.EventLandingComponent),
    title: 'Home'
  },
  {
    path: 'events',
    loadComponent: () => import('./components/main/main.component')
      .then(m => m.MainComponent),
    title: 'Event List'
  },
  {
    path: 'events/:id',
    loadComponent: () => import('./components/event-details/event-details.component')
      .then(m => m.EventDetailsComponent),
    title: 'Event Detail'
  },
  {
    path: 'events/:id/seatmap',
    loadComponent: () => import('./components/seating/svg-seatmap/svg-seatmap.component')
      .then(m => m.SVGSeatmapComponent),
    title: 'Seat Selection'
  },
  {
    path: 'events/:id/mobileseatmap',
    loadComponent: () => import('./components/seating/mobile-section-selector/mobile-section-selector.component')
      .then(m => m.MobileSectionSelectorComponent),
    title: 'Select Sections'
  },
  {
    path: 'events/:id/section/:sectionId',
    loadComponent: () => import('./components/seating/mobile-seat-selector/mobile-svg-seat-selector/mobile-svg-seat-selector.component')
      .then(m => m.MobileSvgSeatSelectorComponent),
    title: 'Select Seat'
  },
  {
    path: 'events/generaladmission/:id/:sectionId',
    loadComponent: () => import('./components/seating/general-admission/general-admission.component')
      .then(m => m.GeneralAdmissionComponent),
    title: 'General Admission'
  },
  {
    path: 'cart',
    loadComponent: () => import('./components/cart/cart.component')
      .then(m => m.CartComponent),
    title: 'Cart'
  },
  {
    path: 'checkout',
    loadComponent: () => import('./components/checkout/checkout.component')
      .then(m => m.CheckoutComponent),
    title: 'Checkout'
  },
  {
    path: 'confirmation/:id',
    loadComponent: () => import('./components/confirmation/confirmation.component')
      .then(m => m.ConfirmationComponent),
    title: 'Confirmation'
  },
  {
    path: 'tickets/lookup',
    loadComponent: () => import('./components/ticket-lookup/ticket-lookup.component')
      .then(m => m.TicketLookupComponent),
    title: 'Ticket Lookup'
  },
  {
    path: 'about',
    loadComponent: () => import('./components/pages/about-us/about-us.component')
      .then(m => m.AboutUsComponent)
  },
  {
    path: 'contact',
    loadComponent: () => import('./components/pages/contact-us/contact-us.component')
      .then(m => m.ContactUsComponent)
  },
  {
    path: 'privacy-policy',
    loadComponent: () => import('./components/event-landing/privacy-policy/privacy-policy.component')
      .then(m => m.PrivacyPolicyComponent)
  },
  { path: '**', redirectTo: '' }
];

// ── Main site routes (crowdpass.co.uk) ────────────────────────────────────────
// Both '' and 'events' use MainComponent — it detects which via routeConfig.path
const mainRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/main/main.component')
      .then(m => m.MainComponent),
    title: 'CrowdPass — Event Ticketing'
  },
  {
    path: 'events',
    loadComponent: () => import('./components/main/main.component')
      .then(m => m.MainComponent),
    title: 'Events'
  },
  {
    path: 'events/:id',
    loadComponent: () => import('./components/event-details/event-details.component')
      .then(m => m.EventDetailsComponent),
    title: 'Event'
  },
  {
    path: 'confirmation/:id',
    loadComponent: () => import('./components/confirmation/confirmation.component')
      .then(m => m.ConfirmationComponent),
    title: 'Confirmation'
  },
  {
    path: 'tickets/lookup',
    loadComponent: () => import('./components/ticket-lookup/ticket-lookup.component')
      .then(m => m.TicketLookupComponent),
    title: 'Ticket Lookup'
  },
  {
    path: 'about',
    loadComponent: () => import('./components/pages/about-us/about-us.component')
      .then(m => m.AboutUsComponent)
  },
  {
    path: 'contact',
    loadComponent: () => import('./components/pages/contact-us/contact-us.component')
      .then(m => m.ContactUsComponent)
  },
  {
    path: 'terms',
    loadComponent: () => import('./components/pages/terms/terms.component')
      .then(m => m.TermsComponent)
  },
  {
    path: 'privacy-policy',
    loadComponent: () => import('./components/event-landing/privacy-policy/privacy-policy.component')
      .then(m => m.PrivacyPolicyComponent)
  },
  { path: '**', redirectTo: '' }
];

export const routes: Routes = isMain ? mainRoutes : bespokeRoutes;