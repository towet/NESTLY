import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';

export interface MapMarker {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  price?: number;
  type?: string;
  icon?: string;
  geoPoint?: {
    latitude: number;
    longitude: number;
  };
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

@Component({
  selector: 'app-area-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './area-map.component.html',
  styleUrls: ['./area-map.component.scss']
})
export class AreaMapComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapContainer') mapContainer!: ElementRef;
  
  @Input() mapMarkers: MapMarker[] = [];
  @Input() center: [number, number] = [0, 0];
  @Input() zoom: number = 13;
  @Input() height: string = '400px';
  @Input() showControls: boolean = true;
  
  @Output() markerClick = new EventEmitter<MapMarker>();
  @Output() boundsChange = new EventEmitter<MapBounds>();
  @Output() zoomChange = new EventEmitter<number>();

  private map!: L.Map;
  private markerLayer!: L.LayerGroup;
  private markerInstances: Map<string, L.Marker> = new Map();

  constructor() {}

  ngOnInit() {
    if (!this.center || this.center.some(coord => coord === undefined)) {
      this.center = [0, 0]; // Default coordinates
    }
  }

  ngAfterViewInit() {
    this.initializeMap();
    this.addMarkers();
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
    }
  }

  private initializeMap() {
    try {
      // Validate center coordinates
      if (!this.center || this.center.some(coord => coord === undefined)) {
        console.warn('Invalid center coordinates, using default');
        this.center = [0, 0];
      }
    this.map = L.map(this.mapContainer.nativeElement, {
      center: this.center,
      zoom: this.zoom,
      zoomControl: this.showControls
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    this.markerLayer = L.layerGroup().addTo(this.map);

    // Event listeners
    this.map.on('moveend', () => this.emitBoundsChange());
    this.map.on('zoomend', () => this.emitZoomChange());
  } catch (error) {
    console.error('Error initializing map:', error);
  }
}

  private addMarkers() {
    this.mapMarkers.forEach(marker => {
      const icon = this.createCustomIcon(marker);
      const leafletMarker = L.marker([marker.latitude, marker.longitude], { icon })
        .bindPopup(this.createPopupContent(marker));

      leafletMarker.on('click', () => this.markerClick.emit(marker));
      this.markerInstances.set(marker.id, leafletMarker);
      this.markerLayer.addLayer(leafletMarker);
    });
  }

  private createCustomIcon(marker: MapMarker): L.DivIcon {
    return L.divIcon({
      className: 'custom-marker',
      html: `
        <div class="marker-content">
          ${marker.price ? `<span class="price">$${marker.price.toLocaleString()}</span>` : ''}
          ${marker.icon ? `<i class="icon ${marker.icon}"></i>` : ''}
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 40]
    });
  }

  private createPopupContent(marker: MapMarker): string {
    return `
      <div class="marker-popup">
        <h3>${marker.title}</h3>
        ${marker.price ? `<p class="price">$${marker.price.toLocaleString()}</p>` : ''}
        ${marker.type ? `<p class="type">${marker.type}</p>` : ''}
      </div>
    `;
  }

  private emitBoundsChange() {
    const bounds = this.map.getBounds();
    this.boundsChange.emit({
      north: bounds.getNorth(),
      south: bounds.getSouth(),
      east: bounds.getEast(),
      west: bounds.getWest()
    });
  }

  private emitZoomChange() {
    this.zoomChange.emit(this.map.getZoom());
  }

  // Public methods for external control
  public updateMarkers(newMarkers: MapMarker[]) {
    this.markerLayer.clearLayers();
    this.markerInstances.clear();
    this.mapMarkers = newMarkers.filter(marker => 
      marker.latitude !== undefined && 
      marker.longitude !== undefined
    );

    // If there are valid markers, center the map on the first one
    if (this.mapMarkers.length > 0) {
      const firstMarker = this.mapMarkers[0];
      this.center = [firstMarker.latitude, firstMarker.longitude];
      this.map.setView(this.center, this.zoom);
    }
    this.addMarkers();
  } 

  public setMarkersFromGeoPoints(markers: any[]) {
    try {
      const formattedMarkers = markers.map(marker => ({
        id: marker.id,
        latitude: marker.geoPoint?.latitude ?? 0,
        longitude: marker.geoPoint?.longitude ?? 0,
        title: marker.title || '',
        price: marker.price,
        type: marker.type,
        icon: marker.icon
      }));

      this.updateMarkers(formattedMarkers);
    } catch (error) {
      console.error('Error setting markers from GeoPoints:', error);
    }
  }

  public fitBounds(bounds: MapBounds) {
    this.map.fitBounds([
      [bounds.south, bounds.west],
      [bounds.north, bounds.east]
    ]);
  }

  public setCenter(center: [number, number], zoom?: number) {
    this.map.setView(center, zoom || this.map.getZoom());
  }

  public invalidateSize() {
    this.map.invalidateSize();
  }
}
