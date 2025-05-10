import { Component, OnInit, OnDestroy, ViewChildren, ElementRef, QueryList, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';

// AngularFire (adjust the imports to match your AngularFire version)
import { Firestore, collection, collectionData, Query, where, query } from '@angular/fire/firestore';
import { Observable, Subscription } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

// Interface for listings (adjust fields to match your data shape)
interface Listing {
  id?: string;
  category?: string;
  subCategory?: string;
  title?: string;
  price?: number;
  location?: string;
  images?: string[];
  propertySize?: number;
  amenities?: string[];
  // ... add other fields as needed
}

@Component({
  selector: 'app-commercial',
  standalone: true,
  imports: [CommonModule,HeaderComponent,FooterComponent],
  templateUrl: './commercial.component.html',
  styleUrls: ['./commercial.component.scss']
})
export class CommercialComponent implements OnInit, OnDestroy, AfterViewInit {
  /**
   * Subcategories for "Commercial" from your Flutter code
   * "All" is a pseudo-subcategory to show everything under Commercial.
   */
  commercialSubCategories: string[] = [
    'Office Spaces',
    'Retail Spaces',
    'Industrial & Warehouses',
    'Hospitality & Entertainment',
    'Healthcare & Wellness',
    'Land & Development'
  ];

  // Selected subcategory: "All" by default
  selectedSubCategory: string = 'All';

  // Full list of listings fetched from Firestore (for Commercial category)
  allCommercialListings: Listing[] = [];

  // Loading & error states
  isLoading = true;
  error: string | null = null;

  // Default image (in case listing.images is empty)
  defaultImage = 'assets/about2.jpg'; // Adjust path as needed

  // Intersection Observer for scroll animations
  private observer?: IntersectionObserver;
  private subscription?: Subscription;
  @ViewChildren('listingCard') listingCards!: QueryList<ElementRef>;

  constructor(private firestore: Firestore,
    private router: Router 
  ) {}

  ngOnInit(): void {
    this.fetchCommercialListings();
  }

  ngAfterViewInit() {
    // Setup Intersection Observer after listings are loaded
    this.listingCards.changes.subscribe(() => {
      this.setupIntersectionObserver();
    });
  }
  
  setupIntersectionObserver() {
    // Disconnect existing observer if it exists
    if (this.observer) {
      this.observer.disconnect();
    }
    
    // Create a new Intersection Observer
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('card-visible');
          // Unobserve after animation is triggered
          if (this.observer) {
            this.observer.unobserve(entry.target);
          }
        }
      });
    }, {
      root: null, // Use viewport as root
      rootMargin: '0px',
      threshold: 0.15 // Trigger when 15% of the card is visible
    });
    
    // Observe all listing cards
    if (this.observer) {
      this.listingCards.forEach(card => {
        this.observer!.observe(card.nativeElement);
      });
    }
  }

  /**
   * Real-time subscription to Firestore for all listings in "Commercial" category
   */
  fetchCommercialListings(): void {
    this.isLoading = true;
    this.error = null;

    try {
      // 1. Create reference to 'listings' collection
      const listingsRef = collection(this.firestore, 'listings');

      // 2. Build query where category == "Commercial"
      //    Adjust field name if your Firestore uses a different attribute for "category".
      const q: Query = query(listingsRef, where('category', '==', 'Commercial'));

      // 3. Use collectionData for real-time updates
      this.subscription = collectionData(q, { idField: 'id' })
        .pipe(
          map((data) => data as Listing[]),
          catchError((err) => {
            console.error('Error in Firestore subscription:', err);
            this.error = 'Failed to load commercial listings.';
            this.isLoading = false;
            throw err; // re-throw to end the stream
          })
        )
        .subscribe((listings: Listing[]) => {
          this.allCommercialListings = listings;
          this.isLoading = false;
        });
    } catch (err: any) {
      console.error('Error fetching commercial listings:', err);
      this.isLoading = false;
      this.error = 'An unexpected error occurred.';
    }
  }

  /**
   * Method to re-try fetching in case of an error
   */
  retryFetch(): void {
    this.fetchCommercialListings();
  }

  /**
   * Called when user clicks on a subcategory tab
   */
  selectSubCategory(sub: string) {
    this.selectedSubCategory = sub;
  }

  /**
   * Filtered listings based on selected subcategory
   * If "All" is selected, show everything in allCommercialListings
   */
  get filteredListings(): Listing[] {
    if (this.selectedSubCategory === 'All') {
      return this.allCommercialListings;
    }
    // Otherwise filter by subCategory
    return this.allCommercialListings.filter(
      (listing) => listing.subCategory === this.selectedSubCategory
    );
  }

  /**
   * Example function to view listing details
   * In a real app, you'd navigate to a details page or open a modal
   */
  viewListing(listingId: string | undefined): void {
    if (!listingId) {
      console.error('Invalid listing ID');
      return;
    }
    this.router.navigate(['/property', listingId]);
  }

  ngOnDestroy() {
    // Clean up subscriptions
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    
    // Disconnect observer when component is destroyed
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}
