import { Component, OnInit, OnDestroy, ViewChildren, ElementRef, QueryList, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { Firestore, collection, query, where, collectionData } from '@angular/fire/firestore';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

interface ResidentialListing {
  id: string;
  title: string;
  description?: string;
  price: number;
  location: string;
  category: string;
  subCategory?: string;
  images?: string[];
  bedrooms?: number;
  bathrooms?: number;
  propertySize?: number;
  amenities?: string[];
  approved: boolean;
  sold: boolean;
}

@Component({
  selector: 'app-residential',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent],
  templateUrl: './residential.component.html',
  styleUrls: ['./residential.component.scss']
})

export class ResidentialComponent implements OnInit, OnDestroy, AfterViewInit {
  listings: ResidentialListing[] = [];
  filteredListings: ResidentialListing[] = [];
  isLoading = true;
  private listingsSubscription?: Subscription;
  error: string | null = null;
  defaultImage = 'assets/placeholder.jpg';

  // Intersection Observer for scroll animations
  private observer?: IntersectionObserver;
  @ViewChildren('listingCard') listingCards!: QueryList<ElementRef>;

  subCategories = [
    'Apartments & Flats',
    'Houses',
    'Gated Communities',
    'Affordable & Low-Cost Housing',
    'Land for Residential Development'
  ];
  selectedSubCategory = 'All';

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

  retryFetch() {
    this.error = null;
    this.loadListings();
  }

  loadListings() {
    const listingsCollection = collection(this.firestore, 'listings');
    const listingsQuery = query(
      listingsCollection,
      where('category', '==', 'Residential'),
      where('approved', '==', true),
      where('sold', '==', false)
    );

    this.listingsSubscription = collectionData(listingsQuery, { idField: 'id' })
      .subscribe({
        next: (data) => {
          this.listings = data as ResidentialListing[];
          this.filterBySubCategory(this.selectedSubCategory);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error fetching listings:', error);
          this.isLoading = false;
        }
      });
  }

  navigateToPropertyDetails(listingId: string): void {
    this.router.navigate(['/property', listingId]);
  }
  
  filterBySubCategory(subCategory: string) {
    this.selectedSubCategory = subCategory;
    this.filteredListings = subCategory === 'All'
      ? this.listings
      : this.listings.filter(listing => listing.subCategory === subCategory);
  }

  ngOnDestroy() {
    if (this.listingsSubscription) {
      this.listingsSubscription.unsubscribe();
    }
    
    // Disconnect observer when component is destroyed
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}
