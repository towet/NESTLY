import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef, Renderer2, HostListener, ViewChildren, QueryList, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Firestore, collection, query, where, collectionData } from '@angular/fire/firestore';
import { Subscription, Subject } from 'rxjs';
import { RouterModule, Router } from '@angular/router';
import { LocationService } from '../shared/services/location.service';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { HttpClientModule } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { AnimationHandler } from '../shared/services/animations';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDialog } from '@angular/material/dialog'; 
import { PhoneService } from '../shared/services/phone.service';
import { PhoneDialogComponent } from '../shared/services/phone-dialog.component';
import { HeaderComponent } from '../shared/components/header/header.component';




interface TabOption {
  label: string;
  value: string;
}

interface PhoneDialogResult {
  phoneNumber: string;
}

interface LocationSuggestion {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
  types: string[];
}

interface SearchQueryParams {
  category?: string;
  subCategory?: string;
  detail?: string;
  location?: string;
  price?: number;
  latitude?: number;
  longitude?: number;
  fullyServicedPurchase?: boolean;
  [key: string]: string | number | boolean | undefined;
}

// Add these interfaces with your other interfaces
interface LocationSuggestionsResponse {
  suggestions: LocationSuggestion[];
}

interface PlaceDetailsResponse {
  geometry?: {
    location: {
      lat: number;
      lng: number;
    };
  };
  error_message?: string;
}



interface NavItem {
  label: string;
  route: string;
  subItems?: { label: string; route: string; }[];
}

interface LocationResponse {
  candidates: Array<{
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
    };
  }>;
  status: string;
}


interface SearchParams {
  category: string;
  subCategory: string;
  detail: string;
  location: string;
  price: number;
  size: number | null;
  fullyServicedPurchase: boolean;
  [key: string]: string | number | boolean | null | undefined;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule,HttpClientModule, RouterModule, MatDialogModule, HeaderComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss', './premium-hero-stats.scss', './hero-stats.scss', './premium-stats.scss', './stats-animation.scss', './filter-tabs.scss', './modern-styles.css', './property-search.scss', './mobile-nav.scss', './property-search-section.scss'],
  encapsulation: ViewEncapsulation.None
})
export class HomeComponent implements OnInit, OnDestroy, AfterViewInit {
  // Basic Info
  label = 'NESTIFY KENYA';
  price = 'KSH 3,099,000';
  location = 'Karen, Nairobi';

  isLoading = false;
  error: string | null = null;

  isTransitioning = false;
  currentIndex = 0;
  nextIndex = 1;
  private slideshowIntervals: any[] = [];

  // Scroll detection for header
  isScrolled = false;

  // Location Search
  private locationSearch$ = new Subject<string>();
  searchCoordinates: { lat: number; lng: number } | null = null;

  locationSuggestions: LocationSuggestion[] = [];
  selectedLocation: LocationSuggestion | null = null;
  isLoadingLocations = false;
  private locationInputTimer: any;
  searchError: string | null = null;

  // Mobile/Desktop State
  isMobile: boolean = window.innerWidth < 768;
  isMobileMenuOpen = false;
  isSearchExpanded = false;
  openMobileSubMenu: string | null = null;

  // Slideshow with high-quality premium images and property information
  propertySlides = [
    {
      image: 'assets/best.jpg',
      type: 'land',
      category: 'LAND',
      title: 'Premium Residential Plot',
      location: 'Kitengela • 1/4 Acre',
      price: 'KSH 12,500,000'
    },
    {
      image: 'assets/unsplash.jpg',
      type: 'commercial',
      category: 'COMMERCIAL',
      title: 'Prime Office Space',
      location: 'CBD, Nairobi • 300 sq.m',
      price: 'KSH 45,000,000'
    },
    {
      image: 'assets/about2.jpg',
      type: 'residential',
      category: 'RESIDENTIAL',
      title: 'Luxury Family Home',
      location: 'Karen, Nairobi • 5 Bedroom',
      price: 'KSH 85,000,000'
    },
    {
      image: 'assets/about1.jpg',
      type: 'airbnb',
      category: 'AIRBNB',
      title: 'Beachfront Villa',
      location: 'Diani Beach • 3 Bedroom',
      price: 'KSH 32,000,000'
    },
    {
      image: 'assets/nest.jpg',
      type: 'residential',
      category: 'RESIDENTIAL',
      title: 'Modern Apartment',
      location: 'Westlands • 2 Bedroom',
      price: 'KSH 18,500,000'
    }
  ];
  
