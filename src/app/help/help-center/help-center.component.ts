import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';

interface HelpCategory {
  id: string;
  title: string;
  icon: string;
  description: string;
  articles: number;
}

interface PopularArticle {
  id: string;
  title: string;
  category: string;
  views: number;
}

@Component({
  selector: 'app-help-center',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, HeaderComponent, FooterComponent],
  templateUrl: './help-center.component.html',
  styleUrls: ['./help-center.component.scss']
})
export class HelpCenterComponent implements OnInit {
  searchQuery: string = '';
  isLoading: boolean = false;

  helpCategories: HelpCategory[] = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: 'fas fa-rocket',
      description: 'Learn the basics of using our platform',
      articles: 12
    },
    {
      id: 'property-search',
      title: 'Property Search',
      icon: 'fas fa-search',
      description: 'Tips for finding the perfect property',
      articles: 8
    },
    {
      id: 'booking-stays',
      title: 'Booking & Stays',
      icon: 'fas fa-calendar-alt',
      description: 'Information about bookings and reservations',
      articles: 15
    },
    {
      id: 'payments',
      title: 'Payments & Billing',
      icon: 'fas fa-credit-card',
      description: 'Understanding payments and billing processes',
      articles: 10
    },
    {
      id: 'account',
      title: 'Account Management',
      icon: 'fas fa-user-circle',
      description: 'Manage your account settings and preferences',
      articles: 6
    },
    {
      id: 'safety',
      title: 'Safety & Security',
      icon: 'fas fa-shield-alt',
      description: 'Learn about our safety measures and policies',
      articles: 9
    }
  ];

  popularArticles: PopularArticle[] = [
    {
      id: '1',
      title: 'How to book a property',
      category: 'Booking & Stays',
      views: 1520
    },
    {
      id: '2',
      title: 'Payment methods accepted',
      category: 'Payments & Billing',
      views: 1350
    },
    {
      id: '3',
      title: 'Cancellation policy',
      category: 'Booking & Stays',
      views: 1280
    },
    {
      id: '4',
      title: 'Creating an account',
      category: 'Getting Started',
      views: 980
    }
  ];

  quickLinks = [
    {
      title: 'Contact Support',
      description: 'Get help from our support team',
      icon: 'fas fa-headset',
      route: '/help/contact-support'
    },
    {
      title: 'FAQs',
      description: 'Browse frequently asked questions',
      icon: 'fas fa-question-circle',
      route: '/help/faq'
    },
    {
      title: 'User Guide',
      description: 'Download our comprehensive user guide',
      icon: 'fas fa-book',
      route: '/help/user-guide'
    }
  ];

  constructor() {}

  ngOnInit() {}

  onSearch(event: Event) {
    event.preventDefault();
    if (this.searchQuery.trim()) {
      // Implement search functionality
      console.log('Searching for:', this.searchQuery);
    }
  }

  getCategoryUrl(categoryId: string): string {
    return `/help/categories/${categoryId}`;
  }

  getArticleUrl(articleId: string): string {
    return `/help/articles/${articleId}`;
  }

  formatViews(views: number): string {
    return views >= 1000 ? `${(views / 1000).toFixed(1)}k` : views.toString();
  }
}
