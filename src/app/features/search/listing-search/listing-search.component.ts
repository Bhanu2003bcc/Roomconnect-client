import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SearchService, SearchFilters } from '../../../core/services/search.service';
import { FavoritesService } from '../../../core/services/favorites.service';
import { AlertsService } from '../../../core/services/alerts.service';
import { AuthService } from '../../../core/auth/auth.service';

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
            <button [class.active]="viewMode() === 'list'" (click)="viewMode.set('list')">Grid View</button>
            <button [class.active]="viewMode() === 'map'" (click)="viewMode.set('map')">Map View</button>
          </div>
        </div>

        @if (toastMsg()) {
          <div class="toast-alert">
            {{ toastMsg() }}
          </div>
        }

        @if (viewMode() === 'list') {
          <div class="listings-grid">
            @for (item of listings(); track item.id) {
              <div class="listing-card">
                <div class="card-image-placeholder">
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
        } @else {
          <!-- Interactive Map View -->
          <div class="map-view-wrapper">
            <div class="map-toolbar">
              <span class="location-status">
                📍 Center: <strong>{{ getCentreCoordinatesLabel() }}</strong> ({{ getCentreLabel() }})
              </span>
              <div class="toolbar-actions">
                <button (click)="getUserLocation()" class="toolbar-btn">Use Current Location</button>
                <button (click)="resetToDefaultCentre()" class="toolbar-btn">Reset to Noida Centre</button>
              </div>
            </div>

            <div class="noida-map" (click)="onMapClick($event)">
              <div class="map-grid">
                <div class="grid-line horizontal"></div>
                <div class="grid-line vertical"></div>
              </div>
              
              <!-- Visual Dashed Radius Circle overlay -->
              <div class="radius-circle" [style.width.%]="getRadiusCircleDiameter()" [style.height.%]="getRadiusCircleDiameter()"></div>

              <span class="centre-pin">{{ getCentreLabel() }}</span>
              
              @for (item of listings(); track item.id) {
                <div
                  class="map-pin"
                  [style.top.%]="getMapTopPercent(item.latitude)"
                  [style.left.%]="getMapLeftPercent(item.longitude)"
                  [routerLink]="['/listings', item.id]"
                  (click)="$event.stopPropagation()"
                >
                  <div class="pin-pulse"></div>
                  <div class="pin-dot"></div>
                  <div class="pin-tooltip">
                    <strong>{{ item.title }}</strong>
                    <span>₹{{ item.rentAmount }}</span>
                  </div>
                </div>
              }
            </div>
            <div class="map-legend">
              <p>Click anywhere on the map grid to set a new custom search center. The dashed boundary outlines the selected {{ filters.radiusKm }} Km search radius.</p>
            </div>
          </div>
        }
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
    .noida-map {
      flex: 1;
      position: relative;
      background: radial-gradient(circle at center, var(--bg-tertiary) 0%, var(--bg-primary) 100%);
      overflow: hidden;
      cursor: crosshair;
      transition: background 0.4s ease;
    }
    .map-grid {
      position: absolute;
      width: 100%;
      height: 100%;
      opacity: 0.05;
      pointer-events: none;
    }
    .grid-line {
      background: var(--text-primary);
      position: absolute;
    }
    .grid-line.horizontal {
      width: 100%;
      height: 1px;
      top: 50%;
    }
    .grid-line.vertical {
      height: 100%;
      width: 1px;
      left: 50%;
    }
    .radius-circle {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      border: 2px dashed rgba(0, 242, 254, 0.35);
      background: rgba(0, 242, 254, 0.02);
      border-radius: 50%;
      pointer-events: none;
      z-index: 5;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .centre-pin {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: var(--bg-secondary);
      color: var(--text-primary);
      font-size: 0.75rem;
      font-weight: 700;
      padding: 0.3rem 0.8rem;
      border-radius: 20px;
      border: 1px solid var(--card-border);
      pointer-events: none;
      box-shadow: 0 4px 10px var(--shadow-color);
      transition: all 0.4s ease;
      z-index: 6;
    }
    .map-pin {
      position: absolute;
      cursor: pointer;
      transform: translate(-50%, -50%);
      z-index: 10;
    }
    .pin-dot {
      width: 14px;
      height: 14px;
      background: var(--accent-cyan);
      border: 2px solid var(--bg-secondary);
      border-radius: 50%;
      box-shadow: 0 2px 6px var(--shadow-color);
      position: relative;
      z-index: 2;
      transition: background 0.4s ease, border-color 0.4s ease;
    }
    .pin-pulse {
      width: 24px;
      height: 24px;
      background: rgba(0, 242, 254, 0.4);
      border-radius: 50%;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      animation: pulse 2s infinite;
      z-index: 1;
    }
    @keyframes pulse {
      0% {
        width: 16px;
        height: 16px;
        opacity: 0.8;
      }
      100% {
        width: 44px;
        height: 44px;
        opacity: 0;
      }
    }
    .pin-tooltip {
      position: absolute;
      bottom: 130%;
      left: 50%;
      transform: translateX(-50%);
      background: var(--bg-secondary);
      border: 1px solid var(--card-border);
      border-radius: 6px;
      padding: 0.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.1rem;
      width: 140px;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.2s ease;
      box-shadow: 0 5px 15px var(--shadow-color);
      z-index: 100;
    }
    .map-pin:hover .pin-tooltip {
      opacity: 1;
    }
    .pin-tooltip strong {
      color: var(--text-primary);
      font-size: 0.75rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      transition: color 0.4s ease;
    }
    .pin-tooltip span {
      color: var(--accent-cyan);
      font-size: 0.7rem;
      font-weight: 700;
    }
    .map-legend {
      background: var(--bg-secondary);
      border-top: 1px solid var(--card-border);
      padding: 0.8rem 1.2rem;
      font-size: 0.75rem;
      color: var(--text-secondary);
      transition: background 0.4s ease, border-color 0.4s ease, color 0.4s ease;
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
export class ListingSearchComponent implements OnInit {
  protected readonly authService = inject(AuthService);
  private readonly searchService = inject(SearchService);
  private readonly favoritesService = inject(FavoritesService);
  private readonly alertsService = inject(AlertsService);

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

  ngOnInit(): void {
    this.getUserLocationOnInit();
    this.onFilterChange();
    this.loadFavorites();
  }

  getUserLocationOnInit(): void {
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.filters.lat = position.coords.latitude;
          this.filters.lng = position.coords.longitude;
          this.onFilterChange();
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
          this.filters.lat = position.coords.latitude;
          this.filters.lng = position.coords.longitude;
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

  onMapClick(event: MouseEvent): void {
    const mapElement = event.currentTarget as HTMLElement;
    const rect = mapElement.getBoundingClientRect();
    
    // Position of click relative to map element
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;
    
    const percentX = (clickX / rect.width) * 100;
    const percentY = (clickY / rect.height) * 100;

    // Convert percentages back to latitude/longitude using the inverse equations:
    // percentY = 50 - latDiff * 400 => latDiff = (50 - percentY) / 400
    // percentX = 50 + lngDiff * 400 => lngDiff = (percentX - 50) / 400
    const latDiff = (50 - percentY) / 400;
    const lngDiff = (percentX - 50) / 400;

    this.filters.lat = this.filters.lat + latDiff;
    this.filters.lng = this.filters.lng + lngDiff;

    this.showToast('Search center shifted to clicked coordinate.');
    this.onFilterChange();
  }

  getRadiusCircleDiameter(): number {
    return (this.filters.radiusKm || 5) * 7.2;
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

  // Noida local map positioning helpers (mock mapping coordinates to percentages around active search center)
  getMapTopPercent(lat: number): number {
    const latDiff = lat - this.filters.lat;
    return Math.max(10, Math.min(90, 50 - latDiff * 400));
  }

  getMapLeftPercent(lng: number): number {
    const lngDiff = lng - this.filters.lng;
    return Math.max(10, Math.min(90, 50 + lngDiff * 400));
  }
}
