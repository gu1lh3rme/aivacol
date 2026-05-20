import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TokenStorageService {
  private readonly tokenKey = 'aivacol_token';
  private readonly refreshKey = 'aivacol_refresh';

  get token() {
    return localStorage.getItem(this.tokenKey) ?? sessionStorage.getItem(this.tokenKey);
  }

  get refreshToken() {
    return localStorage.getItem(this.refreshKey) ?? sessionStorage.getItem(this.refreshKey);
  }

  setTokens(token: string, refreshToken: string, rememberMe = true) {
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem(this.tokenKey, token);
    storage.setItem(this.refreshKey, refreshToken);
  }

  clear() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshKey);
    sessionStorage.removeItem(this.tokenKey);
    sessionStorage.removeItem(this.refreshKey);
  }
}
