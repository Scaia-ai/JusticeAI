import { inject } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import {
  BehaviorSubject,
  Observable,
  catchError,
  filter,
  switchMap,
  take,
  throwError,
} from 'rxjs';
import { AuthenticationService } from '../services/authentication.service';
import { LocalStorageService } from '../services/local-storage.service';
import { UserService } from '../services/user.service';
import { Router } from '@angular/router';
import { MessageShowService } from '../services/message-show.service';

const isRefreshingSubject = new BehaviorSubject<boolean>(false);
const refreshTokenSubject = new BehaviorSubject<any>(null);

export const jwtInterceptor: HttpInterceptorFn = (
  request: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<any>> => {
  const localStorageService = inject(LocalStorageService);
  const userService = inject(UserService);
  const routeService = inject(Router);
  const messageService = inject(MessageShowService);
  const authenticationService = inject(AuthenticationService);

  // Clone and add Authorization header if user is authenticated
  if (authenticationService.isUserAuthenticated()) {
    if (
      !request.headers.get('x-ms-blob-type') &&
      !request.urlWithParams.includes('comp=blocklist')
    ) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${localStorageService.getJwtToken()}`,
        },
      });
    }
  }

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      if (
        error.status === 401 &&
        !request.url.includes('/api/users/login') &&
        !request.urlWithParams.includes('X-Amz-Credential')
      ) {
        return handle401Error(
          request,
          next,
          localStorageService,
          userService,
          routeService,
          messageService,
          authenticationService
        );
      }

      return throwError(() => error);
    })
  );
};

const handle401Error = (
  request: HttpRequest<any>,
  next: HttpHandlerFn,
  localStorageService: LocalStorageService,
  userService: UserService,
  routeService: Router,
  messageService: MessageShowService,
  authenticationService: AuthenticationService
): Observable<HttpEvent<any>> => {
  if (!isRefreshingSubject.value) {
    isRefreshingSubject.next(true);
    refreshTokenSubject.next(null);

    if (authenticationService.isUserAuthenticated()) {
      const accessToken = localStorageService.getJwtToken();
      const refreshToken = authenticationService.getRefreshToken();

      return userService.refreshToken(accessToken, refreshToken).pipe(
        switchMap((token: string) => {
          isRefreshingSubject.next(false);
          localStorageService.setJwtToken(token['token']);
          refreshTokenSubject.next(token['token']);
          return next(updateHeader(request, token['token']));
        }),
        catchError((error) => {
          isRefreshingSubject.next(false);
          localStorageService.setJwtToken(null);
          messageService.showInfo(
            'Your session has expired. Please log in again.'
          );
          routeService.navigateByUrl('login');
          return throwError(() => error);
        })
      );
    }
  } else {
    return refreshTokenSubject.pipe(
      filter((token) => token !== null),
      take(1),
      switchMap((token) => next(updateHeader(request, token)))
    );
  }
  return throwError(() => new Error('Unable to handle 401 error.'));
};

const updateHeader = (
  request: HttpRequest<any>,
  accessToken: string
): HttpRequest<any> => {
  return request.clone({
    setHeaders: { Authorization: `Bearer ${accessToken}` },
  });
};
