import { Component, OnInit, OnDestroy, ViewChildren, ElementRef, QueryList, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';

// AngularFire Firestore imports (adjust the import paths to your AngularFire version)
import {
  Firestore,
  collection,
  collectionData,
  Query,
  where,
  query
} from '@angular/fire/firestore';
import { Observable, Subscription } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

// Define an interface for your listing documents (update fields as needed)
interface Listing {
  id?: string;
  category?: string;
  subCategory?: string;
  title?: string;
  price?: number;
  location?: string;
  images?: string[];
  landSize?: number;
  sizeUnit?: string;
  features?: string[];
  // Add other fields as required...
}

@Component({
  selector: 'app-land',
  standalone: true,
  imports: [CommonModule,HeaderComponent,FooterComponent],
  templateUrl: './land.component.html',
  styleUrls: ['./land.component.scss']
})
export class LandComponent implements OnInit, OnDestroy, AfterViewInit {
  // Land subcategories based on the agent submission schema for "Land"
  landSubCategories: string[] = [
    'Vacant Land',
    'Agricultural Land',
    'Mixed-Use Land',
    'Recreational Land'
  ];

  // Selected subcategory tab; default is "All"
  selectedSubCategory: string = 'All';

  defaultImage = 'assets/placeholder.jpg';

  // Hold all fetched listings from Firestore that are of category 'Land'
  allListings: Listing[] = [];

  // Loading and error states
  isLoading = true;
  error: string | null = null;

  // Intersection Observer for scroll animations
  private observer?: IntersectionObserver;
  private subscription?: Subscription;
  @ViewChildren('listingCard') listingCards!: QueryList<ElementRef>;

  constructor(private firestore: Firestore) {}

  ngOnInit(): void {
    this.fetchLandListings();
  }

  ngAfterViewInit() {
    // Setup Intersection Observer after listings are loaded
    this.listingCards.changes.subscribe((cards) => {
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
   * Real-time subscription to Firestore for listings where category is "Land"
   */
  fetchLandListings(): void {
    this.isLoading = true;
    this.error = null;

    try {
      // Reference to the listings collection
      const listingsRef = collection(this.firestore, 'listings');
      // Create a query for listings whose category equals "Land"
      const q: Query = query(listingsRef, where('category', '==', 'Land'));

      // Use collectionData for real-time subscription; include the document ID
      this.subscription = collectionData(q, { idField: 'id' })
        .pipe(
          map((data) => data as Listing[]),
          catchError((err) => {
            console.error('Error fetching land listings:', err);
            this.error = 'Failed to load land listings.';
            this.isLoading = false;
            throw err;
          })
        )
        .subscribe((listings: Listing[]) => {
          this.allListings = listings;
          this.isLoading = false;
        });
    } catch (err: any) {
      console.error('Unexpected error:', err);
      this.error = 'An unexpected error occurred.';
      this.isLoading = false;
    }
  }

  /**
   * Retry fetching data if there was an error.
   */
  retryFetch(): void {
    this.fetchLandListings();
  }

  /**
   * Handler for subcategory tab clicks.
   */
  selectSubCategory(sub: string): void {
    this.selectedSubCategory = sub;
  }

  /**
   * Getter for filtered listings based on the selected subcategory.
   * If "All" is selected, returns all listings.
   */
  get filteredListings(): Listing[] {
    if (this.selectedSubCategory === 'All') {
      return this.allListings;
    }
    return this.allListings.filter(listing => listing.subCategory === this.selectedSubCategory);
  }

  /**
   * Function to handle when a user clicks on a listing.
   * Here you can navigate to a detail page or open a modal.
   */
  viewListing(listingId: string | undefined): void {
    if (!listingId) {
      return;
    }
    console.log('Viewing listing with ID:', listingId);
    // For example, navigate via Angular's Router:
    // this.router.navigate(['/listing', listingId]);
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
