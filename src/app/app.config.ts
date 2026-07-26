import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { LoggedInGuard } from '../services/logged-in-guard';
import { GuestGuard } from '../services/guest-guard';
import { authenticationInterceptor } from './interceptor/authentication.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authenticationInterceptor])),
    LoggedInGuard,
    GuestGuard
  ]
};


