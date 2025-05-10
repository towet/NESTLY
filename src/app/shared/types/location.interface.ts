export interface Location {
    id: string;
    name: string;
    type: LocationType;
    description: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
    address: {
      street?: string;
      city: string;
      state: string;
      country: string;
      postalCode?: string;
    };
    boundaries?: {
      type: 'Polygon';
      coordinates: number[][][];
    };
    properties: {
      total: number;
      available: number;
      averagePrice: number;
      priceRange: {
        min: number;
        max: number;
      };
    };
    amenities: {
      schools: number;
      hospitals: number;
      parks: number;
      restaurants: number;
      shopping: number;
      transportation: number;
    };
    demographics?: {
      population: number;
      medianAge: number;
      medianIncome: number;
      crimeRate?: number;
    };
    stats: {
      walkScore?: number;
      transitScore?: number;
      safetyScore?: number;
    };
    trends: {
      propertyValue: {
        current: number;
        yearAgo: number;
        fiveYearsAgo: number;
      };
      rentPrice: {
        current: number;
        yearAgo: number;
        fiveYearsAgo: number;
      };
    };
    images: {
      url: string;
      caption?: string;
      type: 'primary' | 'gallery';
    }[];
    tags: string[];
    featured: boolean;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export type LocationType = 
    | 'city'
    | 'neighborhood'
    | 'district'
    | 'suburb'
    | 'area'
    | 'development';
  
  export interface LocationFilter {
    type?: LocationType[];
    priceRange?: {
      min?: number;
      max?: number;
    };
    amenities?: {
      minSchools?: number;
      minHospitals?: number;
      minParks?: number;
      minRestaurants?: number;
      minShopping?: number;
    };
    stats?: {
      minWalkScore?: number;
      minTransitScore?: number;
      minSafetyScore?: number;
    };
    demographics?: {
      minPopulation?: number;
      maxPopulation?: number;
      minMedianIncome?: number;
    };
    sortBy?: 'popularity' | 'propertyCount' | 'averagePrice' | 'safetyScore';
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }
  