  // For backward compatibility
  get images() {
    return this.propertySlides.map(slide => slide.image);
  }

  // Search form is now always visible as landing page
  isPremiumHeroVisible = false;
  isSearchFormVisible = true;

  // Toggle search form visibility
  toggleSearchForm() {
    this.isSearchFormVisible = !this.isSearchFormVisible;
  }
  
  // Method to handle quick search from popular search tags
  quickSearch(type: string) {
    switch(type) {
      case 'Houses':
        this.search.category = 'Residential';
        this.onCategoryChange();
        this.search.subCategory = 'Houses';
        this.onSubCategoryChange();
        break;
      case 'Apartments':
        this.search.category = 'Residential';
        this.onCategoryChange();
        this.search.subCategory = 'Apartments & Flats';
        this.onSubCategoryChange();
        break;
      case 'Offices':
        this.search.category = 'Commercial';
        this.onCategoryChange();
        this.search.subCategory = 'Office Spaces';
        this.onSubCategoryChange();
        break;
      case 'Land':
        this.search.category = 'Land';
        this.onCategoryChange();
        this.search.subCategory = 'Vacant Land';
        this.onSubCategoryChange();
        break;
    }
  }
 
  progressValue = 0;
  private intervalId: any;

  // Search Parameters
  categories = ['Commercial', 'Residential', 'Airbnb & Short-Term Rentals', 'Land'];
  search: SearchParams = {
    category: '',
    subCategory: '',
    detail: '',
    location: '',
    price: 500000,
    size: null,
    fullyServicedPurchase: false
  };
  
  subCategories: string[] = [];
  details: string[] = [];

  // Category Mappings
  allSubCategories: { [key: string]: string[] } = {
    Commercial: [
      'Office Spaces',
      'Retail Spaces',
      'Industrial & Warehouses',
      'Hospitality & Entertainment',
      'Healthcare & Wellness',
      'Land & Development'
    ],
    Residential: [
      'Apartments & Flats',
      'Houses',
      'Gated Communities',
      'Affordable & Low-Cost Housing',
      'Land for Residential Development'
    ],
    'Airbnb & Short-Term Rentals': [
      'Entire Homes',
      'Private Rooms',
      'Serviced Apartments',
      'Themed & Unique Stays',
      'Event & Party Spaces'
    ],
    Land: [
      'Vacant Land',
      'Agricultural Land',
      'Mixed-Use Land',
      'Recreational Land'
    ]
  };

