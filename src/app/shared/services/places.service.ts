// src/app/services/places.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PlacesService {
  private readonly functionUrl = environment.firebase.functionsUrl + '/nearbySearch';

  constructor(private http: HttpClient) {}

  getNearbyPlaces(
    lat: number,
    lng: number,
    amenityType: string,
    pageToken?: string
  ): Observable<any> {
    const params = {
      lat,
      lng,
      amenityType,
      ...(pageToken && { pageToken })
    };

    return this.http.get(this.functionUrl, { params });
  }
}
