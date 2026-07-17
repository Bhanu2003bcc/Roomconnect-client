import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SearchFilters } from './search.service';

@Injectable({
  providedIn: 'root'
})
export class AlertsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/alerts';

  saveSearch(filters: SearchFilters): Observable<any> {
    return this.http.post<any>(this.apiUrl, filters);
  }

  getSavedSearches(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  deleteSearch(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
