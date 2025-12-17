import { Routes } from '@angular/router';
import { EventListComponent } from './components/event-list/event-list.component';
import { CartComponent } from './components/cart/cart.component';
import { MainComponent } from './components/main/main.component';
import { SeatSelectionComponent } from './components/seating/seat-selection/seat-selection.component';
import { ConfirmationComponent } from './components/confirmation/confirmation.component';
import { TicketLookupComponent } from './components/ticket-lookup/ticket-lookup.component';
import { AboutUsComponent } from './components/about-us/about-us.component';
import { ContactUsComponent } from './components/contact-us/contact-us.component';
import { SeatSelectionTheatreComponent } from './components/seating/seat-selection-theatre/seat-selection-theatre.component';
import { SVGSeatmapComponent } from './components/seating/svg-seatmap/svg-seatmap.component';


export const routes: Routes = [
  { path: '', component: MainComponent },
  { path: 'events', component: EventListComponent },
  { path: 'events/:id', loadComponent: () => import('./components/event-details/event-details.component').then(m => m.EventDetailsComponent) },
  {
    path: 'events/:id/seats',
    component: SeatSelectionComponent
  },
  {
    path: 'events/:id/seatstheatre',
    component: SeatSelectionTheatreComponent
  },
  {
    path: 'events/:id/seatmap',
    component : SVGSeatmapComponent
  },  
  {
    path: 'events/:id/mobileseatmap',
    loadComponent: () => 
      import('./components/seating/mobile-section-selector/mobile-section-selector.component').then(
        m => m.MobileSectionSelectorComponent
      ),
    title: 'Select Section'
  },
  {
    path: 'events/:id/section/:sectionId',
    loadComponent: () => 
      import('./components/seating/mobile-seat-selector/mobile-seat-selector.component').then(
        m => m.MobileSeatSelectorComponent
      ),
    title: 'Select Seats'
  },
  { path: 'seat-map/:eventId/:sectionId', loadComponent: () => import('./components/seating/seat-map/seat-map.component').then(m => m.SeatMapComponent) },
  { path: 'cart', component: CartComponent }, // Add this line
  { path: 'checkout', loadComponent: () => import('./components/checkout/checkout.component').then(m => m.CheckoutComponent) },
  {
    path: 'confirmation/:id',
    component: ConfirmationComponent
  },
  {
    path: 'tickets/lookup',
    component: TicketLookupComponent
  },
  { path: 'about', component: AboutUsComponent },
  { path: 'contact', component: ContactUsComponent },

  { path: '**', redirectTo: '' }
];    