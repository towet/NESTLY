import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { Firestore, collection, query, where, collectionData } from '@angular/fire/firestore';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

interface ShortStayListing {
  id: string;
  title: string;
  nightlyRate: number;
  location: string;
  subCategory: string;
  images: string[];
  bedrooms?: number;
  bathrooms?: number;
  area?: number; // Added area property for square footage
  amenities: {
    wifi: boolean;
    parking: boolean;
    pool: boolean;
    ac: boolean;
    [key: string]: boolean;
  };
  rating?: number;
  reviewsCount?: number;
  approved: boolean;
  sold: boolean;
}


@Component({
  selector: 'app-serviced-apartments',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent],
  template: `
    <div class="serviced-wrapper">
      <app-header></app-header>

      <!-- Enhanced hero section with background image and interactive animations -->
      <div class="hero-section" style="padding-top: 190px;">
        <!-- Parallax background image with overlay -->
        <div class="hero-background"></div>
        
        <!-- Animated shape decorations -->
        <div class="shape-container">
          <div class="shape shape-1"></div>
          <div class="shape shape-2"></div>
          <div class="shape shape-3"></div>
        </div>
        
        <!-- Content with animated text effects -->
        <div class="hero-content max-w-7xl mx-auto px-4 py-24 md:py-32 relative z-10">
          <div class="text-container">
            <!-- Animated badge -->
            <div class="premium-badge">
              <span class="badge-icon">★</span>
              <span class="badge-text">Premium Experience</span>
            </div>
            
            <!-- Animated heading with highlight effect -->
            <h1 class="hero-title">
              <span class="text-reveal">Luxury</span>
              <span class="text-reveal delay-1">Serviced</span>
              <span class="text-reveal delay-2">Apartments</span>
            </h1>
            
            <!-- Animated description with typing effect -->
            <p class="hero-description">
              Experience the perfect blend of hotel luxury and home comfort in our
              <span class="highlight">premium selection</span> of serviced apartments.
            </p>
            
            <!-- Call to action buttons removed -->
          </div>
          
          <!-- Stats counter with animation -->
          <div class="stats-container">
            <div class="stat-item">
              <div class="stat-value">500<span class="stat-plus">+</span></div>
              <div class="stat-label">Apartments</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">20<span class="stat-plus">+</span></div>
              <div class="stat-label">Locations</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">4.9</div>
              <div class="stat-label">Average Rating</div>
            </div>
          </div>
        </div>
        
        <!-- Scroll indicator -->
        <div class="scroll-indicator">
          <div class="scroll-icon">
            <i class="fas fa-chevron-down"></i>
          </div>
          <div class="scroll-text">Scroll to explore</div>
        </div>
      </div>

      <!-- Loading State -->
      <div class="loading-container" *ngIf="isLoading">
        <div class="spinner"></div>
        <p>Finding your perfect short-term stay...</p>
      </div>

      <!-- Error State -->
      <div class="error-container" *ngIf="error">
        <div class="error-card">
          <i class="fas fa-exclamation-circle text-red-500 text-4xl mb-4"></i>
          <h2 class="text-xl font-bold mb-2">Something went wrong</h2>
          <p class="mb-4">{{ error }}</p>
          <button (click)="retryFetch()" class="retry-button">
            <i class="fas fa-redo mr-2"></i>Try Again
          </button>
        </div>
      </div>

      <!-- Main Content -->
      <main class="content-container" *ngIf="!isLoading && !error">
        <div class="max-w-7xl mx-auto px-4 py-8 md:py-12">
          <!-- Subcategory Filter -->
          <div class="filter-container">
            <div class="filter-label">
              <i class="fas fa-filter text-indigo-600 mr-2"></i>
              <span>Filter by:</span>
            </div>
            <div class="filter-buttons">
              <button 
                *ngFor="let subCat of subCategories"
                (click)="filterBySubCategory(subCat)"
                [class.active]="selectedSubCategory === subCat"
                class="filter-button">
                {{ subCat }}
              </button>
            </div>
          </div>

          <!-- Listings Grid -->
          <div class="listings-grid">
            <div *ngFor="let listing of filteredListings" 
                 class="listing-card"
                 (click)="navigateToPropertyDetails(listing.id)"
                 [attr.data-id]="listing.id"
                 role="button"
                 tabindex="0"
                 (keydown.enter)="navigateToPropertyDetails(listing.id)">
              
              <!-- Premium tag -->
              <div class="premium-tag" *ngIf="listing.rating && listing.rating > 4.5">
                <i class="fas fa-crown"></i> Premium
              </div>
              
              <!-- Image Section -->
              <div class="image-wrapper">
                <img [src]="listing.images[0] || defaultImage"
                     [alt]="listing.title"
                     class="listing-image"
                     loading="lazy">
                     
                <!-- Rating Badge -->
                <div *ngIf="listing.rating" class="rating-badge">
                  <i class="fas fa-star"></i>
                  <span>{{ listing.rating.toFixed(1) }}</span>
                  <span *ngIf="listing.reviewsCount" class="reviews-count">({{ listing.reviewsCount }})</span>
                </div>
                
                <!-- Image Decoration -->
                <div class="image-decoration"></div>
                
                <!-- Overlay -->
                <div class="listing-overlay">
                  <span class="view-details">
                    <i class="fas fa-search-plus mr-2"></i>View Details
                  </span>
                </div>
              </div>
              
              <!-- Content -->
              <div class="info-wrapper">
                <h2 class="listing-title">{{ listing.title }}</h2>
                
                <div class="pricing-section">
                  <p class="listing-price">
                    KES {{ listing.nightlyRate.toLocaleString() }}
                  </p>
                  <span class="per-night">per night</span>
                </div>
                
                <div class="listing-details">
                  <!-- Circular icons similar to screenshot -->
                  <div class="details-wrapper">
                    <!-- Bedrooms -->
                    <div class="detail-circle bed" *ngIf="listing.bedrooms">
                      <i class="fas fa-bed"></i>
                      <span class="detail-value">{{ listing.bedrooms }}</span>
                    </div>
                    
                    <!-- Bathrooms -->
                    <div class="detail-circle bath" *ngIf="listing.bathrooms">
                      <i class="fas fa-bath"></i>
                      <span class="detail-value">{{ listing.bathrooms }}</span>
                    </div>
                    
                    <!-- Area if available -->
                    <div class="detail-circle area" *ngIf="listing.area">
                      <i class="fas fa-vector-square"></i>
                      <span class="detail-value">{{ listing.area }}sq ft</span>
                    </div>
                  </div>
                  
                  <!-- Location (as a separate element like in screenshot) -->
                  <div class="location-badge">
                    <div class="location-icon">
                      <i class="fas fa-map-marker-alt"></i>
                    </div>
                    <span class="location-text">{{ listing.location }}</span>
                  </div>
                </div>
        
                <!-- Amenities -->
                <div class="amenities-wrapper">
                  <div *ngIf="listing.amenities['wifi']" class="amenity-tag wifi">
                    <i class="fas fa-wifi"></i> WiFi
                  </div>
                  <div *ngIf="listing.amenities['parking']" class="amenity-tag parking">
                    <i class="fas fa-parking"></i> Parking
                  </div>
                  <div *ngIf="listing.amenities['pool']" class="amenity-tag pool">
                    <i class="fas fa-swimming-pool"></i> Pool
                  </div>
                  <div *ngIf="listing.amenities['ac']" class="amenity-tag ac">
                    <i class="fas fa-snowflake"></i> AC
                  </div>
                </div>
                
                <!-- Call to action -->
                <div class="card-action">
                  <span class="action-button">
                    <i class="fas fa-arrow-right"></i>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- No Results -->
          <div *ngIf="filteredListings.length === 0" class="no-results">
            <i class="fas fa-search text-indigo-300 text-5xl mb-4"></i>
            <h3 class="text-xl font-semibold mb-2">No listings found</h3>
            <p>We couldn't find any listings in this category.</p>
            <button (click)="filterBySubCategory('All')" class="reset-filter">
              <i class="fas fa-undo mr-2"></i>Show all listings
            </button>
          </div>
        </div>
      </main>

      <app-footer></app-footer>
    </div>
  `,
  styles: [`
    /* Main container styles */
    .serviced-wrapper {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background-color: #f8fafc;
    }

    /* Modern stylish hero section with background image and animations */
    .hero-section {
      position: relative;
      height: 80vh;
      min-height: 600px;
      width: 100%;
      overflow: hidden;
      margin-top: 3.5rem;
      display: flex;
      align-items: center;
      justify-content: center;

      /* Parallax background with luxury apartment image */
      .hero-background {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-image: linear-gradient(rgba(20, 10, 60, 0.7), rgba(45, 10, 80, 0.8)), 
                         url('/assets/unsplash.jpg'); /* A luxury apartment image */
        background-size: cover;
        background-position: center;
        background-attachment: fixed;
        transform: scale(1.1); /* Slight scale for parallax effect */
        animation: hero-zoom 15s ease-in-out infinite alternate;
      }
      
      /* Animated floating shapes for modern feel */
      .shape-container {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        overflow: hidden;
        pointer-events: none;
        
        .shape {
          position: absolute;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(5px);
          
          &.shape-1 {
            top: 10%;
            left: 10%;
            width: 150px;
            height: 150px;
            animation: float-shape 10s ease-in-out infinite;
          }
          
          &.shape-2 {
            bottom: 20%;
            right: 15%;
            width: 180px;
            height: 180px;
            animation: float-shape 15s ease-in-out infinite reverse;
          }
          
          &.shape-3 {
            top: 60%;
            left: 20%;
            width: 100px;
            height: 100px;
            animation: float-shape 12s ease-in-out infinite 2s;
          }
        }
      }
      
      /* Main content container */
      .hero-content {
        display: flex;
        flex-direction: column;
        justify-content: center;
        color: white;
        z-index: 10;
        width: 100%;
        padding: 2rem;
        
        @media (min-width: 768px) {
          flex-direction: row;
          align-items: center;
          gap: 4rem;
        }
        
        /* Text section styling */
        .text-container {
          flex: 1;
          max-width: 700px;
        }
        
        /* Premium badge styling */
        .premium-badge {
          display: inline-flex;
          align-items: center;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 30px;
          padding: 0.5rem 1rem;
          margin-bottom: 1.5rem;
          border: 1px solid rgba(255, 255, 255, 0.2);
          animation: badge-appear 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards;
          transform: translateY(20px);
          opacity: 0;
          
          .badge-icon {
            color: #fbbf24;
            margin-right: 0.5rem;
            animation: star-pulse 2s infinite;
          }
          
          .badge-text {
            font-size: 0.875rem;
            font-weight: 500;
            letter-spacing: 0.05em;
          }
        }
        
        /* Hero title with reveal animation */
        .hero-title {
          font-size: 3rem;
          font-weight: 800;
          line-height: 1.1;
          margin-bottom: 1.5rem;
          display: flex;
          flex-direction: column;
          
          @media (min-width: 768px) {
            font-size: 4.5rem;
          }
          
          .text-reveal {
            overflow: hidden;
            position: relative;
            display: inline-block;
            transform: translateY(100%);
            opacity: 0;
            animation: text-reveal 1.2s cubic-bezier(0.77, 0, 0.175, 1) forwards;
            
            &::after {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              background: linear-gradient(90deg, #8b5cf6, #6366f1);
              transform: translateX(-100%);
              animation: text-reveal-mask 1.2s cubic-bezier(0.77, 0, 0.175, 1) forwards;
            }
            
            &.delay-1 {
              animation-delay: 0.3s;
              &::after { animation-delay: 0.3s; }
            }
            
            &.delay-2 {
              animation-delay: 0.6s;
              &::after { animation-delay: 0.6s; }
            }
          }
        }
        
        /* Description text with typing animation */
        .hero-description {
          font-size: 1.125rem;
          line-height: 1.6;
          margin-bottom: 2rem;
          max-width: 600px;
          opacity: 0;
          animation: fade-in 1s ease-out 1.2s forwards;
          
          .highlight {
            position: relative;
            display: inline-block;
            color: #a5b4fc;
            font-weight: 600;
            
            &::after {
              content: '';
              position: absolute;
              bottom: 0;
              left: 0;
              width: 100%;
              height: 2px;
              background: #a5b4fc;
              transform: scaleX(0);
              transform-origin: right;
              transition: transform 0.5s cubic-bezier(0.77, 0, 0.175, 1);
              animation: line-reveal 0.8s cubic-bezier(0.77, 0, 0.175, 1) 1.8s forwards;
            }
          }
        }
        
        /* Call to action buttons */
        .cta-container {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          margin-top: 2rem;
          opacity: 0;
          transform: translateY(20px);
          animation: fade-up 0.8s ease-out 1.5s forwards;
        }
        
        .cta-button {
          padding: 0.875rem 1.5rem;
          border-radius: 50px;
          font-weight: 600;
          font-size: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
          outline: none;
          border: none;
          overflow: hidden;
          position: relative;
          
          &::after {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 100px;
            height: 100px;
            background-color: rgba(255, 255, 255, 0.2);
            border-radius: 50%;
            transform: scale(0) translate(-50%, -50%);
            transform-origin: top left;
            opacity: 0;
          }
          
          &:hover::after {
            opacity: 1;
            transform: scale(2.5) translate(-50%, -50%);
            transition: transform 0.8s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.8s;
          }
          
          &.explore-btn {
            background: white;
            color: #4338ca;
            
            &:hover {
              box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2);
              transform: translateY(-3px);
              
              i {
                transform: translateX(3px);
              }
            }
            
            i {
              transition: transform 0.3s ease;
            }
          }
          
          &.contact-btn {
            background: transparent;
            color: white;
            border: 1px solid rgba(255, 255, 255, 0.5);
            
            &:hover {
              background: rgba(255, 255, 255, 0.1);
              border-color: white;
            }
          }
        }
      }
      
      /* Stats counter section */
      .stats-container {
        display: flex;
        flex-direction: column;
        gap: 2rem;
        margin-top: 2rem;
        
        @media (min-width: 768px) {
          flex-direction: row;
          flex: 0 0 auto;
          max-width: 300px;
          flex-wrap: wrap;
          margin-top: 0;
        }
        
        .stat-item {
          text-align: center;
          opacity: 0;
          transform: translateY(20px);
          animation: fade-up 0.8s ease-out forwards;
          
          &:nth-child(1) { animation-delay: 1.7s; }
          &:nth-child(2) { animation-delay: 1.9s; }
          &:nth-child(3) { animation-delay: 2.1s; }
          
          .stat-value {
            font-size: 2.5rem;
            font-weight: 800;
            color: white;
            margin-bottom: 0.5rem;
            position: relative;
            display: inline-block;
            
            .stat-plus {
              font-size: 1.5rem;
              position: absolute;
              top: 0;
              right: -15px;
              color: #a5b4fc;
            }
          }
          
          .stat-label {
            font-size: 0.875rem;
            color: rgba(255, 255, 255, 0.7);
            font-weight: 500;
          }
        }
      }
      
      /* Scroll indicator at bottom of hero */
      .scroll-indicator {
        position: absolute;
        bottom: 2rem;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        flex-direction: column;
        align-items: center;
        color: white;
        opacity: 0;
        animation: fade-in 1s ease-out 2.5s forwards;
        
        .scroll-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(5px);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 0.5rem;
          animation: bounce 2s infinite;
          
          i {
            font-size: 0.875rem;
          }
        }
        
        .scroll-text {
          font-size: 0.75rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          opacity: 0.7;
        }
      }
    }

    /* Loading state with animation */
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 400px;
      background: white;
      border-radius: 1rem;
      margin: 2rem auto;
      max-width: 500px;
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05);
      padding: 2rem;

      p {
        margin-top: 1.5rem;
        color: #6366f1;
        font-weight: 500;
      }

      .spinner {
        width: 60px;
        height: 60px;
        border: 4px solid rgba(99, 102, 241, 0.1);
        border-left-color: #6366f1;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }
    }

    /* Error state styling */
    .error-container {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 3rem 1rem;

      .error-card {
        background: white;
        border-radius: 1rem;
        padding: 2rem;
        max-width: 500px;
        width: 100%;
        text-align: center;
        box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1);

        .retry-button {
          background: #6366f1;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 0.5rem;
          font-weight: 500;
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          cursor: pointer;

          &:hover {
            background: #4f46e5;
            transform: translateY(-2px);
          }
        }
      }
    }

    /* Filter container with animations */
    .filter-container {
      background: white;
      border-radius: 1rem;
      padding: 1rem 1.5rem;
      margin-bottom: 2rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
      position: relative;
      overflow: hidden;
      
      /* Subtle animated background effect */
      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 50%;
        height: 100%;
        background: linear-gradient(
          to right,
          rgba(255, 255, 255, 0) 0%,
          rgba(255, 255, 255, 0.3) 50%,
          rgba(255, 255, 255, 0) 100%
        );
        animation: shine 6s infinite linear;
        pointer-events: none;
      }

      .filter-label {
        display: flex;
        align-items: center;
        font-weight: 500;
        color: #4b5563;
        
        i {
          animation: pulse 2s infinite;
        }
      }

      .filter-buttons {
        display: flex;
        flex-wrap: wrap;
        gap: 0.75rem;

        .filter-button {
          padding: 0.5rem 1rem;
          border-radius: 2rem;
          font-size: 0.875rem;
          font-weight: 500;
          transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
          background: #f3f4f6;
          color: #4b5563;
          border: none;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          z-index: 1;
          
          /* Animation for appearance */
          &.filter-animate-prepared {
            opacity: 0;
            transform: translateY(20px);
          }
          
          &.filter-animate-in {
            opacity: 1;
            transform: translateY(0);
          }

          /* Hover ripple effect */
          &::after {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 5px;
            height: 5px;
            background: rgba(255, 255, 255, 0.5);
            opacity: 0;
            border-radius: 100%;
            transform: scale(1, 1) translate(-50%, -50%);
            transform-origin: 50% 50%;
            z-index: -1;
          }
          
          &:hover {
            background: #e5e7eb;
            transform: translateY(-3px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            
            &::after {
              animation: ripple 1s ease-out;
            }
          }

          &.active {
            background: #6366f1;
            color: white;
            box-shadow: 0 4px 6px -1px rgba(99, 102, 241, 0.4);
            
            &:hover {
              background: #4f46e5;
            }
          }
        }
      }
    }

    /* Modern grid layout for listings */
    .listings-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 2rem;
      padding: 0.5rem;
      margin-bottom: 3rem;
    }

    /* Stylish card design with hover effects and scroll reveal animations */
    .listing-card {
      position: relative;
      background: white;
      border-radius: 1rem;
      overflow: hidden;
      transition: all 0.5s cubic-bezier(0.22, 1, 0.36, 1);
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
      cursor: pointer;
      height: 100%;
      display: flex;
      flex-direction: column;
      will-change: transform, opacity, box-shadow;
      
      /* Prepare for animation on scroll */
      &.animate-prepared {
        opacity: 0;
        transform: translateY(40px);
      }
      
      /* Animation when element enters viewport */
      &.animate-in {
        opacity: 1;
        transform: translateY(0);
      }

      &:hover {
        transform: translateY(-8px) scale(1.01);
        box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04);

        .listing-overlay {
          opacity: 1;
        }

        .listing-image {
          transform: scale(1.05);
        }

        .action-button {
          transform: rotate(45deg);
        }

        .image-decoration {
          width: 150%;
          opacity: 0.8;
        }
        
        .detail-circle {
          transform: scale(1.1);
          
          &:nth-child(1) { transition-delay: 0s; }
          &:nth-child(2) { transition-delay: 0.05s; }
          &:nth-child(3) { transition-delay: 0.1s; }
        }
      }

      &:focus {
        outline: none;
        box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.5), 0 20px 25px -5px rgba(0,0,0,0.1);
      }

      /* Premium tag styling */
      .premium-tag {
        position: absolute;
        top: 12px;
        left: 0;
        background: linear-gradient(90deg, #f59e0b, #d97706);
        color: white;
        padding: 0.25rem 0.75rem 0.25rem 1rem;
        font-size: 0.75rem;
        font-weight: 600;
        border-radius: 0 2rem 2rem 0;
        display: flex;
        align-items: center;
        gap: 0.25rem;
        z-index: 10;
        box-shadow: 0 4px 6px -1px rgba(245, 158, 11, 0.5);

        i {
          font-size: 0.7rem;
          color: #fef3c7;
        }
      }

      /* Image section styling */
      .image-wrapper {
        position: relative;
        height: 220px;
        overflow: hidden;

        .listing-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        /* Decorative element for visual appeal */
        .image-decoration {
          position: absolute;
          bottom: -20px;
          left: -20px;
          width: 100%;
          height: 70px;
          background: linear-gradient(135deg, rgba(255,255,255,0.2), transparent);
          transform: rotate(-10deg);
          transition: all 0.5s ease;
          opacity: 0.5;
          z-index: 1;
        }

        /* Enhanced rating badge */
        .rating-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          background: white;
          padding: 0.35rem 0.75rem;
          border-radius: 2rem;
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-weight: 600;
          font-size: 0.875rem;
          color: #1f2937;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          z-index: 2;

          i {
            color: #f59e0b;
          }

          .reviews-count {
            font-size: 0.7rem;
            opacity: 0.7;
            font-weight: normal;
          }
        }

        /* Overlay with transparent details button */
        .listing-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(to top, rgba(0,0,0,0.7), transparent 70%);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s ease;

          .view-details {
            position: absolute;
            bottom: 15px;
            left: 50%;
            transform: translateX(-50%);
            color: white;
            font-weight: 500;
            font-size: 0.875rem;
            padding: 0.5rem 1rem;
            border-radius: 2rem;
            background: rgba(255,255,255,0.2);
            backdrop-filter: blur(5px);
            border: 1px solid rgba(255,255,255,0.3);
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            gap: 0.5rem;

            &:hover {
              background: rgba(255,255,255,0.3);
              transform: translateX(-50%) scale(1.05);
            }
          }
        }
      }

      /* Content section styling */
      .info-wrapper {
        padding: 1.25rem;
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        position: relative;

        /* Title styling */
        .listing-title {
          font-size: 1.125rem;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 0.75rem;
          line-height: 1.3;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 2;
          overflow: hidden;
        }

        /* Pricing section */
        .pricing-section {
          display: flex;
          align-items: baseline;
          margin-bottom: 1rem;

          .listing-price {
            font-size: 1.25rem;
            font-weight: 700;
            background: linear-gradient(90deg, #6366f1, #8b5cf6);
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
            margin-right: 0.5rem;
          }

          .per-night {
            font-size: 0.75rem;
            color: #6b7280;
          }
        }

        /* Details section with circular icons (matching screenshot) */
        .listing-details {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-bottom: 1rem;

          /* Circular icons container */
          .details-wrapper {
            display: flex;
            gap: 0.75rem;
            margin-bottom: 0.5rem;
          }

          /* Circular icon style */
          .detail-circle {
            display: flex;
            align-items: center;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            justify-content: center;
            position: relative;
            
            i {
              color: white;
              font-size: 0.875rem;
            }
            
            .detail-value {
              position: absolute;
              right: -5px;
              top: -5px;
              background: white;
              border-radius: 50%;
              width: 20px;
              height: 20px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 0.75rem;
              font-weight: 700;
              color: #1f2937;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            
            /* Colors for different attributes */
            &.bed {
              background-color: #818cf8; /* Indigo */
              
              .detail-value {
                color: #4f46e5;
              }
            }
            
            &.bath {
              background-color: #38bdf8; /* Sky blue */
              
              .detail-value {
                color: #0284c7;
              }
            }
            
            &.area {
              background-color: #fb923c; /* Orange */
              
              .detail-value {
                color: #c2410c;
                font-size: 0.65rem;
                width: 24px;
                height: 24px;
              }
            }
          }
          
          /* Location badge (matching screenshot) */
          .location-badge {
            display: flex;
            align-items: center;
            margin-top: 0.25rem;
            
            .location-icon {
              display: flex;
              align-items: center;
              justify-content: center;
              width: 32px;
              height: 32px;
              background-color: #ec4899; /* Pink */
              border-radius: 50%;
              margin-right: 0.75rem;
              
              i {
                color: white;
                font-size: 0.875rem;
              }
            }
            
            .location-text {
              font-size: 0.875rem;
              color: #4b5563;
              font-weight: 500;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
              max-width: calc(100% - 40px);
            }
          }
        }

        /* Colorful amenities section */
        .amenities-wrapper {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-top: auto;
          padding-top: 0.75rem;

          .amenity-tag {
            padding: 0.25rem 0.75rem;
            border-radius: 2rem;
            font-size: 0.75rem;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 0.25rem;

            i {
              font-size: 0.75rem;
            }

            /* Different colors for different amenities */
            &.wifi {
              background: rgba(37, 99, 235, 0.1);
              color: #2563eb;
            }

            &.parking {
              background: rgba(5, 150, 105, 0.1);
              color: #059669;
            }

            &.pool {
              background: rgba(14, 165, 233, 0.1);
              color: #0ea5e9;
            }

            &.ac {
              background: rgba(168, 85, 247, 0.1);
              color: #a855f7;
            }
          }
        }

        /* Call to action button */
        .card-action {
          position: absolute;
          right: 1.25rem;
          bottom: 1.25rem;

          .action-button {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 2rem;
            height: 2rem;
            background: #6366f1;
            color: white;
            border-radius: 50%;
            transition: all 0.3s ease;
            box-shadow: 0 4px 6px rgba(99, 102, 241, 0.5);

            i {
              font-size: 0.875rem;
            }
          }
        }
      }
    }

    /* No results styling */
    .no-results {
      text-align: center;
      background: white;
      padding: 3rem 2rem;
      border-radius: 1rem;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
      margin: 1rem auto;
      max-width: 600px;
      color: #4b5563;

      .reset-filter {
        margin-top: 1.5rem;
        padding: 0.5rem 1.5rem;
        background: #6366f1;
        color: white;
        border-radius: 0.5rem;
        display: inline-flex;
        align-items: center;
        font-weight: 500;
        transition: all 0.2s ease;
        border: none;
        cursor: pointer;

        &:hover {
          background: #4f46e5;
          transform: translateY(-2px);
        }
      }
    }

    /* Animation keyframes for all effects */
    @keyframes bounce {
      0%, 100% {
        transform: translateY(0);
      }
      50% {
        transform: translateY(-5px);
      }
    }
    
    @keyframes pulse {
      0% {
        transform: scale(1);
        opacity: 1;
      }
      50% {
        transform: scale(1.1);
        opacity: 0.8;
      }
      100% {
        transform: scale(1);
        opacity: 1;
      }
    }
    
    @keyframes ripple {
      0% {
        transform: scale(0, 0);
        opacity: 0.5;
      }
      20% {
        transform: scale(25, 25);
        opacity: 0.5;
      }
      100% {
        opacity: 0;
        transform: scale(40, 40);
      }
    }
    
    @keyframes shine {
      0% {
        left: -100%;
      }
      100% {
        left: 150%;
      }
    }
    
    @keyframes float {
      0% {
        transform: translateY(0px);
      }
      50% {
        transform: translateY(-10px);
      }
      100% {
        transform: translateY(0px);
      }
    }
    
    /* Hero section specific animations */
    @keyframes hero-zoom {
      0% {
        transform: scale(1.1);
      }
      100% {
        transform: scale(1.2);
      }
    }
    
    @keyframes float-shape {
      0% {
        transform: translate(0, 0);
      }
      33% {
        transform: translate(15px, 10px) rotate(2deg);
      }
      66% {
        transform: translate(-10px, 15px) rotate(-2deg);
      }
      100% {
        transform: translate(0, 0);
      }
    }
    
    @keyframes badge-appear {
      0% {
        opacity: 0;
        transform: translateY(20px);
      }
      100% {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    @keyframes star-pulse {
      0%, 100% {
        opacity: 1;
        transform: scale(1);
      }
      50% {
        opacity: 0.7;
        transform: scale(1.2);
      }
    }
    
    @keyframes text-reveal {
      0% {
        transform: translateY(100%);
        opacity: 0;
      }
      100% {
        transform: translateY(0);
        opacity: 1;
      }
    }
    
    @keyframes text-reveal-mask {
      0% {
        transform: translateX(-100%);
      }
      50% {
        transform: translateX(0);
      }
      100% {
        transform: translateX(100%);
      }
    }
    
    @keyframes fade-in {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
    
    @keyframes fade-up {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    @keyframes line-reveal {
      from {
        transform: scaleX(0);
      }
      to {
        transform: scaleX(1);
      }
    }
  `]
})
export class ServicedApartmentsComponent implements OnInit, OnDestroy {
  listings: ShortStayListing[] = [];
  filteredListings: ShortStayListing[] = [];
  isLoading = true;
  private listingsSubscription?: Subscription;
  error: string | null = null;
  defaultImage = 'assets/placeholder.jpg';
  private observers: IntersectionObserver[] = [];
  private scrollAnimationApplied = false;

