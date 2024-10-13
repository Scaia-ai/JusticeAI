import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { User } from '../models/user';
import { AuthenticationService } from '../services/authentication.service';

@Injectable({ providedIn: 'root' })
export class AuthenticationGuard implements CanActivate {
  currentUser: User;
  constructor(
    private routeService: Router,
    private authenticationService: AuthenticationService
  ) {}

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    let url: string = state.url;
    if (!this.authenticationService.isUserAuthenticated()) {
      this.authenticationService.redirectUrl = url;
      this.routeService.navigateByUrl('login');
      return false;
    } else {
      this.currentUser = this.authenticationService.getUser();
        if (!this.currentUser) {
          if (this.authenticationService.isUserAuthenticated()) {
            await this.authenticationService.logout();
          }
          this.routeService.navigateByUrl('login');
          return false;
        }
    }
    return true;
  }
}
