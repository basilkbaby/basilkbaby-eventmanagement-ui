import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { ConfigService } from './core/services/config.service';
import { provideNgxStripe } from 'ngx-stripe';
import { environment } from '../environments/environment';


export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes, withInMemoryScrolling({
        scrollPositionRestoration: 'top', // Always scroll to top on navigation
        anchorScrolling: 'enabled', // Enable anchor scrolling
      })), 
    provideHttpClient(),
    provideNgxStripe(environment.stripe.testmode? environment.stripe.testpublishableKey : environment.stripe.publishableKey), // e.g., pk_test_...
    ConfigService,
    
  ]
  
};
