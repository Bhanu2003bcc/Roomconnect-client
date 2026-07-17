import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SearchFilters {
  lat: number;
  lng: number;
  radiusKm?: number;
  category?: string;
  genderPreference?: string;
  minRent?: number;
  maxRent?: number;
  wifi?: boolean;
  parking?: boolean;
  laundry?: boolean;
  foodIncluded?: boolean;
  ac?: string;
  bathroomType?: string;
  page?: number;
  size?: number;
}

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/search';

  search(filters: SearchFilters): Observable<any> {
    const params: any = {};
    Object.keys(filters).forEach(key => {
      const val = (filters as any)[key];
      if (val !== undefined && val !== null && val !== '') {
        params[key] = val.toString();
      }
    });

    return this.http.get<any>(this.apiUrl, { params });
  }
}
