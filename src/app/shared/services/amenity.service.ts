import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Define interfaces (optional) to type the response.
export interface GooglePlace {
  id: string;
  name: string;
  location: { lat: number; lng: number; };
  address: string;
  rating?: number;
  userRatingsTotal?: number;
  types?: string[];
  openNow?: boolean;
  photos?: Array<{ reference: string; width: number; height: number; }>;
}

export interface NearbySearchResponse {
  status: string;
  results: GooglePlace[];
  pagination: {
    nextPageToken: string | null;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AmenityService {
  
  private readonly baseUrl = 'https://nearbysearch-4dslxkklta-uc.a.run.app';

  constructor(private http: HttpClient) {}

  // Calls the cloud function with the given parameters.
  fetchNearestAmenity(lat: number, lng: number, amenityType: string): Observable<NearbySearchResponse> {
    const url = `${this.baseUrl}?lat=${lat}&lng=${lng}&amenityType=${amenityType}`;
    return this.http.get<NearbySearchResponse>(url);
  }
}
