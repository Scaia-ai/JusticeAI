import {
  ApplicationConfig,
  importProvidersFrom,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideClientHydration } from '@angular/platform-browser';

import { routes } from './app.routes';
import {
  HTTP_INTERCEPTORS,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { JWT_OPTIONS, JwtHelperService } from '@auth0/angular-jwt';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AuthenticationService } from './services/authentication.service';
import { LocalStorageService } from './services/local-storage.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { jwtInterceptor } from './interceptors/jwt.interceptor';
import { UserService } from './services/user.service';
import { MessageShowService } from './services/message-show.service';
import { FileService } from './services/file.service';

export const appConfig: ApplicationConfig = {
  providers: [
    JwtHelperService,
    MessageService,
    MessageShowService,
    UserService,
    FileService,
    AuthenticationService,
    ConfirmationService,
    LocalStorageService,
    provideHttpClient(withInterceptors([jwtInterceptor])),
    importProvidersFrom(BrowserAnimationsModule),
    { provide: JWT_OPTIONS, useValue: JWT_OPTIONS },
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(),
  ],
};
