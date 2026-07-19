import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/admin';

  getMetrics(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/metrics`);
  }

  suspendUser(userId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/users/${userId}/suspend`, null);
  }

  unsuspendUser(userId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/users/${userId}/unsuspend`, null);
  }

  suspendListing(listingId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/listings/${listingId}/suspend`, null);
  }

  deleteListing(listingId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/listings/${listingId}`);
  }

  getAuditLogs(page = 0, size = 20): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/audit-logs`, { params: { page, size } });
  }

  getUsers(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/users`);
  }

  createUser(user: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/users`, user);
  }

  deleteUser(userId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/users/${userId}`);
  }

  getAllListings(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/listings`);
  }
}
