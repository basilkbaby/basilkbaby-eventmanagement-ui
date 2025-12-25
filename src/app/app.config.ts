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
    provideNgxStripe('pk_live_51Sd8PIF1Dtz3Qz6bNcA2zmuFlkxPCYoxN5VG3crZpmv6zSIFddHtW0ybqmJVCUuWjexz9EETvOcJySaeOvwGwYrW00oLkYHolM'), // e.g., pk_test_...
    ConfigService,
    
  ]
  
};
