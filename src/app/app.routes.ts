import { Routes } from '@angular/router';
import { CartComponent } from './components/cart/cart.component';
import { ConfirmationComponent } from './components/confirmation/confirmation.component';
import { TicketLookupComponent } from './components/ticket-lookup/ticket-lookup.component';
import { AboutUsComponent } from './components/pages/about-us/about-us.component';
import { ContactUsComponent } from './components/pages/contact-us/contact-us.component';
import { SVGSeatmapComponent } from './components/seating/svg-seatmap/svg-seatmap.component';


export const routes: Routes = [
  { 
    path: '', 
    loadComponent: () => import('./components/main/main.component').then(m => m.MainComponent),  
    title: 'Home' 
  },
  { 
    path: 'events', 
    loadComponent: () => import('./components/main/main.component').then(m => m.MainComponent),  
    title: 'Event List' 
  },
  { 
    path: 'events/:id', 
    loadComponent: () => import('./components/event-details/event-details.component').then(m => m.EventDetailsComponent),  
    title: 'Event Detail'  
  }, 
  {
    path: 'events/:id/seatmap',
    loadComponent: () => import('./components/seating/svg-seatmap/svg-seatmap.component').then(m => m.SVGSeatmapComponent),  
    title : 'Seat Selection'
  },    
  {
    path: 'events/:id/mobileseatmap',
    loadComponent: () => import('./components/seating/mobile-section-selector/mobile-section-selector.component').then(
        m => m.MobileSectionSelectorComponent),
    title: 'Select Sections'
  },
  {
    path: 'events/:id/section/:sectionId',
    loadComponent: () => import('./components/seating/mobile-seat-selector/mobile-seat-selector.component').then(
        m => m.MobileSeatSelectorComponent),
    title: 'Select Selection'
  },
  { 
    path: 'cart', 
    loadComponent: () => import('./components/cart/cart.component').then(m => m.CartComponent),
    title : 'Cart'
  }, 
  { path: 'checkout', 
    loadComponent: () => import('./components/checkout/checkout.component').then(m => m.CheckoutComponent),
    title : 'Checkout'
  },
  {
    path: 'confirmation/:id',
    loadComponent: () => import('./components/confirmation/confirmation.component').then(m => m.ConfirmationComponent),
    title : 'Confirmation'
  },
  {
    path: 'tickets/lookup',
    loadComponent: () => import('./components/ticket-lookup/ticket-lookup.component').then(m => m.TicketLookupComponent),
    title : 'Ticket Lookup'
  },
  { 
    path: 'about', 
    loadComponent: () => import('./components/pages/about-us/about-us.component').then(m => m.AboutUsComponent),
  },
  { 
    path: 'contact', 
    loadComponent: () => import('./components/pages/contact-us/contact-us.component').then(m => m.ContactUsComponent),
  },
  { 
    path: '**', 
    redirectTo: ''
  }

  //this is the component where seat sections are like block by block with html
  // {
  //   path: 'events/:id/seats',
  //   component: SeatmapBlockComponent
  // },
  //This is with sections layout with steps. it will section first then move to seats. sections made with html
  // {
  //   path: 'events/:id/seatstheatre',
  //   component: SeatSelectionTheatreComponent
  // },
  //Seat map section component, where it can go from all sections to one section. this component handles that one section with seats
  // { 
  //   path: 'seat-map/:eventId/:sectionId', 
  //   loadComponent: () => import('./components/seating/seatmap-section/seatmap-section.component').then(m => m.SeatMapSectionComponent) 
  // },
];    