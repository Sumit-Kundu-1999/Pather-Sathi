import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Store } from '@ngrx/store';
import { authActions, AuthState } from '@pather-sathi/auth-store';
import { BACKEND_URL_PREFIX } from '@pather-sathi/config';

interface AuthResponse {
  token?: string;
  user?: string;
  msg?: string
}

@Injectable({
  providedIn: "root"
})

export class AuthService {
  private apiUrl = `${BACKEND_URL_PREFIX}/auth`;
  http = inject(HttpClient)
  private loggedSubject = new BehaviorSubject<boolean>(false);
  isLoggedIn$ = this.loggedSubject.asObservable();

  constructor(private store: Store<AuthState>) { }

  login(credentials: any, requestName = 'login'): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/${requestName}`, credentials).pipe(
      tap(res => {
        if (res.token) {
          localStorage.setItem('auth_token', res.token);
          localStorage.setItem('UserName', res.user ?? '')
          this.store.dispatch(authActions.loginSuccess({ token: res.token }));
          this.loggedSubject.next(true)
        };
      }),

    )
  }

  logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('UserName');
    this.store.dispatch(authActions.logout());
    this.loggedSubject.next(false);
  }

  logoutDueToInvalidToken(errMsg: string) {
    if (errMsg === 'Invalid or Expired Token') {
      this.logout();
      this.store.dispatch(authActions.logout());
    }
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('auth_token');
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  getLoggedInStatus(): boolean {
    return this.loggedSubject.getValue()
  }

  getUserName(): string | null {
    return localStorage.getItem('UserName');
  }
}