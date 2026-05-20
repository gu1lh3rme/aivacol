import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, finalize, map, retry, shareReplay, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse } from '../models/auth.models';
import { TokenStorageService } from './token-storage.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly tokenStorage = inject(TokenStorageService);

  private readonly apiUrl = environment.apiUrl;
  readonly loading = signal(false);
  readonly isAuthenticated = computed(() => Boolean(this.tokenStorage.token));

  login(email: string, password: string, rememberMe = false) {
    this.loading.set(true);
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, { email, password }).pipe(
      retry(1),
      tap((response) => {
        this.tokenStorage.setTokens(response.accessToken, response.refreshToken, rememberMe);
      }),
      finalize(() => this.loading.set(false)),
      shareReplay(1),
    );
  }

  refreshToken(): Observable<string> {
    const refreshToken = this.tokenStorage.refreshToken;
    if (!refreshToken) {
      return throwError(() => new Error('Sem refresh token'));
    }

    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/refresh`, { refreshToken }).pipe(
      tap((response) => {
        this.tokenStorage.setTokens(response.accessToken, response.refreshToken);
      }),
      map((response) => response.accessToken),
      catchError(() => {
        this.logout();
        return throwError(() => new Error('Sessão expirada'));
      }),
    );
  }

  logout() {
    this.tokenStorage.clear();
    void this.router.navigate(['/login']);
  }
}
