import { Component, OnInit, OnDestroy, ChangeDetectorRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Firestore, collection, query, where, collectionData, GeoPoint } from '@angular/fire/firestore';
import { LocationService } from '../../shared/services/location.service';
import { Subscription, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, map } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
import { PropertyService } from '../../shared/services/property.service'; 
import { animate, style, transition, trigger } from '@angular/animations';
import { BehaviorSubject, combineLatest, of } from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';
import { Functions, httpsCallable } from '@angular/fire/functions'; 
import { PhoneService } from '../../shared/services/phone.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { PhoneDialogComponent } from '../../shared/services/phone-dialog.component';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';

interface SearchNotificationData {
  searcherPhone: string;
  searchQuery: any;
  propertyIds: string[];
}

interface SearchNotificationResult {
  success: boolean;
  successCount: number;
  failureCount: number;
}

interface SearchParams {
  location?: string;
  category?: string;
  subCategory?: string;  
  detail?: string; 
  price?: number;
  latitude?: number;
  longitude?: number;
  fullyServicedPurchase?: boolean;
  amenities?: string[];
  sortBy?: string;
  [key: string]: any;
}

interface SearchResult {
  id: string;
  title: string;
  category: string;
  subCategory: string;
  location: string;
  price: number;
  propertySize: number;
  bedrooms?: number;
  bathrooms?: number;
  images: string[];
  description: string;
  approved: boolean;
  sold: boolean;
  fullyServicedPurchase: boolean;
  geoPoint: GeoPoint;
  isFavorite?: boolean;
  amenities?: {
    [key: string]: boolean;
  };
  createdAt?: any;
}

interface LocationResponse {
  candidates: LocationCandidate[];
  status: string;
}

interface LocationCandidate {
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
}



@Component({
  selector: 'app-search-results',
  standalone: true,
  imports: [CommonModule, FormsModule,    MatDialogModule, PhoneDialogComponent,HeaderComponent,FooterComponent],
  templateUrl: './search-results.component.html',
  styleUrls: [ './search-results.component.scss'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('0.4s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('0.3s ease-in', style({ opacity: 0, transform: 'translateY(20px)' }))
      ])
    ])
  ]
})
export class SearchResultsComponent implements OnInit, OnDestroy {
  searchResults: SearchResult[] = [];
  searchParams: SearchParams = {};
  isLoading = true;
  error: string | null = null;
  private searchSubscription?: Subscription;
  private locationSearch$ = new Subject<string>();
  private destroy$ = new Subject<void>();
  private searchParams$ = new BehaviorSubject<SearchParams>({});
  isMobile: boolean = false;
  
  // Search parameters
  categories = ['Commercial', 'Residential', 'Airbnb & Short-Term Rentals', 'Land'];
  searchRadius = 5;
  currentLocation: { lat: number; lng: number } | null = null;
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 12;
  totalPages = 1;

  // Filters
  priceRange = {
    min: 0,
    max: 1000000,
    current: 1000000
  };
  selectedAmenities: string[] = [];
  selectedCategories: string[] = [];
  sortOption = 'price-asc';

    // UI State
    isMobileFiltersVisible = false;
    activeFiltersCount = 0;
    viewMode: 'grid' | 'list' = 'grid';
    isSearchFocused = false;
    
    // Enhanced Amenities
    availableAmenities = [
      { id: 'parking', label: 'Parking', icon: 'fa-parking' },
      { id: 'pool', label: 'Swimming Pool', icon: 'fa-swimming-pool' },
      { id: 'gym', label: 'Gym', icon: 'fa-dumbbell' },
      { id: 'security', label: 'Security', icon: 'fa-shield-alt' },
      { id: 'wifi', label: 'WiFi', icon: 'fa-wifi' },
      { id: 'furnished', label: 'Furnished', icon: 'fa-couch' }
    ];


  constructor(
    private router: Router,
    private propertyService: PropertyService,
    private route: ActivatedRoute,
    private firestore: Firestore,
    private locationService: LocationService,
    private cdr: ChangeDetectorRef,
    private phoneService: PhoneService,      
    private functions: Functions,
    private dialog: MatDialog    
  ) {
    this.initializeSearchHandlers();
    this.checkIfMobile();
  }

  private checkIfMobile(): void {
    this.isMobile = window.innerWidth <= 1024;
  }

  @HostListener('window:resize')
  onResize() {
    this.checkIfMobile();
    this.cdr.detectChanges();
  }
  