  allDetails: { [key: string]: string[] } = {
    // Commercial Category
    'Office Spaces': [
      'Co-working spaces',
      'Shared offices',
      'Private office suites',
      'Corporate headquarters'
    ],
    'Retail Spaces': [
      'Shopping malls',
      'Supermarkets',
      'Standalone retail stores',
      'Kiosks & stalls'
    ],
    'Industrial & Warehouses': [
      'Manufacturing plants',
      'Distribution centers',
      'Storage facilities',
      'Industrial parks'
    ],
    'Hospitality & Entertainment': [
      'Hotels & Lodging',
      'Bars & Clubs',
      'Cinemas & Theaters',
      'Event & Banquet Halls'
    ],
    'Healthcare & Wellness': [
      'Hospitals',
      'Clinics & Medical Centers',
      'Wellness & Spa Centers',
      'Pharmacies'
    ],
    'Land & Development': [
      'Commercial plots',
      'Redevelopment sites',
      'Mixed-use land for commercial',
      'Under-construction projects'
    ],
  
    // Residential Category
    'Apartments & Flats': [
      'Studio apartments',
      'One-Bedroom flats',
      'Lofts',
      'Penthouse units'
    ],
    'Houses': [
      'Bungalows',
      'Mansions',
      'Townhouses',
      'Villas'
    ],
    'Gated Communities': [
      'Townhouse complexes',
      'Housing estates',
      'Lifestyle communities',
      'Golf estates'
    ],
    'Affordable & Low-Cost Housing': [
      'Low-income apartments',
      'Bed-sitters',
      'Micro-apartments',
      'Hostel-style units'
    ],
    'Land for Residential Development': [
      'Greenfield development',
      'Subdivisions',
      'Mixed-use land for housing',
      'Urban expansions'
    ],
  
    // Airbnb & Short-Term Rentals Category
    'Entire Homes': [
      'Villas',
      'Beach houses',
      'Cottages',
      'Cabins'
    ],
    'Private Rooms': [
      'Single private rooms',
      'Shared rooms',
      'Ensuite rooms',
      'Dorm-style rooms'
    ],
    'Serviced Apartments': [
      'Executive apartments',
      'Apart-hotels',
      'Extended stays',
      'Corporate apartments'
    ],
    'Themed & Unique Stays': [
      'Treehouses',
      'Safari tents',
      'Farm stays',
      'Eco-lodges'
    ],
    'Event & Party Spaces': [
      'Banquet halls',
      'Gardens & lawns',
      'Rooftop venues',
      'Conference centers'
    ],
  
    // Land Category
    'Vacant Land': [
      'Residential plots',
      'Commercial plots',
      'Mixed-use plots',
      'Serviced plots'
    ],
    'Agricultural Land': [
      'Coffee farms',
      'Tea farms',
      'Horticultural land',
      'Livestock grazing land'
    ],
    'Mixed-Use Land': [
      'Urban expansions',
      'Commercial-residential land',
      'Multi-zoned plots',
      'Integrated developments'
    ],
    'Recreational Land': [
      'Camping sites',
      'Picnic areas',
      'Eco-tourism land',
      'Wildlife conservancies'
    ]
  };
  

  // Featured Listings
  featuredListings: any[] = [];
  private featuredSubscription!: Subscription;

  // Tabs
  tabs: TabOption[] = [
    { label: 'All', value: 'all' },
    { label: 'Commercial', value: 'Commercial' },
    { label: 'Residential', value: 'Residential' },
    { label: 'Airbnb & Short-Term Rentals', value: 'Airbnb & Short-Term Rentals' },
    { label: 'Land', value: 'Land' }
  ];
  selectedTab = 'all';

  // Touch Handling
  touchStart = 0;
  touchEnd = 0;
  private readonly minSwipeDistance = 50;

  // Intersection Observer for scroll animations
  private observer?: IntersectionObserver;
  @ViewChildren('listingCard') listingCards!: QueryList<ElementRef>;

  // --- Multi-step wizard state ---
  steps = ['Property Details', 'Location & Preferences'];
  currentStep = 0;

  nextStep() {
    if (this.currentStep < this.steps.length - 1) {
      this.currentStep++;
    }
  }

  prevStep() {
    if (this.currentStep > 0) {
      this.currentStep--;
    }
  }

  canProceed(): boolean {
    switch (this.currentStep) {
      case 0:
        return !!this.search.category;
      case 1:
        return !!this.search.location;
      default:
        return true;
    }
  }

  constructor(
    private firestore: Firestore,
    private breakpointObserver: BreakpointObserver,
    private router: Router,
    private locationService: LocationService,
    private http: HttpClient,
    private dialog: MatDialog,
    private phoneService: PhoneService,
    private elementRef: ElementRef,
    private renderer: Renderer2
  ) {
    this.initializeLocationSearch();
  }

