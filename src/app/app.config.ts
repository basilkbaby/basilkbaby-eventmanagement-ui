import { APP_INITIALIZER, ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideNgxStripe } from 'ngx-stripe';
import { environment } from '../environments/environment';

import { routes } from './app.routes';
import { ConfigService } from './core/services/config.service';

function initConfig(configService: ConfigService): () => Promise<void> {
  return () => configService.loadConfig();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withInMemoryScrolling({
      scrollPositionRestoration: 'top',
      anchorScrolling: 'enabled',
    })),
    provideHttpClient(),
    ConfigService,
    {
      provide:    APP_INITIALIZER,
      useFactory: initConfig,
      deps:       [ConfigService],
      multi:      true
    }
  ]
};