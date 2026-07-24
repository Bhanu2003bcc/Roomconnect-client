import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ListingsService, Listing } from '../../../core/services/listings.service';
import { ChatService } from '../../../core/services/chat.service';
import { ToursService } from '../../../core/services/tours.service';
import { FavoritesService } from '../../../core/services/favorites.service';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-listing-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="detail-container">
      @if (listing(); as item) {
        <div class="layout-grid">
          <!-- Main Content -->
          <div class="content-left">
            <div class="gallery">
              <!-- Render listing media if available, fallback to mock gradient -->
              <div class="cover-image" [style.background-image]="item.media && item.media.length > 0 ? 'linear-gradient(180deg, rgba(18, 18, 24, 0.2) 0%, rgba(18, 18, 24, 0.95) 100%), url(' + (item.media[0].url || item.media[0].thumbnailUrl) + ')' : ''">
                <span class="category-badge">{{ item.category | uppercase }}</span>
                <span class="status-badge" [ngClass]="item.status">
                  {{ item.status === 'available_from' ? 'Available From ' + item.availableFromDate : (item.status | uppercase) }}
                </span>
                <div class="image-text">
                  <h3>{{ item.title }}</h3>
                  <p>📍 {{ item.addressText }}</p>
                </div>
              </div>
            </div>

            <div class="section description">
              <h3>Description</h3>
              <p>{{ item.description || 'No description provided for this Noida room rental listing.' }}</p>
            </div>

            <div class="section specs-grid">
              <h3>Specifications</h3>
              <div class="grid">
                <div class="spec-card">
                  <span class="label">Rent Amount</span>
                  <span class="val">₹{{ item.rentAmount }} / month</span>
                </div>
                <div class="spec-card">
                  <span class="label">Security Deposit</span>
                  <span class="val">₹{{ item.depositAmount || 'N/A' }}</span>
                </div>
                <div class="spec-card" *ngIf="item.bathroomType">
                  <span class="label">Bathroom</span>
                  <span class="val">{{ item.bathroomType | uppercase }}</span>
                </div>
                <div class="spec-card" *ngIf="item.furnishing">
                  <span class="label">Furnishing</span>
                  <span class="val">{{ item.furnishing | uppercase }}</span>
                </div>
                <div class="spec-card">
                  <span class="label">Gender Preference</span>
                  <span class="val">{{ item.genderPreference | uppercase }}</span>
                </div>
                <div class="spec-card" *ngIf="item.curfewTime">
                  <span class="label">Curfew Time</span>
                  <span class="val">{{ item.curfewTime }}</span>
                </div>
                <div class="spec-card" *ngIf="item.ac">
                  <span class="label">Air Conditioning</span>
                  <span class="val">{{ item.ac | uppercase }}</span>
                </div>
                <div class="spec-card" *ngIf="item.foodType">
                  <span class="label">Food Type</span>
                  <span class="val">{{ item.foodType | uppercase }}</span>
                </div>
              </div>
            </div>

            <div class="section amenities">
              <h3>Included Amenities</h3>
              <div class="amenity-list">
                <span class="amenity-item" [class.enabled]="item.wifi">📶 WiFi {{ item.wifi ? 'Available' : 'No' }}</span>
                <span class="amenity-item" [class.enabled]="item.parking">🚗 Parking {{ item.parking ? 'Included' : 'No' }}</span>
                <span class="amenity-item" [class.enabled]="item.laundry">👕 Laundry {{ item.laundry ? 'Available' : 'No' }}</span>
                <span class="amenity-item" [class.enabled]="item.foodIncluded">🍴 Meals {{ item.foodIncluded ? 'Included' : 'No' }}</span>
              </div>
            </div>
          </div>

          <!-- Sidebar Booking Actions -->
          <div class="content-right">
            <!-- Favorites Widget -->
            @if (authService.isAuthenticated() && authService.userRole() === 'visitor') {
              <div class="action-card favoriting">
                <button
                  (click)="toggleFavorite()"
                  class="fav-btn"
                  [class.is-fav]="isFavorited()"
                >
                  {{ isFavorited() ? '❤️ Favorited' : '🤍 Add to Favorites' }}
                </button>
              </div>
            }

            <!-- Booking Card -->
            <div class="action-card booking">
              <div class="rent-info">
                <span class="price">₹{{ item.rentAmount }}</span>
                <span class="term">/ month</span>
              </div>

              @if (authService.isAuthenticated()) {
                @if (authService.currentUser()?.id === item.ownerId) {
                  <p class="role-message">You are the owner of this property listing.</p>
                  <a [routerLink]="['/owner/dashboard']" class="chat-btn text-center" style="display: block; text-decoration: none;">Manage Listing</a>
                } @else if (authService.userRole() === 'visitor') {
                  <button (click)="chatWithOwner()" [disabled]="chatLoading()" class="chat-btn">
                    💬 Chat with Owner
                  </button>

                  <div class="divider-line"><span>or</span></div>

                  <form (ngSubmit)="requestSiteVisit()" class="tour-form">
                    <h4>Schedule a Site Visit</h4>
                    
                    <div class="form-group">
                      <label for="visitDate">Preferred Time</label>
                      <input
                        type="datetime-local"
                        id="visitDate"
                        name="visitDate"
                        [(ngModel)]="visitTime"
                        required
                        class="form-control"
                      />
                    </div>

                    <div class="form-group">
                      <label for="notes">Notes for Owner</label>
                      <textarea
                        id="notes"
                        name="notes"
                        [(ngModel)]="visitNotes"
                        placeholder="Say hello, describe your profession etc."
                        class="form-control"
                        rows="3"
                      ></textarea>
                    </div>

                    <button type="submit" [disabled]="tourLoading()" class="tour-btn">
                      {{ tourLoading() ? 'Requesting...' : 'Request Tour' }}
                    </button>
                  </form>
                } @else if (authService.userRole() === 'owner') {
                  <p class="role-message">You are logged in as an Owner profile.</p>
                  <a [routerLink]="['/owner/dashboard']" class="chat-btn text-center" style="display: block; text-decoration: none;">Manage Dashboard</a>
                }
              } @else {
                <a routerLink="/login" class="chat-btn text-center" style="display: block; text-decoration: none;">
                  Sign In to Connect
                </a>
              }

              @if (toastMsg()) {
                <div class="toast-feedback" [class.success]="!toastError()" [class.error]="toastError()">
                  {{ toastMsg() }}
                </div>
              }
            </div>
          </div>
        </div>
      } @else {
        <div class="loading-state">
          <p>Loading listing details...</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .detail-container {
      max-width: 1200px;
      margin: 2rem auto;
      padding: 0 1.5rem;
    }
    .layout-grid {
      display: grid;
      grid-template-columns: 1fr 360px;
      gap: 2rem;
    }
    @media (max-width: 900px) {
      .layout-grid {
        grid-template-columns: 1fr;
      }
    }
    .cover-image {
      height: 360px;
      border-radius: 12px;
      background: linear-gradient(135deg, #1b1b2a 0%, #121218 100%);
      background-size: cover;
      background-position: center;
      position: relative;
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      align-items: flex-end;
      padding: 2rem;
    }
    .category-badge {
      background: #00f2fe;
      color: #121218;
      font-size: 0.75rem;
      font-weight: 800;
      padding: 0.3rem 0.6rem;
      border-radius: 4px;
      position: absolute;
      top: 1.2rem;
      left: 1.2rem;
    }
    .status-badge {
      font-size: 0.75rem;
      font-weight: 800;
      padding: 0.3rem 0.6rem;
      border-radius: 4px;
      position: absolute;
      top: 1.2rem;
      right: 1.2rem;
      color: #fff;
    }
    .status-badge.available {
      background: #00e676;
    }
    .status-badge.occupied {
      background: #ff1744;
    }
    .status-badge.available_from {
      background: #ffb800;
    }
    .image-text h3 {
      color: #fff;
      font-size: 1.8rem;
      font-weight: 800;
      letter-spacing: -0.5px;
      margin: 0 0 0.5rem 0;
    }
    .image-text p {
      color: rgba(255, 255, 255, 0.7);
      margin: 0;
      font-size: 0.95rem;
    }
    .section {
      background: rgba(255, 255, 255, 0.01);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 12px;
      padding: 1.5rem;
      margin-top: 1.5rem;
    }
    .section h3 {
      color: #fff;
      margin: 0 0 1rem 0;
      font-size: 1.2rem;
      font-weight: 700;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      padding-bottom: 0.5rem;
    }
    .description p {
      color: rgba(255, 255, 255, 0.7);
      line-height: 1.7;
      font-size: 0.95rem;
      margin: 0;
    }
    .specs-grid .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 1rem;
    }
    .spec-card {
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      padding: 0.8rem 1.2rem;
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
    }
    .spec-card .label {
      color: rgba(255, 255, 255, 0.45);
      font-size: 0.75rem;
      font-weight: 600;
    }
    .spec-card .val {
      color: #fff;
      font-size: 0.95rem;
      font-weight: 700;
    }
    .amenity-list {
      display: flex;
      flex-wrap: wrap;
      gap: 0.8rem;
    }
    .amenity-item {
      font-size: 0.85rem;
      font-weight: 600;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.05);
      color: rgba(255, 255, 255, 0.4);
      padding: 0.5rem 1rem;
      border-radius: 30px;
    }
    .amenity-item.enabled {
      background: rgba(0, 242, 254, 0.05);
      border-color: rgba(0, 242, 254, 0.2);
      color: #00f2fe;
    }
    .action-card {
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
    }
    .fav-btn {
      width: 100%;
      background: transparent;
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: #fff;
      padding: 0.8rem;
      border-radius: 8px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .fav-btn:hover {
      background: rgba(255, 255, 255, 0.05);
    }
    .fav-btn.is-fav {
      background: rgba(255, 51, 102, 0.1);
      border-color: #ff3366;
      color: #ff3366;
    }
    .rent-info {
      display: flex;
      align-items: baseline;
      gap: 0.3rem;
      margin-bottom: 1.2rem;
    }
    .rent-info .price {
      color: #fff;
      font-size: 2.2rem;
      font-weight: 800;
    }
    .rent-info .term {
      color: rgba(255, 255, 255, 0.5);
      font-size: 0.95rem;
    }
    .chat-btn {
      width: 100%;
      background: linear-gradient(135deg, #00f2fe 0%, #4facfe 100%);
      color: #121218;
      border: 0;
      padding: 0.9rem;
      border-radius: 8px;
      font-weight: 700;
      font-size: 0.95rem;
      cursor: pointer;
      box-shadow: 0 4px 15px rgba(0, 242, 254, 0.2);
      transition: all 0.2s ease;
    }
    .chat-btn:hover {
      box-shadow: 0 6px 20px rgba(0, 242, 254, 0.3);
    }
    .divider-line {
      display: flex;
      align-items: center;
      text-align: center;
      margin: 1.2rem 0;
      color: rgba(255, 255, 255, 0.3);
      font-size: 0.8rem;
    }
    .divider-line::before, .divider-line::after {
      content: '';
      flex: 1;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    .divider-line::before { margin-right: .5em; }
    .divider-line::after { margin-left: .5em; }
    .tour-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .tour-form h4 {
      color: #fff;
      margin: 0;
      font-size: 1rem;
      font-weight: 700;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }
    .form-group label {
      color: rgba(255, 255, 255, 0.7);
      font-size: 0.8rem;
      font-weight: 600;
    }
    .form-control {
      background: #1a1a24;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 6px;
      color: #fff;
      padding: 0.6rem;
      outline: none;
      font-family: inherit;
    }
    .tour-btn {
      width: 100%;
      background: transparent;
      border: 1px solid #ffb800;
      color: #ffb800;
      padding: 0.8rem;
      border-radius: 8px;
      font-weight: 700;
      font-size: 0.9rem;
      cursor: pointer;
      transition: all 0.2s ease;
      margin-top: 0.5rem;
    }
    .tour-btn:hover {
      background: rgba(255, 184, 0, 0.1);
    }
    .role-message {
      color: rgba(255, 255, 255, 0.6);
      font-size: 0.8rem;
      text-align: center;
      margin: 1rem 0;
    }
    .toast-feedback {
      border-radius: 8px;
      padding: 0.7rem;
      font-size: 0.8rem;
      font-weight: 600;
      text-align: center;
      margin-top: 1rem;
    }
    .toast-feedback.success {
      background: rgba(0, 242, 254, 0.1);
      border: 1px solid rgba(0, 242, 254, 0.3);
      color: #00f2fe;
    }
    .toast-feedback.error {
      background: rgba(255, 51, 102, 0.1);
      border: 1px solid rgba(255, 51, 102, 0.3);
      color: #ff3366;
    }
    .loading-state {
      text-align: center;
      padding: 4rem;
      color: rgba(255, 255, 255, 0.5);
    }
  `]
})
export class ListingDetailComponent implements OnInit {
  protected readonly authService = inject(AuthService);
  private readonly listingsService = inject(ListingsService);
  private readonly chatService = inject(ChatService);
  private readonly toursService = inject(ToursService);
  private readonly favoritesService = inject(FavoritesService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  listing = signal<Listing | null>(null);
  isFavorited = signal(false);

  chatLoading = signal(false);
  tourLoading = signal(false);

  visitTime = '';
  visitNotes = '';

  toastMsg = signal('');
  toastError = signal(false);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadListing(id);
      this.checkFavoriteStatus(id);
    }
  }

  loadListing(id: string): void {
    this.listingsService.getListing(id).subscribe({
      next: (res) => this.listing.set(res),
      error: (err) => {
        console.error('Failed to load listing', err);
        this.showToast('Listing not found.', true);
      }
    });
  }

  checkFavoriteStatus(listingId: string): void {
    if (!this.authService.isAuthenticated() || this.authService.userRole() !== 'visitor') return;
    this.favoritesService.getFavoriteStatus(listingId).subscribe({
      next: (res) => this.isFavorited.set(res.favorited)
    });
  }

  toggleFavorite(): void {
    const id = this.listing()?.id;
    if (!id) return;

    this.favoritesService.toggleFavorite(id).subscribe({
      next: (res) => {
        this.isFavorited.set(res.favorited);
        this.showToast(res.favorited ? 'Added to favorites!' : 'Removed from favorites.');
      }
    });
  }

  chatWithOwner(): void {
    const id = this.listing()?.id;
    if (!id) return;

    this.chatLoading.set(true);
    this.chatService.startConversation(id).subscribe({
      next: (res) => {
        this.chatLoading.set(false);
        this.router.navigate(['/chat'], { queryParams: { id: res.id } });
      },
      error: (err) => {
        console.error('Failed to start chat', err);
        const msg = err?.error?.message || (err?.status === 401 ? 'Please sign in to chat with the owner.' : 'Failed to connect to owner.');
        this.showToast(msg, true);
        this.chatLoading.set(false);
      }
    });
  }

  requestSiteVisit(): void {
    const id = this.listing()?.id;
    if (!id) return;
    if (!this.visitTime) {
      this.showToast('Please select a preferred date and time.', true);
      return;
    }

    this.tourLoading.set(true);
    const tour = {
      listingId: id,
      requestedTime: new Date(this.visitTime).toISOString(),
      notes: this.visitNotes
    };

    this.toursService.requestTour(tour).subscribe({
      next: () => {
        this.showToast('Site visit requested! The owner has been notified.');
        this.visitTime = '';
        this.visitNotes = '';
        this.tourLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to book tour', err);
        this.showToast('Failed to request site visit.', true);
        this.tourLoading.set(false);
      }
    });
  }

  showToast(msg: string, isError = false): void {
    this.toastMsg.set(msg);
    this.toastError.set(isError);
    setTimeout(() => this.toastMsg.set(''), 4000);
  }
}
