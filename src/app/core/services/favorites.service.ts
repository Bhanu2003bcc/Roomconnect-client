import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/favorites';

  toggleFavorite(listingId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${listingId}`, null);
  }

  getFavorites(page = 0, size = 20): Observable<any> {
    return this.http.get<any>(this.apiUrl, { params: { page, size } });
  }

  getFavoriteStatus(listingId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${listingId}/status`);
  }
}
