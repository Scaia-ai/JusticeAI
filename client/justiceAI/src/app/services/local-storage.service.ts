import { Injectable } from '@angular/core';

@Injectable()
export class LocalStorageService {
  private jwtToken: string = 'jwt-token';
  public token: string;

  constructor() {}

  public getJwtToken(): string {
    return localStorage.getItem(this.jwtToken);
  }

  public setJwtToken(jwtToken: string): void {
    if (!jwtToken) {
      localStorage.removeItem(this.jwtToken);
    } else {
      this.token = jwtToken;
      localStorage.setItem(this.jwtToken, jwtToken);
    }
  }

  public setValue(key: string, value: any): void {
    if (!value) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, JSON.stringify(value));
    }
  }

  public getValue(key: string): any {
    return JSON.parse(localStorage.getItem(key));
  }
}
