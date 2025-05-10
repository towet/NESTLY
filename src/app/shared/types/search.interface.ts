export interface SearchQuery {
    keyword: string;
    filters: SearchFilters;
    pagination: PaginationParams;
    sorting: SortingParams;
  }
  
  export interface SearchFilters {
    propertyType?: string[];
    propertyCategory?: string[];
    priceRange?: {
      min?: number;
      max?: number;
    };
    location?: {
      city?: string;
      state?: string;
      country?: string;
      radius?: number;
      coordinates?: {
        latitude: number;
        longitude: number;
      };
    };
    dates?: {
      checkIn?: Date;
      checkOut?: Date;
    };
    guests?: {
      adults?: number;
      children?: number;
      infants?: number;
    };
    features?: {
      bedrooms?: number;
      bathrooms?: number;
      minArea?: number;
      maxArea?: number;
      furnished?: boolean;
      parking?: boolean;
    };
    amenities?: string[];
    ratings?: {
      min?: number;
      max?: number;
    };
  }
  
  export interface PaginationParams {
    page: number;
    limit: number;
    offset?: number;
  }
  
  export interface SortingParams {
    field: string;
    order: 'asc' | 'desc';
  }
  
  export interface SearchResults<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasMore: boolean;
  }
  
  export interface SearchSuggestion {
    id: string;
    type: 'property' | 'location' | 'amenity' | 'keyword';
    text: string;
    category?: string;
    highlight?: {
      start: number;
      end: number;
    };
    metadata?: {
      [key: string]: any;
    };
  }
  
  export interface RecentSearch {
    id: string;
    query: string;
    filters: SearchFilters;
    timestamp: Date;
    results: number;
  }
  
  export interface SavedSearch {
    id: string;
    name: string;
    query: SearchQuery;
    notifications: boolean;
    frequency?: 'daily' | 'weekly' | 'monthly';
    createdAt: Date;
    updatedAt: Date;
  }
  