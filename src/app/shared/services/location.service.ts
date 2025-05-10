// location.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private cloudFunctionUrl = environment.cloudFunctionUrl; // Your cloud function URL

  constructor(private http: HttpClient) {}

  findPlace(input: string): Observable<any> {
    return this.http.get(`${this.cloudFunctionUrl}/findPlace`, {
      params: { input }
    });
  }
}
