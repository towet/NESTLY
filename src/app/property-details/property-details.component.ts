import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Firestore, doc,doc as docRef, getDoc, updateDoc, collection, query, where, limit, getDocs, DocumentData, QueryDocumentSnapshot, DocumentReference, serverTimestamp, addDoc } from '@angular/fire/firestore';
import { Subscription } from 'rxjs';
import { ShareModule } from 'ngx-sharebuttons';
import { NgImageSliderModule } from 'ng-image-slider';
import { NgbModule, NgbNavModule, NgbAccordionModule,NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AreaMapComponent } from '../shared/components/area-map/area-map.component';
import { PropertyService } from '../shared/services/property.service';
import { MapMarker } from '../shared/components/area-map/area-map.component';
import { AmenityService } from '../shared/services/amenity.service';
import { HeaderComponent } from '../shared/components/header/header.component';
import { FooterComponent } from '../shared/components/footer/footer.component';
import { ScheduleViewingModalComponent } from '../shared/components/schedule-viewing-modal/schedule-viewing-modal.component';
import { ReactiveFormsModule } from '@angular/forms';
import { LightboxModalComponent } from '../shared/components/lightbox-modal/lightbox-modal.component';
import { Timestamp } from 'firebase/firestore';



// Interfaces
interface GooglePlace {
  place_id: string;
  name: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  vicinity: string;
  rating?: number;
  user_ratings_total?: number;
  types: string[];
  opening_hours?: {
    open_now: boolean;
  };
  photos?: Array<{
    photo_reference: string;
    width: number;
    height: number;
  }>;
}

interface AmenityResponse {
  status: string;
  results: GooglePlace[];
}

interface AgentDocument extends DocumentData {
  name: string;
  photo: string;
  phone: string;
  email: string;
  [key: string]: any;
}


interface Property {
  id: string;
  title: string;
  description: string;
  price?: number;
  nightlyRate?: number;
  location: string;
  furnishing?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  images: string[];
  bedrooms: number;
  bathrooms: number;
  propertySize: number;
  amenities: string[];
  features: string[];
  propertyType: string;
  yearBuilt: number;
  parkingSpaces: number;
  isFeatured: boolean;
  category?: string;
  subCategory?: string;
  detail?: string;
  videos?: string[];
  agent: {
    id: string;
    name: string;
    photo: string;
    phone: string;
    email: string;
  };
  virtualTourUrl?: string;
  videoUrl?: string;
  floorPlanUrl?: string;
  documents?: {
    title: string;
    url: string;
  }[];
  nearbyPlaces?: Array<{
    type: string;
    name: string;
    distance: string;
  }>;
  [key: string]: any;
}

interface ImageObject {
  image: string;
  thumbImage: string;
  alt?: string;
  title?: string;
}

interface NearbyPlace {
  type: string;
  name: string;
  distance: string;
}

type AmenityType = 'School' | 'Hospital' | 'Grocery' | 'Bank' | 'PostOffice' | 'PublicTransport';

@Component({
  selector: 'app-property-details',
  standalone: true,
  imports: [
    CommonModule,
    ShareModule,
    NgImageSliderModule,
    NgbModule,
    NgbNavModule,
    NgbAccordionModule,
    HeaderComponent,
    FooterComponent,
    AreaMapComponent,
    ScheduleViewingModalComponent,
    ReactiveFormsModule,
    LightboxModalComponent
  ],
  templateUrl: './property-details.component.html',
  styleUrls: ['./property-details.component.scss']
})
export class PropertyDetailsComponent implements OnInit, OnDestroy {
  // Component properties
  propertyId: string | null = null;
  property: Property | null = null;
  isLoading = true;
  error: string | null = null;
  activeImageIndex = 0;
  showFullDescription = false;
  isFavorite = false;
  activeTab = 'overview';
  isLoadingAmenities = false;
  recommendedProperties: Property[] = [];

  // Map properties
  mapMarkers: MapMarker[] = [];
  mapCenter: [number, number] = [0, 0];
  mapZoom = 13;

  // Carousel configuration
  carouselConfig = {
    interval: 5000,
    pauseOnHover: true,
    showNavigationArrows: true,
    showNavigationIndicators: true
  };

  private routeSub: Subscription | null = null;

