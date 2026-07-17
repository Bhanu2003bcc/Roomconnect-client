import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TourRequest {
  listingId: string;
  requestedTime: string;
  notes?: string;
}

export interface TourResponse {
  id: string;
  listingId: string;
  visitorId: string;
  ownerId: string;
  requestedTime: string;
  status: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  listingTitle?: string;
  listingAddress?: string;
  listingRent?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToursService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/tours';

  requestTour(tour: TourRequest): Observable<TourResponse> {
    return this.http.post<TourResponse>(this.apiUrl, tour);
  }

  getVisitorTours(): Observable<TourResponse[]> {
    return this.http.get<TourResponse[]>(`${this.apiUrl}/visitor`);
  }

  getOwnerTours(): Observable<TourResponse[]> {
    return this.http.get<TourResponse[]>(`${this.apiUrl}/owner`);
  }

  updateTourStatus(tourId: string, status: string): Observable<TourResponse> {
    return this.http.patch<TourResponse>(`${this.apiUrl}/${tourId}/status`, null, {
      params: { status }
    });
  }
}
