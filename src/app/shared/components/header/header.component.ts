import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  // Mobile / Desktop detection
  isMobile = false;

  // Flags for showing/hiding parts of the header
  isMobileMenuOpen = false;
  isSearchExpanded = false;
  openMobileSubMenu: string | null = null;
  
  // Scroll behavior
  isScrolled = false;

  // Additional properties for search functionality
  search = { location: '' };
  searchCoordinates: any = null;  // Define appropriate type if available

  constructor(private breakpointObserver: BreakpointObserver) {}

  ngOnInit() {
    // Listen for screen size changes
    this.breakpointObserver.observe([Breakpoints.Handset])
      .subscribe(result => {
        this.isMobile = result.matches;
        if (!this.isMobile) {
          // Force-close the mobile menu if switching to desktop
          this.isMobileMenuOpen = false;
        }
      });
      
    // Initialize scroll state
    this.isScrolled = window.scrollY > 10;
  }

  // Toggle entire mobile menu with improved body scroll management
  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    
    // Reset submenu state when closing the menu
    if (!this.isMobileMenuOpen) {
      this.openMobileSubMenu = null;
    }
    
    // Prevent body scrolling when menu is open
    if (this.isMobileMenuOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    
    // Close search panel if menu is opened
    if (this.isMobileMenuOpen && this.isSearchExpanded) {
      this.isSearchExpanded = false;
    }
  }

  // Toggle a specific sub-menu in mobile nav
  toggleMobileSubMenu(menu: string) {
    this.openMobileSubMenu = (this.openMobileSubMenu === menu) ? null : menu;
  }

  // Toggle the top search bar on mobile
  toggleSearch() {
    this.isSearchExpanded = !this.isSearchExpanded;
    
    // Close mobile menu if search is opened
    if (this.isSearchExpanded && this.isMobileMenuOpen) {
      this.isMobileMenuOpen = false;
    }
    
    // Optionally reset the search field if closed
    if (!this.isSearchExpanded) {
      this.search.location = '';
      this.searchCoordinates = null;
    }
  }

  // Stub for handling input events on the search field
  onLocationInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.search.location = value;
    // Add your location lookup logic here
    
    // Simulate coordinates when typing (sample only)
    this.searchCoordinates = value.length > 3 ? { lat: 0, lng: 0 } : null;
  }

  // Stub for performing search when the search button is clicked
  performSearch() {
    if (!this.search.location.trim()) return;
    
    // Add logic to validate and execute the search
    console.log('Search initiated for:', this.search.location);
    
    // Close the search panel after searching
    this.isSearchExpanded = false;
  }

  // Handle scroll events
  @HostListener('window:scroll', ['$event'])
  onWindowScroll() {
    // Update header style based on scroll position
    const scrollPosition = window.scrollY;
    this.isScrolled = scrollPosition > 10;
    
    // Auto-close mobile components on scroll
    if (scrollPosition > 50) {
      if (this.isMobileMenuOpen) {
        this.isMobileMenuOpen = false;
      }
      if (this.isSearchExpanded) {
        this.isSearchExpanded = false;
      }
    }
  }
}