  private initializeLocationSearch() {
    this.locationSearch$.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(location => {
      if (location) {
        this.locationService.findPlace(location).subscribe({
          next: (response: LocationResponse) => {
            if (response.candidates && response.candidates[0]) {
              const locationData = response.candidates[0].geometry.location;
              this.searchCoordinates = {
                lat: locationData.lat,
                lng: locationData.lng
              };
            }
          },
          error: (error) => {
            console.error('Location search error:', error);
          }
        });
      }
    });
  }

  ngOnInit() {
    new AnimationHandler();
    this.preloadImages(); 
    this.startSlideshow();
    this.loadFeaturedListings();
    this.initializeMobileDetection();
    
    // Initialize scroll detection
    this.initScrollDetection();
  }

  private initializeMobileDetection() {
    this.breakpointObserver.observe([Breakpoints.Handset])
      .subscribe(result => {
        this.isMobile = result.matches;
        if (!this.isMobile) {
          this.isMobileMenuOpen = false;
        }
      });
  }

 
  private preloadImages() {
    this.images.forEach(src => {
      const img = new Image();
      img.src = src;
    });
  }

  loadFeaturedListings() {
    if (this.featuredSubscription) {
      this.featuredSubscription.unsubscribe();
    }

    this.isLoading = true;
    const listingsCollection = collection(this.firestore, 'listings');
    const constraints = [
      where('approved', '==', true),
      where('sold', '==', false),
      where('featured', '==', true)
    ];

    if (this.selectedTab !== 'all') {
      constraints.push(where('category', '==', this.selectedTab));
    }

    const listingsQuery = query(listingsCollection, ...constraints);
    this.featuredSubscription = collectionData(listingsQuery, { idField: 'id' })
      .subscribe({
        next: (listings) => {
          // Display listings immediately with placeholders
          this.featuredListings = listings;
          this.isLoading = false; // Set loading to false as soon as data arrives
          // Images will load via their img tags in the template
        },
        error: (error) => {
          console.error('Error loading listings:', error);
          this.isLoading = false; // Set loading to false on error
        }
      });
  }

