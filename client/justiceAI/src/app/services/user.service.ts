import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { RegistrationUser } from '../models/registration-user';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  apiUrl = environment.baseApiUrl

  constructor(private httpClient: HttpClient) {}

  async register(user: RegistrationUser): Promise<RegistrationUser> {
    const newUser = await firstValueFrom(
      this.httpClient.post<RegistrationUser>(this.apiUrl + '/api/auth/register', user)
    );
    return newUser;
  }

  refreshToken(accessToken: string, refreshToken: string) {
    var tokenModel = {
      AccessToken: accessToken,
      RefreshToken: refreshToken,
    };
    return this.httpClient.post<string>(this.apiUrl +'/api/auth/refreshToken', tokenModel);
  }
}