  // Property for accordion panels
  activePanels: string[] = ['description', 'details'];

  constructor(
    private route: ActivatedRoute,
    private propertyService: PropertyService,
    private router: Router,
    private firestore: Firestore,
    private modalService: NgbModal,
    private amenityService: AmenityService
  ) {}

  ngOnInit(): void {
    this.initializeProperty();
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
  }

  openGallery(startIndex: number = 0): void {
    if (!this.property?.images?.length) return;
  
    const modalRef = this.modalService.open(LightboxModalComponent, {
      size: 'xl',               // widest modal width
      centered: true,
      windowClass: 'lightbox-modal', // custom style hooks
      backdropClass: 'lightbox-backdrop',
    });
  
    modalRef.componentInstance.images = this.property.images;
    modalRef.componentInstance.startIndex = startIndex;
  }

  get agentOnline(): boolean {
    
    return true;
  }

  daysSince(ts: Timestamp | any): number {
    if (!ts) return 0;
    const created = (ts instanceof Timestamp)
      ? ts.toDate()
      : new Date(ts);
    const diff = Date.now() - created.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  /** Call vs SMS vs WhatsApp helpers */
  callAgent(): void {
    const phone = this.property?.agent.phone;
    if (phone) window.open(`tel:${phone}`, '_self');
  }

  messageAgent(): void {
    const phone = this.property?.agent.phone?.replace(/\D/g, '');
    if (phone) window.open(`https://wa.me/${phone}`, '_blank');
  }

  /** push a call‑back request into Firestore */
  async requestCallBack(): Promise<void> {
    if (!this.propertyId) return;
    try {
      const cbRef = collection(this.firestore, 'callBackRequests');
      await addDoc(cbRef, {
        listingId: this.propertyId,
        agentId: this.property?.agent.id,
        requestedAt: serverTimestamp(),
        status: 'pending'
      });
      alert('Your call‑back request has been sent.');
    } catch (err) {
      console.error(err);
      alert('Failed to send request. Please try again.');
    }
  }


  async scheduleViewing(): Promise<void> {
    try {
      const modalRef = this.modalService.open(ScheduleViewingModalComponent);
      modalRef.componentInstance.propertyId = this.propertyId;
      modalRef.componentInstance.agentId = this.property?.['agentId'];

      const result = await modalRef.result;
      
      if (result) {
        const appointmentData = {
          agentId: this.property?.['agentId'],
          listingId: this.propertyId,
          scheduledDateTime: new Date(result.scheduledDateTime),
          status: 'pending',
          visitorName: result.visitorName,
          visitorPhone: result.visitorPhone,
          createdAt: serverTimestamp()
        };

        const appointmentsRef = collection(this.firestore, 'appointments');
        await addDoc(appointmentsRef, appointmentData);

        // Show success message
        alert('Viewing scheduled successfully!');
      }
    } catch (error) {
      console.error('Error scheduling viewing:', error);
      alert('Error scheduling viewing. Please try again.');
    }
  }

  viewVideo(): void {
    if (this.property?.['videos']?.[0]) {
      window.open(this.property['videos'][0], '_blank');
    }
  }


  private initializeProperty(): void {
    this.propertyId = this.route.snapshot.paramMap.get('id');
    if (this.propertyId) {
      this.loadPropertyDetails();
    }

    this.routeSub = this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.propertyId = id;
        this.loadPropertyDetails();
      } else {
        this.router.navigate(['/search']);
      }
    });
  }

  getCoordinates(): [number, number] {
    if (this.property?.coordinates?.lat && this.property?.coordinates?.lng) {
      return [this.property.coordinates.lat, this.property.coordinates.lng];
    }
    return [0, 0]; // Default coordinates or center of your desired map area
  }

  getMapMarkers(): MapMarker[] {
    if (!this.property?.coordinates) return [];
    
    return [{
      id: this.property.id,
      latitude: this.property.coordinates.lat || 0,
      longitude: this.property.coordinates.lng || 0,
      title: this.property.title || '',
      price: this.property.price || 0,
      type: this.property.propertyType || ''
    }];
  }

  // Get an appropriate icon for an amenity
  getAmenityIcon(amenity: string): string {
    const amenityMap: {[key: string]: string} = {
      'wifi': 'fas fa-wifi',
      'pool': 'fas fa-swimming-pool',
      'gym': 'fas fa-dumbbell',
      'parking': 'fas fa-parking',
      'security': 'fas fa-shield-alt',
      'air conditioning': 'fas fa-snowflake',
      'heating': 'fas fa-fire',
      'tv': 'fas fa-tv',
      'kitchen': 'fas fa-utensils',
      'laundry': 'fas fa-tshirt',
      'elevator': 'fas fa-arrow-up',
      'balcony': 'fas fa-dungeon',
      'garden': 'fas fa-leaf',
      'internet': 'fas fa-globe',
      'dishwasher': 'fas fa-sink',
      'microwave': 'fas fa-microwave'
    };
    
    // Convert to lowercase for comparison
    const amenityLower = amenity.toLowerCase();
    
    // Check for partial matches
    for (const [key, value] of Object.entries(amenityMap)) {
      if (amenityLower.includes(key)) {
        return value;
      }
    }
    
    // Default icon if no match found
    return 'fas fa-check-circle';
  }
  
  // Format amenity label to be more readable
  formatAmenityLabel(amenity: string): string {
    // Capitalize first letter of each word
    return amenity
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /** Camel‑ or snake‑key → Title Case */
  formatLabel(str: string): string {
    return str
      .replace(/_/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/\b\w/g, c => c.toUpperCase());
  }

/** Build a list of true utilities from your `utilities` map. */
getUtilityList(): string[] {
  // grab the raw map via bracket notation
  const utils = this.property?.['utilities'] as Record<string, boolean> | undefined;
  if (!utils) return [];

  return Object
    .entries(utils)
    .filter(([_, isOn]) => isOn)
    .map(([key]) => this.formatLabel(key));
}


  // Property Loading and Data Management
  async loadPropertyDetails(): Promise<void> {
    if (!this.propertyId) return;
    this.isLoading = true;
    this.error = null;
  
    try {
      const propertyRef = doc(this.firestore, 'listings', this.propertyId);
      const propertySnap = await getDoc(propertyRef);
      
      if (propertySnap.exists()) {
        const data = propertySnap.data();
        
        const geoPoint = data['geoPoint'];
        const coordinates = geoPoint ? {
          lat: geoPoint.latitude,
          lng: geoPoint.longitude
        } : null;
  
        // Now fetch the agent details using the agentId reference
        let agentData = null;
        if (data['agentId']) {
          try {
            // Get the agent document directly using the reference
            const agentRef = data['agentId'] as DocumentReference;
            const agentSnap = await getDoc(agentRef);
            
            if (agentSnap.exists()) {
              const agentDocData = agentSnap.data() as AgentDocument;
              agentData = {
                id: agentSnap.id,
                name: agentDocData.name || '',
                photo: agentDocData.photo || '',
                phone: agentDocData.phone || '',
                email: agentDocData.email || ''
              };
            }
          } catch (error) {
            console.error('Error fetching agent:', error);
          }
        }

        const rawAmenities = data['amenities'] as Record<string, boolean>;
        // turn the map into a string array of only the truths:
        const amenitiesList = Object.entries(rawAmenities)
        .filter(([_, v]) => v)
        .map(([k]) => k);
        
  
        // Combine property and agent data
        this.property = {
          id: propertySnap.id,
          ...data,
          amenities: amenitiesList,
          coordinates,
          agent: agentData || {
            id: '',
            name: 'Unknown Agent',
            photo: 'assets/default-agent.jpg', // Provide a default image
            phone: 'N/A',
            email: 'N/A'
          }
        } as Property;
  
        if (coordinates) {
          this.setupMapData(coordinates);
        }
  
        await Promise.all([
          this.fetchRecommendedProperties(),
          this.fetchAmenities()
        ]);
  
      } else {
        this.error = 'Property not found.';
      }
    } catch (err) {
      console.error("Error loading property:", err);
      this.error = 'Error loading property details.';
    } finally {
      this.isLoading = false;
    }
  }
  

  private extractAmenities(amenitiesData: any): string[] {
    if (!amenitiesData || typeof amenitiesData !== 'object') {
      return [];
    }
    return Object.entries(amenitiesData)
      .filter(([_, value]) => Boolean(value))
      .map(([key]) => key);
  }

  private setupMapData(coordinates: { lat: number; lng: number }): void {
    if (!this.property) return;
  
    this.mapMarkers = [{
      id: this.property.id,
      latitude: coordinates.lat,
      longitude: coordinates.lng,
      title: this.property.title || '',
      price: this.property.price || 0,
      type: this.property.propertyType || ''
    }];
  
    this.mapCenter = [coordinates.lat, coordinates.lng];
  }

  async fetchRecommendedProperties(): Promise<void> {
    if (!this.property) return;
  
    try {
      const listingsRef = collection(this.firestore, 'listings');
      const q = query(
        listingsRef,
        where('category', '==', this.property['category']), 
        where('approved', '==', true),
        limit(3)
      );
  
      const querySnap = await getDocs(q);
      
      this.recommendedProperties = await Promise.all(
        querySnap.docs
          .filter((doc: QueryDocumentSnapshot<DocumentData>) => doc.id !== this.propertyId)
          .map(async (doc: QueryDocumentSnapshot<DocumentData>) => {
            const data = doc.data();
            const geoPoint = data['geoPoint'];
    
            // Fetch agent data if agentId exists
            let agentData = null;
            if (data['agentId']) {
              try {
                const agentRef = data['agentId'] as DocumentReference;
                const agentSnap = await getDoc(agentRef);
                
                if (agentSnap.exists()) {
                  const agentDocData = agentSnap.data() as AgentDocument;
                  agentData = {
                    id: agentSnap.id,
                    name: agentDocData.name || '',
                    photo: agentDocData.photo || '',
                    phone: agentDocData.phone || '',
                    email: agentDocData.email || ''
                  };
                }
              } catch (error) {
                console.error('Error fetching agent:', error);
              }
            }
            
            
            
            return {
              id: doc.id,
              title: data['title'] || '',
              description: data['description'] || '',
              price: data['price'] || data['nightlyRate'] || 0,
              location: data['location'] || '',
              coordinates: geoPoint ? {
                lat: geoPoint.latitude,
                lng: geoPoint.longitude
              } : undefined,
              images: data['images'] || [],
              bedrooms: data['bedrooms'] || 0,
              bathrooms: data['bathrooms'] || 0,
              propertySize: data['propertySize'] || 0,
              amenities: data['amenities'] ? Object.keys(data['amenities']).filter(key => data['amenities'][key]) : [],
              features: [],
              propertyType: data['detail'] || '',
              yearBuilt: data['yearBuilt'] || 0,
              parkingSpaces: data['amenities']?.parking ? 1 : 0,
              isFeatured: data['featured'] || false,
              agent: agentData || {
                id: '',
                name: 'Unknown Agent',
                photo: 'assets/default-agent.jpg',
                phone: 'N/A',
                email: 'N/A'
              }
            } as Property;
          })
      );
  
    } catch (err) {
      console.error('Error fetching recommended properties:', err);
    }
  }
  

  //Helper Method

  

  async fetchAmenities(): Promise<void> {
    // First, check if property and coordinates exist
    if (!this.property?.coordinates || this.property['distanceSchool']) return;
  
    // Store coordinates in a local variable to avoid repeated null checks
    const coordinates = this.property.coordinates;
    if (!coordinates?.lat || !coordinates?.lng) return;
  
    this.isLoadingAmenities = true;
    const amenitiesToFetch = [
      { type: 'school', label: 'School' },
      { type: 'hospital', label: 'Hospital' },
      { type: 'grocery_or_supermarket', label: 'Grocery' },
      { type: 'police', label: 'Police' },
      { type: 'bank', label: 'Bank' },
      { type: 'pharmacy', label: 'Pharmacy' },
      { type: 'restaurant', label: 'Restaurant' },
      { type: 'bus_station', label: 'PublicTransport' },
      { type: 'post_office', label: 'PostOffice' },
      { type: 'gym', label: 'Gym' }
    ];
  
    try {
      const updateData: Record<string, any> = {};
      
      await Promise.all(amenitiesToFetch.map(async item => {
        try {
          // Store coordinates in local constants
          const lat = coordinates.lat;
          const lng = coordinates.lng;
  
          const response = await this.amenityService.fetchNearestAmenity(
            lat,
            lng,
            item.type
          ).toPromise() as AmenityResponse | undefined;
  
          if (response?.results?.[0]) {
            const place = response.results[0];
            updateData[`amenity${item.label}Name`] = place.name;
            
            const distance = this.calculateDistance(
              lat,
              lng,
              place.geometry.location.lat,
              place.geometry.location.lng
            );
            updateData[`distance${item.label}`] = distance;
          }
        } catch (error) {
          console.error(`Error fetching ${item.type}:`, error);
        }
      }));
  
      if (Object.keys(updateData).length > 0 && this.propertyId) {
        const propertyRef = doc(this.firestore, 'listings', this.propertyId);
        await updateDoc(propertyRef, updateData);
  
        const updatedSnap = await getDoc(propertyRef);
        if (updatedSnap.exists()) {
          const data = updatedSnap.data();
          this.property = { 
            id: updatedSnap.id, 
            ...data,
            coordinates: {
              lat: coordinates.lat,
              lng: coordinates.lng
            }
          } as Property;
  
          this.populateNearbyPlacesFromFields();
        }
      }
    } catch (err) {
      console.error('Error updating amenities:', err);
    } finally {
      this.isLoadingAmenities = false;
    }
  }
  

  private populateNearbyPlacesFromFields(): void {
    if (!this.property) return;
  
    const amenityMapping = [
      { label: 'School' },
      { label: 'Hospital' },
      { label: 'Grocery' },
      { label: 'Police' },
      { label: 'Bank' },
      { label: 'Pharmacy' },
      { label: 'Restaurant' },
      { label: 'PublicTransport' },
      { label: 'PostOffice' },
      { label: 'Gym' }
    ];
  
    this.property.nearbyPlaces = amenityMapping
      .map(item => {
        const nameKey = `amenity${item.label}Name`;
        const distanceKey = `distance${item.label}`;
        
        // Add type guard
        if (this.property && nameKey in this.property) {
          return {
            type: item.label,
            name: String(this.property[nameKey] || ''),
            distance: distanceKey in this.property && this.property[distanceKey]
              ? `${this.property[distanceKey]} km`
              : 'Unknown distance'
          };
        }
        return null;
      })
      .filter((place): place is NearbyPlace => place !== null);
  }

  // Utility Methods
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): string {
    const R = 6371; // Earth's radius in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return distance.toFixed(1);
  }
  
  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }

  // Public Methods for Template
  getAmenitiesByType(types: AmenityType | AmenityType[]): NearbyPlace[] {
    if (!this.property?.nearbyPlaces) return [];
    
    const typeArray = Array.isArray(types) ? types : [types];
    return this.property.nearbyPlaces.filter(place => 
      typeArray.includes(place.type as AmenityType)
    );
  }

  // Navigation and Action Methods
  goToProperty(recommendedId: string): void {
    this.router.navigate(['/property', recommendedId]).then(() => {
      window.scrollTo({ 
        top: 0, 
        behavior: 'smooth' 
      });
    });
  }
  

  toggleFavorite(): void {
    this.isFavorite = !this.isFavorite;
    // TODO: Implement favorite logic with backend
  }



  contactAgent(): void {
    // TODO: Implement agent contact logic
  }

  shareProperty(): void {
    // TODO: Implement share logic
  }

  downloadDocument(doc: { url: string; title: string }): void {
    window.open(doc.url, '_blank');
  }

  viewVirtualTour(): void {
    if (this.property?.virtualTourUrl) {
      window.open(this.property.virtualTourUrl, '_blank');
    }
  }

  onMarkerClick(marker: MapMarker): void {
    console.log('Property marker clicked:', marker);
    // TODO: Implement marker click handling
  }

  // Image Handling Methods
  onImageClick(index: number): void {
    this.activeImageIndex = index;
  }

  onImageChange(event: number): void {
    this.activeImageIndex = event;
  }

  onImageLoad(index: number): void {
    console.log('Image loaded:', index);
  }

  // Toggle accordion panels
  togglePanel(panelId: string): void {
    if (this.activePanels.includes(panelId)) {
      this.activePanels = this.activePanels.filter(id => id !== panelId);
    } else {
      this.activePanels.push(panelId);
    }
  }
}
