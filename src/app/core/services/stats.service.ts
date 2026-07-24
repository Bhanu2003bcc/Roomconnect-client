import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PlatformStats {
  roomsListed: number;
  verifiedOwners: number;
  happyTenants: number;
  avgDaysToMove: number;
}

@Injectable({
  providedIn: 'root'
})
export class StatsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/stats';

  getStats(): Observable<PlatformStats> {
    return this.http.get<PlatformStats>(this.apiUrl);
  }
}