  subCategories = [
    'All',
    'Entire Homes',
    'Private Rooms',
    'Serviced Apartments',
    'Themed & Unique Stays',
    'Event & Party Spaces'
  ];
  selectedSubCategory = 'All';

  constructor(private firestore: Firestore,
    private router: Router
  ) {
    // Enable smooth scrolling for the whole page
    document.documentElement.style.scrollBehavior = 'smooth';
  }

  ngOnInit() {
    this.loadListings();
    
    // Add scroll event listener for parallax and other scroll effects
    window.addEventListener('scroll', this.handleScroll.bind(this));
  }

  loadListings() {
    const listingsCollection = collection(this.firestore, 'listings');
    const listingsQuery = query(
      listingsCollection,
      where('category', '==', 'Airbnb & Short-Term Rentals'),
      where('approved', '==', true),
      where('sold', '==', false)
    );

    this.listingsSubscription = collectionData(listingsQuery, { idField: 'id' })
      .subscribe({
        next: (data) => {
          this.listings = data as ShortStayListing[];
          this.filterBySubCategory(this.selectedSubCategory);
          this.isLoading = false;
          
          // Set up animations after a short delay to ensure DOM is ready
          setTimeout(() => {
            this.setupScrollAnimations();
          }, 500);
        },
        error: (error) => {
          console.error('Error fetching listings:', error);
          this.error = 'Failed to load listings. Please try again.';
          this.isLoading = false;
        }
      });
  }

