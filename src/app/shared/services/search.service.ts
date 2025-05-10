import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  SearchQuery,
  SearchResults,
  SearchSuggestion,
  RecentSearch,
  SavedSearch
} from '../types/search.interface';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private apiUrl = `${environment.apiUrl}/search`;
  private recentSearchesSubject = new BehaviorSubject<RecentSearch[]>([]);
  recentSearches$ = this.recentSearchesSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadRecentSearches();
  }

  search<T>(query: SearchQuery): Observable<SearchResults<T>> {
    return this.http.post<SearchResults<T>>(`${this.apiUrl}`, query)
      .pipe(
        map(results => {
          this.saveRecentSearch({
            id: Date.now().toString(),
            query: query.keyword,
            filters: query.filters,
            timestamp: new Date(),
            results: results.total
          });
          return results;
        })
      );
  }

  getSearchSuggestions(keyword: string): Observable<SearchSuggestion[]> {
    return this.http.get<SearchSuggestion[]>(`${this.apiUrl}/suggestions`, {
      params: new HttpParams().set('keyword', keyword)
    });
  }

  getSavedSearches(): Observable<SavedSearch[]> {
    return this.http.get<SavedSearch[]>(`${this.apiUrl}/saved`);
  }

  saveSearch(search: Omit<SavedSearch, 'id' | 'createdAt' | 'updatedAt'>): Observable<SavedSearch> {
    return this.http.post<SavedSearch>(`${this.apiUrl}/saved`, search);
  }

  updateSavedSearch(id: string, updates: Partial<SavedSearch>): Observable<SavedSearch> {
    return this.http.patch<SavedSearch>(`${this.apiUrl}/saved/${id}`, updates);
  }

  deleteSavedSearch(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/saved/${id}`);
  }

  private loadRecentSearches() {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      const searches = JSON.parse(saved) as RecentSearch[];
      this.recentSearchesSubject.next(searches);
    }
  }

  private saveRecentSearch(search: RecentSearch) {
    const current = this.recentSearchesSubject.value;
    const updated = [search, ...current].slice(0, 10); // Keep only last 10 searches
    this.recentSearchesSubject.next(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  }

  clearRecentSearches() {
    this.recentSearchesSubject.next([]);
    localStorage.removeItem('recentSearches');
  }

  getPopularSearches(): Observable<{
    keyword: string;
    count: number;
    trend: 'up' | 'down' | 'stable';
  }[]> {
    return this.http.get<any[]>(`${this.apiUrl}/popular`);
  }

  getSearchAnalytics(searchId: string): Observable<{
    totalResults: number;
    averagePrice: number;
    priceRange: { min: number; max: number };
    popularFilters: { filter: string; count: number }[];
    resultsByCategory: { category: string; count: number }[];
  }> {
    return this.http.get<any>(`${this.apiUrl}/analytics/${searchId}`);
  }
}