  private initializeSearchHandlers() {
    // Location Search with Enhanced Error Handling
    this.locationSearch$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((location: string) => {
        this.isLoading = true;
        return this.locationService.findPlace(location).pipe(
          map(response => ({ response, error: null })),
          catchError(error => of({ response: null, error }))
        );
      }),
      takeUntil(this.destroy$)
    ).subscribe({
      next: ({ response, error }) => {
        if (error) {
          this.handleSearchError('Location search failed', error);
          return;
        }

        if (response?.candidates?.[0]) {
          const locationData = response.candidates[0].geometry.location;
          this.updateLocation(locationData);
        }
      }
    });

    // Combined Search Parameters Handler
    combineLatest([
      this.searchParams$,
      this.route.queryParams
    ]).pipe(
      takeUntil(this.destroy$)
    ).subscribe(([currentParams, queryParams]) => {
      this.updateSearchParams(queryParams);
    });
  }

  private async unifiedSearch(params?: { latitude?: number; longitude?: number }) {
    this.isLoading = true;
    this.error = null;
  
    try {
      // Phone number check
      if (!this.phoneService.hasPhoneNumber()) {
        const dialogRef = this.dialog.open(PhoneDialogComponent, {
          width: '400px',
          disableClose: true
        });
  
        const phoneNumber = await dialogRef.afterClosed().toPromise();
        if (!phoneNumber) {
          this.isLoading = false;
          return;
        }
        this.phoneService.savePhoneNumber(phoneNumber);
      }
  
      const listingsCollection = collection(this.firestore, 'listings');
      let constraints: any[] = [
        where('approved', '==', true),
        where('sold', '==', false)
      ];
  
      // Add search constraints
      if (this.searchParams.category) {
        constraints.push(where('category', '==', this.searchParams.category));
      }
      if (this.searchParams.subCategory) {
        constraints.push(where('subCategory', '==', this.searchParams.subCategory));
      }
      if (this.searchParams.detail) {
        constraints.push(where('detail', '==', this.searchParams.detail));
      }
      if (this.priceRange.current < this.priceRange.max) {
        constraints.push(where('price', '<=', this.priceRange.current));
      }
  
      const baseQuery = query(listingsCollection, ...constraints);
  
      this.searchSubscription = collectionData(baseQuery, { idField: 'id' }).pipe(
        map(listings => {
          let filteredListings = listings as SearchResult[];
  
          // Apply location filtering if coordinates provided
          if (params?.latitude && params?.longitude) {
            filteredListings = filteredListings.filter(listing => {
              if (listing.geoPoint) {
                const distance = this.calculateDistance(
                  params.latitude!,
                  params.longitude!,
                  listing.geoPoint.latitude,
                  listing.geoPoint.longitude
                );
                return distance <= this.searchRadius;
              }
              return false;
            });
          }
  
          // Apply amenities filter
          if (this.selectedAmenities.length > 0) {
            filteredListings = filteredListings.filter(listing => 
              this.selectedAmenities.every(amenity => 
                listing.amenities && listing.amenities[amenity]
              )
            );
          }
  
          // Apply sorting
          return this.applySorting(filteredListings);
        })
      ).subscribe({
        next: async (results) => {
          this.searchResults = results;
          this.totalPages = Math.ceil(results.length / this.itemsPerPage);
          this.isLoading = false;
  
          // Send notifications for all search results
          if (results.length > 0) {
            try {
              const phone = this.phoneService.getPhoneNumber();
              if (phone) {
                await this.callSendSearchNotifications(results);
              }
            } catch (error) {
              console.error('Error sending search notifications:', error);
            }
          }
        },
        error: (error) => {
          this.handleError(error);
        }
      });
  
    } catch (error) {
      this.handleError(error);
    }
  }
  
  // Helper method for sorting
  private applySorting(listings: SearchResult[]): SearchResult[] {
    return listings.sort((a, b) => {
      switch (this.sortOption) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'newest':
          return (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0);
        case 'distance':
          if (this.currentLocation) {
            const distanceA = this.calculateDistance(
              this.currentLocation.lat,
              this.currentLocation.lng,
              a.geoPoint.latitude,
              a.geoPoint.longitude
            );
            const distanceB = this.calculateDistance(
              this.currentLocation.lat,
              this.currentLocation.lng,
              b.geoPoint.latitude,
              b.geoPoint.longitude
            );
            return distanceA - distanceB;
          }
          return 0;
        default:
          return 0;
      }
    });
  }
  

  private updateLocation(locationData: { lat: number; lng: number }) {
    this.currentLocation = { 
      lat: locationData.lat, 
      lng: locationData.lng 
    };
    
    this.searchByLocation(locationData.lat, locationData.lng);
    this.updateQueryParams({ latitude: locationData.lat, longitude: locationData.lng });
  }

  private updateSearchParams(params: any) {
    this.searchParams = {
      location: params['location'],
      category: params['category'],
      subCategory: params['subCategory'],  
      detail: params['detail'],            
      price: params['price'] ? Number(params['price']) : undefined,
      latitude: params['latitude'] ? Number(params['latitude']) : undefined,
      longitude: params['longitude'] ? Number(params['longitude']) : undefined,
      fullyServicedPurchase: params['fullyServicedPurchase'] === 'true',
      amenities: params['amenities']?.split(',') || []
    };
  
    // Update selected categories if category is provided
    if (params['category']) {
      this.selectedCategories = [params['category']];
    }
  
    this.initializeSearch();
  }
  

  private initializeSearch() {
    if (this.searchParams.location) {
      this.locationSearch$.next(this.searchParams.location);
    } else if (this.searchParams.latitude && this.searchParams.longitude) {
      this.searchByLocation(this.searchParams.latitude, this.searchParams.longitude);
    } else {
      this.performSearch();
    }
  }

  // Enhanced Error Handling
  private handleSearchError(message: string, error: any) {
    console.error(`${message}:`, error);
    this.error = message;
    this.isLoading = false;
    this.cdr.detectChanges();
  }

  // Enhanced Filter Management
  toggleFilter(type: string, value: string) {
    switch (type) {
      case 'amenity':
        this.toggleAmenity(value);
        break;
      case 'category':
        this.toggleCategory(value);
        break;
      default:
        break;
    }
    
    this.updateActiveFiltersCount();
    this.updateQueryParams();
  }

  private updateActiveFiltersCount() {
    this.activeFiltersCount = 
      this.selectedCategories.length +
      this.selectedAmenities.length +
      (this.priceRange.current < this.priceRange.max ? 1 : 0) +
      (this.searchRadius !== 5 ? 1 : 0);
  }

  // URL Management
  private updateQueryParams(params: Partial<SearchParams> = {}) {
    const queryParams = {
      ...this.searchParams,
      ...params,
      amenities: this.selectedAmenities.join(','),
      categories: this.selectedCategories.join(',')
    };

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge'
    });
  }

  // Mobile Responsiveness
  toggleMobileFilters() {
    this.isMobileFiltersVisible = !this.isMobileFiltersVisible;
    // Prevent body scroll when filters are open
    if (this.isMobileFiltersVisible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    this.cdr.detectChanges();
  }
  
  // Add method to close filters
  closeMobileFilters() {
    this.isMobileFiltersVisible = false;
    document.body.style.overflow = 'auto';
    this.cdr.detectChanges();
  }
  

  // View Mode Toggle
  toggleViewMode() {
    this.viewMode = this.viewMode === 'grid' ? 'list' : 'grid';
  }

  // Enhanced Clear Filters
  clearFilters() {
    this.selectedAmenities = [];
    this.selectedCategories = [];
    this.priceRange.current = this.priceRange.max;
    this.searchRadius = 5;
    this.sortOption = 'price-asc';
    this.activeFiltersCount = 0;
    
    this.updateQueryParams({
      amenities: undefined,
      categories: undefined,
      price: undefined,
      radius: undefined,
      sortBy: undefined
    });
    
    this.performSearch();
  }
  

  ngOnInit() {
    this.checkIfMobile();
    this.route.queryParams.subscribe(params => {
      this.updateSearchParams(params);
      
      if (params['latitude'] && params['longitude']) {
        this.searchByLocation(Number(params['latitude']), Number(params['longitude']));
      } else {
        this.performSearch();
      }
    });
  }
  
  

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.locationSearch$.complete();
    this.searchParams$.complete();
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
    this.locationSearch$.complete();
  }

  

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private toRad(value: number): number {
    return value * Math.PI / 180;
  }

  async searchByLocation(latitude: number, longitude: number) {
    await this.unifiedSearch({ latitude, longitude });
    this.isLoading = true;
    const listingsCollection = collection(this.firestore, 'listings');
    
    try {
      const baseQuery = query(listingsCollection,
        where('approved', '==', true),
        where('sold', '==', false)
      );

      this.searchSubscription = collectionData(baseQuery, { idField: 'id' }).pipe(
        map(listings => {
          console.log('Raw listings:', listings);
          return listings
            .filter(listing => {
              if (listing['geoPoint']) {
                const distance = this.calculateDistance(
                  latitude,
                  longitude,
                  listing['geoPoint'].latitude,
                  listing['geoPoint'].longitude
                );
                return distance <= this.searchRadius;
              }
              return false;
            })
            .sort((a, b) => {
              const distanceA = this.calculateDistance(
                latitude,
                longitude,
                a['geoPoint'].latitude,
                a['geoPoint'].longitude
              );
              const distanceB = this.calculateDistance(
                latitude,
                longitude,
                b['geoPoint'].latitude,
                b['geoPoint'].longitude
              );
              return distanceA - distanceB;
            });
        })
      ).subscribe({
        next: (results) => {
          console.log('Final results:', results);
          this.searchResults = results as SearchResult[];
          this.totalPages = Math.ceil(results.length / this.itemsPerPage);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Search error:', error);
          this.error = 'Error performing search';
          this.isLoading = false;
        }
      });
    } catch (error) {
      console.error('Search error:', error);
      this.error = 'Error performing search';
      this.isLoading = false;
    }
  }

  onLocationSearch(event: Event) {
    const searchTerm = (event.target as HTMLInputElement).value;
    if (searchTerm) {
      this.locationSearch$.next(searchTerm);
    }
  }

  updateSearchRadius(event: Event) {
    const radius = Number((event.target as HTMLSelectElement).value);
    this.searchRadius = radius;
    if (this.currentLocation) {
      this.searchByLocation(this.currentLocation.lat, this.currentLocation.lng);
    }
  }

  updatePriceRange(event: Event) {
    const value = Number((event.target as HTMLInputElement).value);
    this.priceRange.current = value;
    this.performSearch();
  }

  toggleAmenity(amenity: string) {
    const index = this.selectedAmenities.indexOf(amenity);
    if (index === -1) {
      this.selectedAmenities.push(amenity);
    } else {
      this.selectedAmenities.splice(index, 1);
    }
    this.performSearch();
  }

  toggleCategory(category: string) {
    const index = this.selectedCategories.indexOf(category);
    if (index === -1) {
      this.selectedCategories.push(category);
    } else {
      this.selectedCategories.splice(index, 1);
    }
    this.performSearch();
  }

  updateSort(event: Event) {
    this.sortOption = (event.target as HTMLSelectElement).value;
    this.performSearch();
  }

  async performSearch() {
    await this.unifiedSearch();
    this.isLoading = true;
    this.error = null;
  
    try {
      // First check for phone number
      if (!this.phoneService.hasPhoneNumber()) {
        const dialogRef = this.dialog.open(PhoneDialogComponent, {
          width: '400px',
          disableClose: true
        });
  
        const phoneNumber = await dialogRef.afterClosed().toPromise();
        
        if (!phoneNumber) {
          this.isLoading = false;
          return; // Exit if user cancels phone dialog
        }
  
        this.phoneService.savePhoneNumber(phoneNumber);
      }
  
      // Proceed with search
      const listingsCollection = collection(this.firestore, 'listings');
      let constraints: any[] = [
        where('approved', '==', true),
        where('sold', '==', false)
      ];
  
      if (this.searchParams.category) {
        constraints.push(where('category', '==', this.searchParams.category));
      }

      if (this.searchParams.subCategory) {
        constraints.push(where('subCategory', '==', this.searchParams.subCategory));
      }

      if (this.searchParams.detail) {
        constraints.push(where('detail', '==', this.searchParams.detail));
      }
  
      if (this.priceRange.current < this.priceRange.max) {
        constraints.push(where('price', '<=', this.priceRange.current));
      }
  
      const baseQuery = query(listingsCollection, ...constraints);
  
      this.searchSubscription = collectionData(baseQuery, { idField: 'id' }).pipe(
        map(listings => {
          let filteredListings = listings as SearchResult[];
  
          // Filter by location if coordinates are available
          if (this.currentLocation) {
            filteredListings = filteredListings.filter(listing => {
              if (listing.geoPoint) {
                const distance = this.calculateDistance(
                  this.currentLocation!.lat,
                  this.currentLocation!.lng,
                  listing.geoPoint.latitude,
                  listing.geoPoint.longitude
                );
                return distance <= this.searchRadius;
              }
              return false;
            });
          }

          
  
          // Filter by amenities
          if (this.selectedAmenities.length > 0) {
            filteredListings = filteredListings.filter(listing => 
              this.selectedAmenities.every(amenity => 
                listing.amenities && listing.amenities[amenity]
              )
            );
          }
  
          // Sort results
          return filteredListings.sort((a, b) => {
            switch (this.sortOption) {
              case 'price-asc':
                return a.price - b.price;
              case 'price-desc':
                return b.price - a.price;
              case 'newest':
                return (b.createdAt?.toMillis() || 0) - 
                       (a.createdAt?.toMillis() || 0);
              case 'distance':
                if (this.currentLocation) {
                  const distanceA = this.calculateDistance(
                    this.currentLocation.lat,
                    this.currentLocation.lng,
                    a.geoPoint.latitude,
                    a.geoPoint.longitude
                  );
                  const distanceB = this.calculateDistance(
                    this.currentLocation.lat,
                    this.currentLocation.lng,
                    b.geoPoint.latitude,
                    b.geoPoint.longitude
                  );
                  return distanceA - distanceB;
                }
                return 0;
              default:
                return 0;
            }
          });
        })
      ).subscribe({
        next: async (results) => {
          this.searchResults = results;
          this.totalPages = Math.ceil(results.length / this.itemsPerPage);
          this.isLoading = false;
  
          if (results.length > 0) {
            try {
              const phone = this.phoneService.getPhoneNumber();
              if (phone) {
                await this.callSendSearchNotifications(results);
              }
            } catch (error) {
              console.error('Error sending search notifications:', error);
              // Don't set error state as the search itself was successful
            }
          }
        },
        error: (error) => {
          console.error('Search error:', error);
          this.error = 'Error performing search';
          this.isLoading = false;
        }
      });
  
    } catch (error) {
      console.error('Search error:', error);
      this.error = 'Error performing search';
      this.isLoading = false;
    }
  }
    

  private async callSendSearchNotifications(results: SearchResult[]): Promise<void> {
    try {
        // 1) Make sure the user's phone number is available:
        const phone = this.phoneService.getPhoneNumber();
        if (!phone) {
            console.log('No phone number found; skipping notification.');
            return;
        }

        // 2) Gather the property IDs from the results:
        const propertyIds = results.map(r => r.id);

        // 3) Build the search query object you want to send:
        const searchQuery = {
            categories: this.selectedCategories,
            amenities: this.selectedAmenities,
            radius: this.searchRadius,
            price: this.priceRange.current,
            location: this.searchParams.location,
            coordinates: this.currentLocation,
            timestamp: new Date().toISOString()
        };

        // 4) Create a callable reference to your function:
        const sendSearchFn = httpsCallable<SearchNotificationData, SearchNotificationResult>(
            this.functions,
            'sendSearchNotifications'
        );

        // 5) Call the function using await:
        const result = await sendSearchFn({
            searcherPhone: phone,
            searchQuery: searchQuery,
            propertyIds: propertyIds
        });

        // 6) Handle the response
        if (result.data.success) {
            console.log('Notifications sent successfully:', {
                successCount: result.data.successCount,
                failureCount: result.data.failureCount
            });
        } else {
            console.warn('Some notifications failed to send:', {
                successCount: result.data.successCount,
                failureCount: result.data.failureCount
            });
        }

    } catch (error: unknown) {
        console.error('Error sending search notifications:', error);
        // Optionally rethrow or handle the error as needed
        // throw error;
    }
}


  get paginatedResults() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.searchResults.slice(start, end);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  viewProperty(propertyId: string | undefined) {
    console.log('Property ID:', propertyId); // Debug log
    
    if (!propertyId) {
      console.error('Cannot navigate: Property ID is undefined');
      return;
    }
  
    // Add try-catch for navigation
    try {
      this.router.navigate(['/property', propertyId])
        .then(() => console.log('Navigation successful'))
        .catch(error => console.error('Navigation failed:', error));
    } catch (error) {
      console.error('Navigation error:', error);
    }
  }

  toggleFavorite(propertyId: string) {
    // Implement favorite toggling logic
    console.log('Toggle favorite for property:', propertyId);
  }

  private handleError(error: any, message: string = 'An error occurred') {
    console.error(error);
    this.error = message;
    this.isLoading = false;
    this.cdr.detectChanges();
}




  getDistanceText(property: SearchResult): string {
    if (this.currentLocation && property.geoPoint) {
      const distance = this.calculateDistance(
        this.currentLocation.lat,
        this.currentLocation.lng,
        property.geoPoint.latitude,
        property.geoPoint.longitude
      );
      return `${distance.toFixed(1)} km away`;
    }
    return '';
  }


// Helper method to track filter changes
trackByAmenity(index: number, amenity: { id: string; label: string; icon: string }) {
  return amenity.id;
}

// Helper method for mobile menu
toggleMobileMenu() {
  this.isMobileFiltersVisible = !this.isMobileFiltersVisible;
  this.cdr.detectChanges();
}

// Helper method to format currency
formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
  }).format(amount);
}

}