  /**
   * Set up scroll animations using Intersection Observer API
   * This creates a staggered reveal effect as user scrolls down the page
   */
  setupScrollAnimations() {
    if (this.scrollAnimationApplied) return;
    this.scrollAnimationApplied = true;
    
    // Animate listing cards with staggered reveal
    const cards = document.querySelectorAll('.listing-card');
    if (cards.length > 0) {
      const cardObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
              // Add staggered delay based on index
              setTimeout(() => {
                entry.target.classList.add('animate-in');
              }, index * 100);
              cardObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
      );
      
      cards.forEach(card => {
        card.classList.add('animate-prepared');
        cardObserver.observe(card);
      });
      
      this.observers.push(cardObserver);
    }
    
    // Animate filter buttons with fade-in-up effect
    const filterButtons = document.querySelectorAll('.filter-button');
    if (filterButtons.length > 0) {
      const filterObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
              setTimeout(() => {
                entry.target.classList.add('filter-animate-in');
              }, index * 50);
              filterObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1 }
      );
      
      filterButtons.forEach(button => {
        button.classList.add('filter-animate-prepared');
        filterObserver.observe(button);
      });
      
      this.observers.push(filterObserver);
    }
    
    // Animate header content
    const headerContent = document.querySelector('.header-content');
    if (headerContent) {
      headerContent.classList.add('header-animate-in');
    }
  }
  
  /**
   * Handle scroll events for parallax and other effects
   */
  handleScroll() {
    // Parallax effect for header background
    const header = document.querySelector('.page-header');
    const scrollPosition = window.scrollY;
    
    if (header && scrollPosition < 500) {
      const translateY = scrollPosition * 0.3;
      header.setAttribute('style', `background-position: 0% ${50 + (translateY / 10)}%`);
    }
    
    // Only trigger setup once when user first scrolls
    if (!this.scrollAnimationApplied && scrollPosition > 100) {
      this.setupScrollAnimations();
    }
  }

  navigateToPropertyDetails(listingId: string): void {
    if (listingId) {
      this.router.navigate(['/property', listingId]);
    }
  }

  retryFetch() {
    this.error = null;
    this.isLoading = true;
    this.loadListings();
  }

  filterBySubCategory(subCategory: string) {
    this.selectedSubCategory = subCategory;
    this.filteredListings = subCategory === 'All'
      ? this.listings
      : this.listings.filter(listing => listing.subCategory === subCategory);
      
    // Reset animation flags to re-animate cards when filter changes
    setTimeout(() => {
      this.scrollAnimationApplied = false;
      this.setupScrollAnimations();
    }, 50);
  }

  ngOnDestroy() {
    // Clean up subscriptions and observers
    if (this.listingsSubscription) {
      this.listingsSubscription.unsubscribe();
    }
    
    // Clean up all intersection observers
    this.observers.forEach(observer => observer.disconnect());
    
    // Remove scroll listener
    window.removeEventListener('scroll', this.handleScroll.bind(this));
    
    // Reset scroll behavior
    document.documentElement.style.scrollBehavior = '';
  }
}
