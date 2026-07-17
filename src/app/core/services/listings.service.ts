import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, switchMap } from 'rxjs';

export interface Listing {
  id?: string;
  ownerId?: string;
  cityId?: number;
  category: string;
  title: string;
  description?: string;
  rentAmount: number;
  depositAmount?: number;
  bathroomType?: string;
  furnishing?: string;
  genderPreference: string;
  foodIncluded: boolean;
  foodType?: string;
  curfewTime?: string;
  ac?: string;
  wifi: boolean;
  parking: boolean;
  laundry: boolean;
  addressText: string;
  latitude: number;
  longitude: number;
  status?: string;
  availableFromDate?: string;
  createdAt?: string;
  updatedAt?: string;
  media?: any[];
}

@Injectable({
  providedIn: 'root'
})
export class ListingsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/listings';

  getListing(id: string): Observable<Listing> {
    return this.http.get<Listing>(`${this.apiUrl}/${id}`);
  }

  createListing(listing: Listing): Observable<Listing> {
    return this.http.post<Listing>(this.apiUrl, listing);
  }

  updateListing(id: string, listing: Listing): Observable<Listing> {
    return this.http.put<Listing>(`${this.apiUrl}/${id}`, listing);
  }

  updateStatus(id: string, status: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/status`, null, { params: { status } });
  }

  deleteListing(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getMyListings(page = 0, size = 20): Observable<any> {
    return this.http.get(`${this.apiUrl}/my`, { params: { page, size } });
  }

  /**
   * Complete image upload pipeline to MinIO/R2:
   * 1. Request presigned URL
   * 2. Direct binary PUT upload to S3/MinIO
   * 3. Confirm upload on backend
   */
  uploadListingImage(listingId: string, file: File): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${listingId}/media/presign`, null, {
      params: { mimeType: file.type, sizeBytes: file.size }
    }).pipe(
      switchMap(res => {
        const uploadUrl = res.uploadUrl;
        const mediaId = res.mediaId;

        // Custom headers for direct S3 upload
        const headers = new HttpHeaders({
          'Content-Type': file.type
        });

        return this.http.put(uploadUrl, file, { headers }).pipe(
          switchMap(() => this.confirmImageUpload(listingId, mediaId))
        );
      })
    );
  }

  private confirmImageUpload(listingId: string, mediaId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${listingId}/media/${mediaId}/confirm`, null);
  }

  deleteListingImage(listingId: string, mediaId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${listingId}/media/${mediaId}`);
  }
}