  ngOnDestroy() {
    if (this.featuredSubscription) {
      this.featuredSubscription.unsubscribe();
    }
    
    // Clear all slideshow intervals
    if (this.slideshowIntervals.length) {
      this.slideshowIntervals.forEach(clearInterval);
    }
    
    // Clear the progress interval
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    
    // Disconnect observer when component is destroyed
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  // UI Interaction Methods
  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  toggleMobileSubMenu(menu: string) {
    this.openMobileSubMenu = this.openMobileSubMenu === menu ? null : menu;
  }

  toggleSearch() {
    this.isSearchExpanded = !this.isSearchExpanded;
    if (!this.isSearchExpanded) {
      this.searchCoordinates = null;
      this.search.location = '';
    }
  }

  getPreviousIndex(): number {
    return (this.currentIndex - 1 + this.images.length) % this.images.length;
  }
  
  getProgressForIndex(index: number): number {
    if (index === this.currentIndex) {
      return this.progressValue / 100;
    }
    return index < this.currentIndex ? 1 : 0;
  }
  

  // Search Related Methods
  onCategoryChange() {
    const cat = this.search.category;
    this.subCategories = this.allSubCategories[cat] || [];
    this.search.subCategory = '';
    this.details = [];
    this.search.detail = '';
  }

  onSubCategoryChange() {
    const sub = this.search.subCategory;
    this.details = this.allDetails[sub] || [];
    this.search.detail = '';
  }

  onLocationInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.search.location = value;
    
    // Clear previous timer
    if (this.locationInputTimer) {
      clearTimeout(this.locationInputTimer);
    }

    // Reset states
    this.searchCoordinates = null;
    this.selectedLocation = null;

    if (!value.trim()) {
      this.locationSuggestions = [];
      return;
    }

    // Set new timer for debounce
    this.locationInputTimer = setTimeout(() => {
      this.isLoadingLocations = true;
      this.http.get<LocationSuggestionsResponse>(
        `https://us-central1-personal-a9a71.cloudfunctions.net/locationSuggestions?input=${encodeURIComponent(value)}`
      ).subscribe({
        next: (response: LocationSuggestionsResponse) => {
          this.locationSuggestions = response.suggestions;
          this.isLoadingLocations = false;
        },
        error: (error: Error) => {
          console.error('Error fetching locations:', error);
          this.locationSuggestions = [];
          this.isLoadingLocations = false;
        }
      });
    }, 300);
}

async selectLocation(suggestion: LocationSuggestion) {
    this.selectedLocation = suggestion;
    this.search.location = suggestion.description;
    this.locationSuggestions = []; // Clear suggestions

    this.isLoadingLocations = true;
    try {
      const response = await this.http.get<PlaceDetailsResponse>(
        `https://us-central1-personal-a9a71.cloudfunctions.net/placeDetails?placeId=${suggestion.placeId}`
      ).toPromise();

      if (response?.geometry?.location) {
        this.searchCoordinates = {
          lat: response.geometry.location.lat,
          lng: response.geometry.location.lng
        };
      }
    } catch (error: unknown) {
      console.error('Error fetching place details:', error);
      this.searchCoordinates = null;
    } finally {
      this.isLoadingLocations = false;
    }
}

// In your HomeComponent class
viewProperty(propertyId: string) {
  if (!propertyId) {
    console.error('Property ID is undefined');
    return;
  }

  this.router.navigate(['/property', propertyId])
    .then(() => {
      console.log('Successfully navigated to property:', propertyId);
    })
    .catch(error => {
      console.error('Navigation error:', error);
    });
}

// Navigate to Short Stays Serviced Apartments section
navigateToServicedApartments() {
  this.router.navigate(['/short-stays/serviced-apartments'])
    .then(() => {
      console.log('Successfully navigated to serviced apartments');
    })
    .catch(error => {
      console.error('Navigation error:', error);
    });
}

// Navigate to Featured Listings section
navigateToFeaturedListings() {
  this.router.navigate(['/search'], { queryParams: { featured: true } })
    .then(() => {
      console.log('Successfully navigated to featured listings');
    })
    .catch(error => {
      console.error('Navigation error:', error);
    });
}



async performSearch() {
  if (!this.validateSearch()) {
    return;
  }

  this.isLoading = true;

  // Check if phone number exists
  if (!this.phoneService.hasPhoneNumber()) {
    // Show phone dialog
    const dialogRef = this.dialog.open(PhoneDialogComponent, {
      width: '400px',
      disableClose: true
    });

    // Handle the dialog result
    dialogRef.afterClosed().subscribe((result: string | undefined) => {
      if (result) {
        // Save the phone number
        this.phoneService.savePhoneNumber(result);
        // Proceed with search
        this.executeSearch();
      } else {
        this.isLoading = false; // Reset loading if dialog was cancelled
      }
    });
  } else {
    // If we already have the phone number, proceed directly
    this.executeSearch();
  }
}

private validateSearch(): boolean {
  // Only require the minimum fields we need for a meaningful search
  if (!this.search.category) {
    this.searchError = 'Please select a property category';
    return false;
  }
  
  // Allow search to proceed even if location validation isn't perfect
  // We'll rely on the multi-step wizard's progress validation instead
  return true;
}

private executeSearch() {
  const queryParams: SearchQueryParams = {
    category: this.search.category,
    subCategory: this.search.subCategory,
    detail: this.search.detail,
    location: this.search.location,
    price: this.search.price,
    latitude: this.searchCoordinates?.lat,
    longitude: this.searchCoordinates?.lng,
    fullyServicedPurchase: this.search.fullyServicedPurchase
  };

  // Remove empty parameters
  const filteredParams = Object.entries(queryParams)
    .reduce((acc, [key, value]) => {
      if (value !== undefined && value !== '') {
        acc[key] = value;
      }
      return acc;
    }, {} as SearchQueryParams);

  this.router.navigate(['/search'], { queryParams: filteredParams })
    .then(() => {
      this.isLoading = false;
    })
    .catch((error) => {
      console.error('Navigation error:', error);
      this.searchError = 'An error occurred while searching. Please try again.';
      this.isLoading = false;
    });
}


