import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { firstValueFrom } from 'rxjs';
import { User } from '../models/user';
import { UserLoginResponse } from '../models/user-login-response';
import { LocalStorageService } from './local-storage.service';
import { Router } from '@angular/router';
import { UserLoginRequest } from '../models/user-login-request';
import { environment } from '../../environments/environment';

@Injectable()
export class AuthenticationService {
  redirectUrl: string;
  apiUrl = environment.baseApiUrl

  constructor(
    private httpClient: HttpClient,
    private localStorageService: LocalStorageService,
    private jwtHelperService: JwtHelperService,
    private router: Router
  ) {}

  public async login(request: UserLoginRequest): Promise<boolean> {
    const response = await firstValueFrom(
      this.httpClient.post<UserLoginResponse>(this.apiUrl + '/api/auth/login', request)
    );
    this.UpdateLocalStorage(response.token);
    if (this.redirectUrl) {
      this.router.navigateByUrl(this.redirectUrl);
      this.redirectUrl = null;
      return false;
    }
    return true;
  }

  public async logout(): Promise<void> {
    if (!this.isUserAuthenticated()) {
      return;
    }
    this.localStorageService.setJwtToken(null);
  }

  public isUserAuthenticated(): boolean {
    return !!this.localStorageService.getJwtToken();
  }

  public isSystemAdmin(): boolean {
    const jwtToken = this.localStorageService.getJwtToken();
    if (!jwtToken) {
      return null;
    }
    const decoded = this.jwtHelperService.decodeToken(jwtToken);
    return decoded.role == 0;
  }

  public getRefreshToken(): string {
    const jwtToken = this.localStorageService.getJwtToken();
    if (!jwtToken) {
      return null;
    }
    const decoded = this.jwtHelperService.decodeToken(jwtToken);
    return decoded.refreshToken;
  }

  public getUser(): User {
    const jwtToken = this.localStorageService.getJwtToken();
    if (!jwtToken) {
      return null;
    }

    const decoded = this.jwtHelperService.decodeToken(jwtToken);
    const user = new User();
    user._id = decoded.id;
    user.email = decoded.email;
    user.userName = decoded.user;
    user.role = parseInt(decoded.role);
    user.fullName = decoded.fullName;
   
    return user;
  }

  private UpdateLocalStorage(jwtToken: string): void {
    if (jwtToken) {
      this.localStorageService.setJwtToken(jwtToken);
    }
  }
}
