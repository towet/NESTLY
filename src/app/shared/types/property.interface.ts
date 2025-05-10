export interface Property {
    id: string;
    title: string;
    description: string;
    type: PropertyType;
    category: PropertyCategory;
    status: PropertyStatus;
    price: number;
    priceUnit: 'night' | 'month' | 'year';
    location: {
      address: string;
      city: string;
      state: string;
      country: string;
      postalCode: string;
      coordinates: {
        latitude: number;
        longitude: number;
      };
    };
    features: {
      bedrooms: number;
      bathrooms: number;
      area: number;
      areaUnit: 'sqft' | 'sqm';
      furnished: boolean;
      parking: boolean;
      yearBuilt?: number;
    };
    amenities: string[];
    images: {
      url: string;
      caption?: string;
      isPrimary: boolean;
    }[];
    virtualTour?: string;
    floorPlan?: string;
    availability: {
      availableFrom: Date;
      availableTo?: Date;
      minimumStay?: number;
      maximumStay?: number;
    };
    rules: {
      petsAllowed: boolean;
      smokingAllowed: boolean;
      eventsAllowed: boolean;
      additionalRules?: string[];
    };
    ratings: {
      overall: number;
      cleanliness: number;
      accuracy: number;
      communication: number;
      location: number;
      value: number;
      totalReviews: number;
    };
    owner: {
      id: string;
      name: string;
      avatar?: string;
      responseRate?: number;
      responseTime?: string;
      memberSince: Date;
    };
    fees: {
      cleaningFee?: number;
      serviceFee?: number;
      securityDeposit?: number;
      additionalFees?: {
        name: string;
        amount: number;
      }[];
    };
    createdAt: Date;
    updatedAt: Date;
    views: number;
    favorites: number;
  }

  
  
  export type PropertyType = 
    | 'apartment'
    | 'house'
    | 'villa'
    | 'condo'
    | 'townhouse'
    | 'studio'
    | 'office'
    | 'retail'
    | 'industrial'
    | 'land';
  
  export type PropertyCategory = 
    | 'residential'
    | 'commercial'
    | 'industrial'
    | 'land';
  
  export type PropertyStatus = 
    | 'available'
    | 'unavailable'
    | 'pending'
    | 'reserved'
    | 'maintenance';
  
  export interface PropertyFilter {
    type?: PropertyType[];
    category?: PropertyCategory[];
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
    features?: {
      minBedrooms?: number;
      minBathrooms?: number;
      minArea?: number;
      furnished?: boolean;
      parking?: boolean;
    };
    amenities?: string[];
    availability?: {
      startDate?: Date;
      endDate?: Date;
      minimumStay?: number;
    };
    sortBy?: 'price' | 'rating' | 'newest' | 'popularity';
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }
  