  // Carousel Methods
  nextImage() {
    this.isTransitioning = true;
    this.currentIndex = (this.currentIndex + 1) % this.images.length;
    setTimeout(() => {
      this.isTransitioning = false;
    }, 800); // Match the transition duration in CSS
  }
  
  prevImage() {
    this.isTransitioning = true;
    this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
    setTimeout(() => {
      this.isTransitioning = false;
    }, 800); // Match the transition duration in CSS
  }
  
  currentImage() {
    return this.images[this.currentIndex];
  }
  
  // Get the index of the next image for carousel animation
  getNextIndex(): number {
    return (this.currentIndex + 1) % this.images.length;
  }
  
  // Get the index of the previous image for carousel animation
  getPrevIndex(): number {
    return (this.currentIndex - 1 + this.images.length) % this.images.length;
  }

  // Featured Listings Methods
  selectTab(tabValue: string) {
    this.selectedTab = tabValue;
    this.loadFeaturedListings();
  }

  // Utility Methods
  trackByIndex(index: number): number {
    return index;
  }

  // Event Listeners
  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.isMobile = (event.target as Window).innerWidth < 768;
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled = window.scrollY > 50;
  }

  @HostListener('touchstart', ['$event'])
  onTouchStart(event: TouchEvent) {
    this.touchStart = event.touches[0].clientX;
  }

  @HostListener('touchend', ['$event'])
  onTouchEnd(event: TouchEvent) {
    this.touchEnd = event.changedTouches[0].clientX;
    this.handleSwipe();
  }

  private handleSwipe() {
    const swipeDistance = this.touchEnd - this.touchStart;
    if (Math.abs(swipeDistance) > this.minSwipeDistance) {
      if (swipeDistance > 0) {
        // Swiped right
      } else {
        // Swiped left
      }
    }
  }

  // Detect scroll for header animation
  private initScrollDetection() {
    window.addEventListener('scroll', () => {
      this.isScrolled = window.scrollY > 50;
    });
  }

  private setupCounterAnimation() {
    const counterElements = document.querySelectorAll('.counter-value');
    const options = {
      threshold: 0.5 // Trigger when 50% of the element is visible
    };

    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const element = entry.target as HTMLElement;
          const target = parseFloat(element.getAttribute('data-target') || '0');
          const duration = 2000; // Animation duration in milliseconds
          const frameDuration = 1000 / 60; // 60fps
          const totalFrames = Math.round(duration / frameDuration);
          let frame = 0;
          let currentValue = 0;
          const isFloat = target.toString().includes('.');
          const hasPlusSymbol = element.innerHTML.includes('<sup>+</sup>'); // Check for sup tag specifically
          const increment = target / totalFrames;
          
          // Add a class to indicate animation started (optional)
          element.classList.add('is-counting');

          const counterAnimation = setInterval(() => {
            frame++;
            currentValue += increment;
            let displayValue: string;

            if (isFloat) {
              // Handle floating point numbers, ensuring correct precision
              displayValue = currentValue.toFixed(1);
            } else {
              displayValue = Math.floor(currentValue).toString();
            }
            
            // Set text content without the sup tag first
            element.textContent = displayValue;
            
            // Add back the sup tag if needed
            if (hasPlusSymbol) {
              element.innerHTML += '<sup>+</sup>';
            }
            
            if (frame >= totalFrames) {
              clearInterval(counterAnimation);
              // Ensure final value is exact
              let finalValue = isFloat ? target.toString() : Math.floor(target).toString();
              element.textContent = finalValue;
              if (hasPlusSymbol) {
                 element.innerHTML += '<sup>+</sup>';
              }
               element.classList.remove('is-counting');
               element.classList.add('finished-counting');
               // Stop observing once animation is done
               observer.unobserve(element);
            }
          }, frameDuration);
        }
      });
    }, options);

    counterElements.forEach(el => observer.observe(el));
  }

  private setupIntersectionObserver() {
    // Disconnect existing observer if it exists
    if (this.observer) {
      this.observer.disconnect();
    }
    
    // Create a new Intersection Observer with improved settings for faster loading
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Add visible class immediately to improve perceived performance
          entry.target.classList.add('card-visible');
          
          // Prioritize loading images for visible cards
          const imgElement = entry.target.querySelector('img');
          if (imgElement) {
            imgElement.loading = 'eager'; // Switch to eager loading for visible cards
            
            // Add high fetchpriority for visible images (modern browsers support this)
            imgElement.setAttribute('fetchpriority', 'high');
          }
          
          // Unobserve after animation is triggered
          if (this.observer) {
            this.observer.unobserve(entry.target);
          }
        }
      });
    }, {
      root: null, // Use viewport as root
      rootMargin: '50px', // Start loading a bit before the card enters viewport
      threshold: 0.1 // Trigger when just 10% of the card is visible for faster loading
    });
    
    // Observe all listing cards
    if (this.observer && this.listingCards) {
      this.listingCards.forEach((card: ElementRef) => {
        this.observer!.observe(card.nativeElement);
      });
    }
  }

  private setupScrollReveal(): void {
    const revealElements = this.elementRef.nativeElement.querySelectorAll('.reveal');

    if (!revealElements.length) {
      return;
    }

    const observerOptions = {
      root: null, // Use the viewport as the root
      rootMargin: '0px',
      threshold: 0.1 // Trigger when 10% of the element is visible
    };

    const scrollObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.renderer.addClass(entry.target, 'visible');
          obs.unobserve(entry.target); // Stop observing once visible
        }
      });
    }, observerOptions);

    revealElements.forEach((el: Element) => {
      scrollObserver.observe(el);
    });
  }

  private startSlideshow() {
    const slideDuration = 6000; // 6 seconds per slide
    const transitionDuration = 1500; // 1.5 seconds for transition
    
    // Start progress bar animation
    const progressInterval = this.updateProgress(slideDuration);
    this.slideshowIntervals.push(progressInterval);
    
    // Start slideshow
    const slideInterval = setInterval(() => {
      this.isTransitioning = true;
      
      // Update indices
      this.currentIndex = (this.currentIndex + 1) % this.images.length;
      this.nextIndex = (this.currentIndex + 1) % this.images.length;
      
      // Reset progress
      this.progressValue = 0;
      
      // After transition duration, set transitioning to false
      setTimeout(() => {
        this.isTransitioning = false;
      }, transitionDuration);
      
    }, slideDuration);
    
    this.slideshowIntervals.push(slideInterval);
  }

  private updateProgress(duration: number) {
    const steps = 100;
    const stepTime = duration / steps;
    let currentStep = 0;

    const progressInterval = setInterval(() => {
      this.progressValue = (currentStep / steps) * 100;
      currentStep++;
      
      if (currentStep > steps) {
        currentStep = 0;
        this.progressValue = 0;
      }
    }, stepTime);

    return progressInterval;
  }
  
  ngAfterViewInit(): void {
    this.setupCounterAnimation();
    this.setupIntersectionObserver();
    this.setupScrollReveal();
  }
}