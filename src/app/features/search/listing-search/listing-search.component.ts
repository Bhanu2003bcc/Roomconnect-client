import { Component, inject, signal, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { SearchService, SearchFilters } from '../../../core/services/search.service';
import { FavoritesService } from '../../../core/services/favorites.service';
import { AlertsService } from '../../../core/services/alerts.service';
import { AuthService } from '../../../core/auth/auth.service';

declare const L: any;

@Component({
  selector: 'app-listing-search',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="search-container">
      <!-- Collapsible Filters Sidebar -->
      <aside class="filters-sidebar">
        <div class="sidebar-header">
          <h3>Refine Search</h3>
          <button (click)="resetFilters()" class="clear-btn">Reset</button>
        </div>

        <div class="filter-section">
          <label for="radius">Radius ({{ getCentreLabel() }})</label>
          <select id="radius" [(ngModel)]="filters.radiusKm" (change)="onFilterChange()" class="select-field">
            <option [value]="2">Within 2 Km</option>
            <option [value]="5">Within 5 Km</option>
            <option [value]="10">Within 10 Km</option>
            <option [value]="20">Within 20 Km</option>
          </select>
        </div>

        <div class="filter-section">
          <label>Category</label>
          <div class="category-pills">
            @for (cat of ['pg', '1bhk', '2bhk', '3bhk', 'independent_room']; track cat) {
              <button
                [class.active]="filters.category === cat"
                (click)="toggleCategory(cat)"
                class="pill-btn"
              >
                {{ cat | uppercase }}
              </button>
            }
          </div>
        </div>

        <div class="filter-section">
          <label>Gender Preference</label>
          <select [(ngModel)]="filters.genderPreference" (change)="onFilterChange()" class="select-field">
            <option value="any">Any Gender</option>
            <option value="male">Male Only</option>
            <option value="female">Female Only</option>
          </select>
        </div>

        <div class="filter-section">
          <label>Rent Range (INR / month)</label>
          <div class="rent-inputs">
            <input
              type="number"
              placeholder="Min"
              [(ngModel)]="filters.minRent"
              (change)="onFilterChange()"
              class="rent-field"
            />
            <span>to</span>
            <input
              type="number"
              placeholder="Max"
              [(ngModel)]="filters.maxRent"
              (change)="onFilterChange()"
              class="rent-field"
            />
          </div>
        </div>

        <div class="filter-section">
          <label>Amenities</label>
          <div class="checkbox-grid">
            <label class="check-item">
              <input type="checkbox" [(ngModel)]="filters.wifi" (change)="onFilterChange()" />
              <span>WiFi</span>
            </label>
            <label class="check-item">
              <input type="checkbox" [(ngModel)]="filters.parking" (change)="onFilterChange()" />
              <span>Parking</span>
            </label>
            <label class="check-item">
              <input type="checkbox" [(ngModel)]="filters.laundry" (change)="onFilterChange()" />
              <span>Laundry</span>
            </label>
            <label class="check-item">
              <input type="checkbox" [(ngModel)]="filters.foodIncluded" (change)="onFilterChange()" />
              <span>Food Included</span>
            </label>
          </div>
        </div>

        <div class="filter-section">
          <label>Room Specifications</label>
          <select [(ngModel)]="filters.ac" (change)="onFilterChange()" class="select-field">
            <option value="">AC / Non-AC</option>
            <option value="ac">AC Room</option>
            <option value="non-ac">Non-AC Room</option>
          </select>
          
          <select [(ngModel)]="filters.bathroomType" (change)="onFilterChange()" class="select-field" style="margin-top: 0.5rem;">
            <option value="">Bathroom Type</option>
            <option value="attached">Attached Bathroom</option>
            <option value="shared">Shared Bathroom</option>
          </select>
        </div>

        @if (authService.isAuthenticated() && authService.userRole() === 'visitor') {
          <button (click)="saveSearchAlert()" class="alert-btn">
            Save Search Alert
          </button>
        }
      </aside>

      <!-- Main Listing Results Grid -->
      <main class="results-main">
        <div class="results-header">
          <h2>Available Listings ({{ listings().length }})</h2>
          <div class="view-toggle">
            <button [class.active]="viewMode() === 'list'" (click)="setViewMode('list')">Grid View</button>
            <button [class.active]="viewMode() === 'map'" (click)="setViewMode('map')">Map View</button>
          </div>
        </div>

        @if (toastMsg()) {
          <div class="toast-alert">
            {{ toastMsg() }}
          </div>
        }

        <!-- Listings Grid View (using hidden for smooth maps toggle) -->
        <div [style.display]="viewMode() === 'list' ? 'grid' : 'none'" class="listings-grid">
          @for (item of listings(); track item.id) {
            <div class="listing-card">
              <div class="card-image-placeholder" [style.background-image]="item.media && item.media.length > 0 ? 'linear-gradient(180deg, rgba(18, 18, 24, 0.1) 0%, rgba(18, 18, 24, 0.8) 100%), url(' + item.media[0].url + ')' : ''">
                <span class="category-label">{{ item.category | uppercase }}</span>
                <span class="rent-label">₹{{ item.rentAmount }}</span>
                @if (authService.isAuthenticated() && authService.userRole() === 'visitor') {
                  <button
                    (click)="toggleFavorite(item.id!, $event)"
                    class="favorite-badge"
                    [class.favorited]="isFavorited(item.id!)"
                  >
                    ♥
                  </button>
                }
              </div>
              <div class="card-details">
                <h4>{{ item.title }}</h4>
                <p class="address">{{ item.addressText }}</p>
                <div class="specs">
                  <span *ngIf="item.wifi">WiFi</span>
                  <span *ngIf="item.parking">Parking</span>
                  <span *ngIf="item.foodIncluded">Food</span>
                  <span *ngIf="item.ac === 'ac'">AC</span>
                </div>
                <a [routerLink]="['/listings', item.id]" class="view-btn">View Details</a>
              </div>
            </div>
          } @empty {
            <div class="empty-state">
              <p>No listings match your search filters.</p>
            </div>
          }
        </div>

        <!-- Interactive Noida Map View -->
        <div [style.display]="viewMode() === 'map' ? 'flex' : 'none'" class="map-view-wrapper">
          <div class="map-toolbar">
            <span class="location-status">
              📍 Center: <strong>{{ getCentreCoordinatesLabel() }}</strong> ({{ getCentreLabel() }})
            </span>
            <div class="toolbar-actions">
              <button (click)="getUserLocation()" class="toolbar-btn">Use Current Location</button>
              <button (click)="resetToDefaultCentre()" class="toolbar-btn">Reset to Noida Centre</button>
            </div>
          </div>

          <div id="leaflet-map"></div>

          <div class="map-legend">
            <p>Click anywhere on the map to set a new custom search center. The dashed boundary outlines the search radius.</p>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .search-container {
      max-width: 1200px;
      margin: 2rem auto;
      padding: 0 1.5rem;
      display: grid;
      grid-template-columns: 280px 1fr;
      gap: 2rem;
      min-height: calc(100vh - 180px);
    }
    @media (max-width: 900px) {
      .search-container {
        grid-template-columns: 1fr;
      }
    }
    .filters-sidebar {
      background: var(--card-bg);
      backdrop-filter: blur(10px);
      border: 1px solid var(--card-border);
      border-radius: 12px;
      padding: 1.5rem;
      align-self: start;
      transition: background 0.4s ease, border-color 0.4s ease;
    }
    .sidebar-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      border-bottom: 1px solid var(--card-border);
      padding-bottom: 0.8rem;
    }
    .sidebar-header h3 {
      color: var(--text-primary);
      margin: 0;
      font-size: 1.1rem;
      transition: color 0.4s ease;
    }
    .clear-btn {
      background: transparent;
      border: 0;
      color: var(--accent-cyan);
      cursor: pointer;
      font-size: 0.85rem;
      font-weight: 600;
    }
    .filter-section {
      margin-bottom: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .filter-section label {
      color: var(--text-secondary);
      font-size: 0.85rem;
      font-weight: 600;
      transition: color 0.4s ease;
    }
    .select-field {
      background: var(--input-bg);
      border: 1px solid var(--input-border);
      border-radius: 6px;
      color: var(--text-primary);
      padding: 0.6rem;
      outline: none;
      width: 100%;
      transition: background 0.4s ease, color 0.4s ease, border-color 0.4s ease;
    }
    .category-pills {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    .pill-btn {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 20px;
      color: var(--text-secondary);
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.4rem 0.8rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .pill-btn:hover {
      background: var(--card-bg-hover);
      color: var(--text-primary);
    }
    .pill-btn.active {
      background: var(--accent-cyan);
      color: #121218;
      border-color: var(--accent-cyan);
    }
    .rent-inputs {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--text-secondary);
    }
    .rent-field {
      background: var(--input-bg);
      border: 1px solid var(--input-border);
      border-radius: 6px;
      color: var(--text-primary);
      padding: 0.5rem;
      width: 100%;
      outline: none;
      transition: background 0.4s ease, color 0.4s ease, border-color 0.4s ease;
    }
    .checkbox-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.6rem;
    }
    .check-item {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      color: var(--text-secondary);
      font-size: 0.8rem;
      cursor: pointer;
      transition: color 0.4s ease;
    }
    .alert-btn {
      width: 100%;
      background: rgba(255, 184, 0, 0.1);
      border: 1px solid rgba(255, 184, 0, 0.3);
      color: var(--accent-gold);
      padding: 0.7rem;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 700;
      font-size: 0.85rem;
      transition: all 0.2s ease;
      margin-top: 1rem;
    }
    .alert-btn:hover {
      background: rgba(255, 184, 0, 0.2);
    }
    .results-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .results-header h2 {
      color: var(--text-primary);
      margin: 0;
      font-size: 1.4rem;
      font-weight: 800;
      letter-spacing: -0.5px;
      transition: color 0.4s ease;
    }
    .view-toggle {
      display: flex;
      background: var(--card-bg);
      border-radius: 8px;
      padding: 0.2rem;
      border: 1px solid var(--card-border);
    }
    .view-toggle button {
      background: transparent;
      border: 0;
      color: var(--text-secondary);
      padding: 0.4rem 0.9rem;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.85rem;
      font-weight: 600;
      transition: all 0.2s ease;
    }
    .view-toggle button.active {
      background: var(--card-bg-hover);
      color: var(--text-primary);
    }
    .listings-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.5rem;
    }
    .listing-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 12px;
      overflow: hidden;
      transition: all 0.25s ease;
    }
    .listing-card:hover {
      transform: translateY(-2px);
      background: var(--card-bg-hover);
      border-color: var(--card-border-hover);
      box-shadow: 0 8px 24px var(--shadow-color);
    }
    .card-image-placeholder {
      height: 160px;
      background: linear-gradient(135deg, #1e1e30 0%, #151522 100%);
      background-size: cover;
      background-position: center;
      position: relative;
    }
    .category-label {
      background: var(--accent-cyan);
      color: #121218;
      font-size: 0.7rem;
      font-weight: 800;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      position: absolute;
      top: 0.8rem;
      left: 0.8rem;
    }
    .rent-label {
      background: rgba(0, 0, 0, 0.7);
      color: #fff;
      font-size: 0.95rem;
      font-weight: 700;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      position: absolute;
      bottom: 0.8rem;
      left: 0.8rem;
    }
    .favorite-badge {
      background: rgba(0, 0, 0, 0.5);
      border: 1px solid rgba(255, 255, 255, 0.15);
      color: #fff;
      border-radius: 50%;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: absolute;
      top: 0.8rem;
      right: 0.8rem;
      cursor: pointer;
      opacity: 0.8;
      transition: all 0.2s ease;
      font-size: 1.15rem;
      line-height: 1;
    }
    .favorite-badge:hover, .favorite-badge.favorited {
      opacity: 1;
      background: rgba(255, 51, 102, 0.2);
      border-color: var(--accent-rose);
      color: var(--accent-rose);
    }
    .card-details {
      padding: 1.2rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .card-details h4 {
      color: var(--text-primary);
      margin: 0;
      font-size: 1rem;
      font-weight: 700;
      transition: color 0.4s ease;
    }
    .card-details .address {
      color: var(--text-secondary);
      font-size: 0.8rem;
      margin: 0;
      transition: color 0.4s ease;
    }
    .specs {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin: 0.3rem 0;
    }
    .specs span {
      font-size: 0.7rem;
      background: var(--card-bg-hover);
      border: 1px solid var(--card-border);
      padding: 0.15rem 0.5rem;
      border-radius: 4px;
      color: var(--text-secondary);
      transition: all 0.4s ease;
    }
    .view-btn {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      color: var(--text-primary);
      text-decoration: none;
      text-align: center;
      font-size: 0.85rem;
      font-weight: 600;
      padding: 0.5rem;
      border-radius: 6px;
      transition: all 0.2s ease;
      margin-top: 0.5rem;
    }
    .view-btn:hover {
      background: var(--accent-cyan);
      color: #121218;
      border-color: var(--accent-cyan);
    }
    .empty-state {
      grid-column: 1 / -1;
      text-align: center;
      padding: 4rem;
      color: var(--text-secondary);
    }
    .map-view-wrapper {
      background: var(--bg-secondary);
      border: 1px solid var(--card-border);
      border-radius: 12px;
      overflow: hidden;
      height: 520px;
      display: flex;
      flex-direction: column;
      transition: background 0.4s ease, border-color 0.4s ease;
    }
    .map-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: var(--card-bg);
      border-bottom: 1px solid var(--card-border);
      padding: 0.6rem 1.2rem;
      font-size: 0.8rem;
      flex-wrap: wrap;
      gap: 0.5rem;
      z-index: 5;
    }
    .location-status {
      color: var(--text-primary);
    }
    .location-status strong {
      font-family: monospace;
      color: var(--accent-cyan);
    }
    .toolbar-actions {
      display: flex;
      gap: 0.5rem;
    }
    .toolbar-btn {
      background: var(--bg-secondary);
      border: 1px solid var(--card-border);
      color: var(--text-secondary);
      padding: 0.35rem 0.75rem;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.75rem;
      font-weight: 600;
      transition: all 0.2s ease;
    }
    .toolbar-btn:hover {
      background: var(--card-bg-hover);
      color: var(--text-primary);
      border-color: var(--accent-cyan);
    }
    #leaflet-map {
      flex: 1;
      width: 100%;
      z-index: 1;
      min-height: 400px;
    }
    :host ::ng-deep .custom-center-marker {
      background: transparent;
      border: none;
    }
    :host ::ng-deep .center-pin-wrapper {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
    }
    :host ::ng-deep .center-pin-dot {
      font-size: 1.5rem;
      z-index: 10;
    }
    :host ::ng-deep .center-pin-pulse {
      position: absolute;
      width: 40px;
      height: 40px;
      background: rgba(0, 242, 254, 0.4);
      border-radius: 50%;
      animation: center-pulse 2s infinite;
      z-index: 1;
    }
    @keyframes center-pulse {
      0% {
        transform: scale(0.5);
        opacity: 0.8;
      }
      100% {
        transform: scale(1.5);
        opacity: 0;
      }
    }
    :host ::ng-deep .custom-price-marker {
      background: transparent;
      border: none;
    }
    :host ::ng-deep .price-marker-tag {
      background: var(--card-bg);
      border: 1px solid var(--accent-cyan);
      color: var(--text-primary);
      font-weight: 700;
      font-size: 0.8rem;
      padding: 4px 8px;
      border-radius: 12px;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.4);
      text-align: center;
      white-space: nowrap;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }
    :host ::ng-deep .price-marker-tag:hover {
      background: var(--accent-cyan);
      color: #121218;
      transform: translateY(-2px) scale(1.05);
      box-shadow: 0 6px 14px rgba(0, 242, 254, 0.3);
    }
    :host ::ng-deep .leaflet-popup-content-wrapper {
      background: var(--card-bg) !important;
      color: var(--text-primary) !important;
      border: 1px solid var(--card-border);
      border-radius: 12px !important;
      padding: 0 !important;
      overflow: hidden;
      box-shadow: 0 10px 25px rgba(0,0,0,0.5) !important;
    }
    :host ::ng-deep .leaflet-popup-content {
      margin: 0 !important;
      line-height: inherit !important;
    }
    :host ::ng-deep .leaflet-popup-tip {
      background: var(--card-bg) !important;
      border: 1px solid var(--card-border);
    }
    :host ::ng-deep .map-popup-card {
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      width: 200px;
    }
    :host ::ng-deep .map-popup-card h4 {
      margin: 0;
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--text-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    :host ::ng-deep .popup-addr {
      margin: 0;
      font-size: 0.75rem;
      color: var(--text-secondary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    :host ::ng-deep .popup-rent {
      margin: 0;
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--accent-cyan);
    }
    :host ::ng-deep .popup-btn {
      background: var(--accent-cyan);
      color: #121218;
      border: none;
      border-radius: 6px;
      padding: 0.4rem;
      text-align: center;
      font-size: 0.8rem;
      font-weight: 700;
      text-decoration: none;
      cursor: pointer;
      transition: background 0.2s ease;
      margin-top: 0.3rem;
      display: block;
    }
    :host ::ng-deep .popup-btn:hover {
      background: #00c6d2;
      color: #121218;
    }
    .map-legend {
      background: var(--bg-secondary);
      border-top: 1px solid var(--card-border);
      padding: 0.8rem 1.2rem;
      font-size: 0.75rem;
      color: var(--text-secondary);
      transition: background 0.4s ease, border-color 0.4s ease, color 0.4s ease;
      z-index: 5;
    }
    .toast-alert {
      background: rgba(0, 242, 254, 0.1);
      border: 1px solid rgba(0, 242, 254, 0.25);
      color: var(--accent-cyan);
      border-radius: 8px;
      padding: 0.8rem 1.2rem;
      font-size: 0.85rem;
      font-weight: 600;
      margin-bottom: 1.5rem;
      animation: fadeIn 0.3s ease;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class ListingSearchComponent implements OnInit, AfterViewInit {
  protected readonly authService = inject(AuthService);
  private readonly searchService = inject(SearchService);
  private readonly favoritesService = inject(FavoritesService);
  private readonly alertsService = inject(AlertsService);
  private readonly router = inject(Router);

  viewMode = signal<'list' | 'map'>('list');
  listings = signal<any[]>([]);
  favoritedIds = new Set<string>();
  toastMsg = signal('');

  // Default Noida center (approx coordinates)
  noidaLat = 28.62;
  noidaLng = 77.36;

  filters: SearchFilters = {
    lat: this.noidaLat,
    lng: this.noidaLng,
    radiusKm: 5,
    category: '',
    genderPreference: 'any',
    minRent: undefined,
    maxRent: undefined,
    wifi: false,
    parking: false,
    laundry: false,
    foodIncluded: false,
    ac: '',
    bathroomType: '',
    page: 0,
    size: 20
  };

  // Leaflet map fields
  map: any;
  centerMarker: any;
  radiusCircle: any;
  listingMarkers: any[] = [];

  ngOnInit(): void {
    this.getUserLocationOnInit();
    this.onFilterChange();
    this.loadFavorites();
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  initMap(): void {
    if (typeof window === 'undefined' || typeof L === 'undefined') return;

    // Bounding box lock for Noida
    const noidaBounds = L.latLngBounds([28.40, 77.20], [28.70, 77.55]);

    this.map = L.map('leaflet-map', {
      center: [this.filters.lat, this.filters.lng],
      zoom: 13,
      minZoom: 11,
      maxZoom: 18,
      maxBounds: noidaBounds,
      maxBoundsViscosity: 1.0,
      zoomControl: true
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    this.updateCenterMarkerAndCircle();
    this.updateListingMarkers();

    // Set search center on click inside Noida boundaries
    this.map.on('click', (e: any) => {
      if (noidaBounds.contains(e.latlng)) {
        this.filters.lat = e.latlng.lat;
        this.filters.lng = e.latlng.lng;
        this.showToast('Search center shifted to clicked coordinate.');
        this.onFilterChange();
      } else {
        this.showToast('Please select a search center within Noida bounds.');
      }
    });

    // Intercept popup view details button click to route via Angular router
    this.map.on('popupopen', (e: any) => {
      const popupEl = e.popup.getElement();
      const btn = popupEl.querySelector('.popup-btn');
      if (btn) {
        btn.addEventListener('click', (event: MouseEvent) => {
          event.preventDefault();
          const url = btn.getAttribute('href');
          if (url) {
            this.router.navigateByUrl(url);
          }
        });
      }
    });
  }

  updateCenterMarkerAndCircle(): void {
    if (!this.map || typeof L === 'undefined') return;

    const centerCoords: [number, number] = [this.filters.lat, this.filters.lng];

    if (this.centerMarker) {
      this.centerMarker.setLatLng(centerCoords);
    } else {
      const centerIcon = L.divIcon({
        className: 'custom-center-marker',
        html: `
          <div class="center-pin-wrapper">
            <div class="center-pin-pulse"></div>
            <div class="center-pin-dot">📍</div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });
      this.centerMarker = L.marker(centerCoords, { icon: centerIcon, zIndexOffset: 1000 }).addTo(this.map);
    }

    if (this.radiusCircle) {
      this.radiusCircle.setLatLng(centerCoords);
      this.radiusCircle.setRadius((this.filters.radiusKm || 5) * 1000);
    } else {
      this.radiusCircle = L.circle(centerCoords, {
        radius: (this.filters.radiusKm || 5) * 1000,
        color: '#00f2fe',
        fillColor: '#00f2fe',
        fillOpacity: 0.05,
        weight: 2,
        dashArray: '5, 5'
      }).addTo(this.map);
    }
  }

  updateListingMarkers(): void {
    if (!this.map || typeof L === 'undefined') return;

    this.listingMarkers.forEach(m => this.map.removeLayer(m));
    this.listingMarkers = [];

    const items = this.listings();
    items.forEach(item => {
      if (item.latitude && item.longitude) {
        const priceIcon = L.divIcon({
          className: 'custom-price-marker',
          html: `<div class="price-marker-tag">₹${Math.round(item.rentAmount)}</div>`,
          iconSize: [60, 24],
          iconAnchor: [30, 12]
        });

        const marker = L.marker([item.latitude, item.longitude], { icon: priceIcon }).addTo(this.map);

        const popupContent = `
          <div class="map-popup-card">
            <h4>${item.title}</h4>
            <p class="popup-addr">${item.addressText || ''}</p>
            <p class="popup-rent">₹${item.rentAmount} / month</p>
            <a href="/listings/${item.id}" class="popup-btn">View Details</a>
          </div>
        `;
        marker.bindPopup(popupContent, { closeButton: false, offset: [0, -10] });
        this.listingMarkers.push(marker);
      }
    });
  }

  getUserLocationOnInit(): void {
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          if (typeof L !== 'undefined') {
            const noidaBounds = L.latLngBounds([28.40, 77.20], [28.70, 77.55]);
            if (noidaBounds.contains([lat, lng])) {
              this.filters.lat = lat;
              this.filters.lng = lng;
              this.onFilterChange();
              if (this.map) {
                this.map.setView([lat, lng], 13);
                this.updateCenterMarkerAndCircle();
              }
              return;
            }
          }
          console.warn('Initial geolocation outside Noida, defaulting to Noida Centre.');
        },
        (error) => {
          console.warn('Initial geolocation failed or denied, using defaults.', error);
        },
        { enableHighAccuracy: false, timeout: 3000, maximumAge: 600000 }
      );
    }
  }

  getUserLocation(): void {
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      this.showToast('Acquiring your coordinates...');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          if (typeof L !== 'undefined') {
            const noidaBounds = L.latLngBounds([28.40, 77.20], [28.70, 77.55]);
            if (!noidaBounds.contains([lat, lng])) {
              this.showToast('Your location is outside Noida area. Using Noida Centre.');
              return;
            }
          }
          this.filters.lat = lat;
          this.filters.lng = lng;
          this.showToast('Search center set to your current location!');
          this.onFilterChange();
        },
        (error) => {
          console.warn('Geolocation acquisition failed:', error);
          this.showToast('Could not acquire location. Please verify browser permissions.');
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      this.showToast('Geolocation is not supported by your browser.');
    }
  }

  resetToDefaultCentre(): void {
    this.filters.lat = this.noidaLat;
    this.filters.lng = this.noidaLng;
    this.showToast('Search center reset to Noida Centre.');
    this.onFilterChange();
  }

  setViewMode(mode: 'list' | 'map'): void {
    this.viewMode.set(mode);
    if (mode === 'map' && this.map) {
      setTimeout(() => {
        this.map.invalidateSize();
        this.map.setView([this.filters.lat, this.filters.lng], 13);
        this.updateCenterMarkerAndCircle();
        this.updateListingMarkers();
      }, 50);
    }
  }

  isDefaultCentre(): boolean {
    return Math.abs(this.filters.lat - this.noidaLat) < 0.0005 &&
           Math.abs(this.filters.lng - this.noidaLng) < 0.0005;
  }

  getCentreLabel(): string {
    return this.isDefaultCentre() ? 'Noida Centre' : 'Custom Centre';
  }

  getCentreCoordinatesLabel(): string {
    return `${this.filters.lat.toFixed(4)}, ${this.filters.lng.toFixed(4)}`;
  }

  onFilterChange(): void {
    this.searchService.search(this.filters).subscribe({
      next: (res) => {
        this.listings.set(res.items || []);
        if (this.map) {
          this.map.panTo([this.filters.lat, this.filters.lng]);
          this.updateCenterMarkerAndCircle();
          this.updateListingMarkers();
        }
      },
      error: (err) => console.error('Search failed', err)
    });
  }

  toggleCategory(cat: string): void {
    if (this.filters.category === cat) {
      this.filters.category = '';
    } else {
      this.filters.category = cat;
    }
    this.onFilterChange();
  }

  resetFilters(): void {
    this.filters = {
      lat: this.noidaLat,
      lng: this.noidaLng,
      radiusKm: 5,
      category: '',
      genderPreference: 'any',
      minRent: undefined,
      maxRent: undefined,
      wifi: false,
      parking: false,
      laundry: false,
      foodIncluded: false,
      ac: '',
      bathroomType: '',
      page: 0,
      size: 20
    };
    this.onFilterChange();
  }

  loadFavorites(): void {
    if (!this.authService.isAuthenticated() || this.authService.userRole() !== 'visitor') return;
    this.favoritesService.getFavorites(0, 100).subscribe({
      next: (res) => {
        const favs = res.content || [];
        this.favoritedIds = new Set(favs.map((f: any) => f.listingId));
      }
    });
  }

  isFavorited(listingId: string): boolean {
    return this.favoritedIds.has(listingId);
  }

  toggleFavorite(listingId: string, event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    this.favoritesService.toggleFavorite(listingId).subscribe({
      next: (res) => {
        if (res.favorited) {
          this.favoritedIds.add(listingId);
          this.showToast('Listing added to favorites!');
        } else {
          this.favoritedIds.delete(listingId);
          this.showToast('Listing removed from favorites.');
        }
      }
    });
  }

  saveSearchAlert(): void {
    this.alertsService.saveSearch(this.filters).subscribe({
      next: () => this.showToast('🔔 Search alert saved! We will email you on matches.'),
      error: (err) => console.error('Failed to save search alert', err)
    });
  }

  showToast(msg: string): void {
    this.toastMsg.set(msg);
    setTimeout(() => this.toastMsg.set(''), 3000);
  }
}
