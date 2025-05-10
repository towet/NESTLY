import { Component, OnInit, OnDestroy, ViewChildren, ElementRef, QueryList, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { Firestore, collection, query, where, collectionData } from '@angular/fire/firestore';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

interface RetailListing {
  id: string;
  title: string;
  price: number;
  location: string;
  detail: string;
  propertySize: number;
  images: string[];
  amenities: {
    [key: string]: boolean;
  };
  utilities: {
    [key: string]: boolean;
  };
  description: string;
  rating?: number;
  reviewsCount?: number;
  approved: boolean;
  sold: boolean;
}

@Component({
  selector: 'app-retail-spaces',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent],
  templateUrl: './retail-spaces.component.html',
  styleUrls: ['./retail-spaces.component.scss']
})
export class RetailSpacesComponent implements OnInit, OnDestroy, AfterViewInit {
  listings: RetailListing[] = [];
  filteredListings: RetailListing[] = [];
  isLoading = true;
  private listingsSubscription?: Subscription;

  // Intersection Observer for scroll animations
  private observer?: IntersectionObserver;
  @ViewChildren('listingCard') listingCards!: QueryList<ElementRef>;

  retailDetails = [
    'All',
    'Shopping malls',
    'Supermarkets',
    'Standalone retail stores',
    'Kiosks & stalls'
  ];
  selectedDetail = 'All';

  constructor(private firestore: Firestore,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadListings();
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

  loadListings() {
    const listingsCollection = collection(this.firestore, 'listings');
    const listingsQuery = query(
      listingsCollection,
      where('category', '==', 'Commercial'),
      where('subCategory', '==', 'Retail Spaces'),
      where('approved', '==', true),
      where('sold', '==', false)
    );

    this.listingsSubscription = collectionData(listingsQuery, { idField: 'id' })
      .subscribe({
        next: (data) => {
          this.listings = data as RetailListing[];
          this.filterByDetail(this.selectedDetail);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error fetching listings:', error);
          this.isLoading = false;
        }
      });
  }

  filterByDetail(detail: string) {
    this.selectedDetail = detail;
    this.filteredListings = detail === 'All'
      ? this.listings
      : this.listings.filter(listing => listing.detail === detail);
  }

  navigateToPropertyDetails(listingId: string): void {
    if (listingId) {
      this.router.navigate(['/property', listingId]);
    }
  }
  
  ngOnDestroy() {
    // Clean up subscriptions
    if (this.listingsSubscription) {
      this.listingsSubscription.unsubscribe();
    }
    
    // Disconnect observer when component is destroyed
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}
