import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface User {
  id: string;
  phone: string;
  role: 'owner' | 'visitor' | 'admin';
}

export interface JwtResponse {
  accessToken: string;
  refreshToken: string;
  userId: string;
  role: 'owner' | 'visitor' | 'admin';
  phone: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/auth';

  // Signals for state
  readonly currentUser = signal<User | null>(this.loadUserFromStorage());
  readonly isAuthenticated = computed(() => this.currentUser() !== null);
  readonly userRole = computed(() => this.currentUser()?.role || null);

  signup(signupData: { phone: string; email?: string; role: string; fullName: string; consent: boolean }): Observable<any> {
    return this.http.post(`${this.apiUrl}/signup`, signupData);
  }

  sendOtp(phone: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/otp/send`, { phone });
  }

  verifyOtp(phone: string, code: string): Observable<JwtResponse> {
    return this.http.post<JwtResponse>(`${this.apiUrl}/otp/verify`, { phone, code }).pipe(
      tap(res => {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('access_token', res.accessToken);
          localStorage.setItem('refresh_token', res.refreshToken);
        }
        const user: User = { id: res.userId, phone: res.phone, role: res.role };
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(user));
        }
        this.currentUser.set(user);
      })
    );
  }

  logout(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    }
    this.currentUser.set(null);
  }

  private loadUserFromStorage(): User | null {
    if (typeof localStorage === 'undefined') {
      return null;
    }
    const userJson = localStorage.getItem('user');
    if (userJson) {
      try {
        return JSON.parse(userJson);
      } catch {
        return null;
      }
    }
    return null;
  }
}
