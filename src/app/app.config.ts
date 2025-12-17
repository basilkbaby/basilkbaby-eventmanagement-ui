import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { ConfigService } from './core/services/config.service';
import { provideNgxStripe } from 'ngx-stripe';


export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes, withInMemoryScrolling({
        scrollPositionRestoration: 'top', // Always scroll to top on navigation
        anchorScrolling: 'enabled', // Enable anchor scrolling
      })), 
    provideHttpClient(),
    provideNgxStripe('pk_test_51SMxCVKClB5pCEwzfo7VTduHojAbIKDuFiLI8UT10766EJ7Zy7ksEVJvOCG9EiNLxjbsD6wSKUol5sSBL9t7aofU00BRnvQkWT'), // e.g., pk_test_...
    ConfigService,
    
  ]
  
};
