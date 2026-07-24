import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { ListingsService, Listing } from '../../core/services/listings.service';
import { ToursService, TourResponse } from '../../core/services/tours.service';
import { FavoritesService } from '../../core/services/favorites.service';
import { AlertsService } from '../../core/services/alerts.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="dashboard-container">
      <!-- Visitor Dashboard -->
      @if (authService.userRole() === 'visitor') {
        <div class="dashboard-layout">
          <!-- Visitor Left Panel -->
          <div class="panel-left">
            <h2>Welcome Back, {{ authService.currentUser()?.phone }}</h2>
            <p class="subtitle">Manage your room hunt from Noida's premium rental console.</p>

            <!-- Booked Tours -->
            <div class="section">
              <h3>Scheduled Site Visits ({{ tours().length }})</h3>
              <div class="tours-list">
                @for (t of tours(); track t.id) {
                  <div class="tour-card" [ngClass]="t.status">
                    <div class="tour-info">
                      <strong>{{ t.listingTitle }}</strong>
                      <span class="address">Address: {{ t.listingAddress }}</span>
                      <span class="time">Time: {{ t.requestedTime | date:'medium' }}</span>
                      <p *ngIf="t.notes" class="notes">"{{ t.notes }}"</p>
                    </div>
                    <div class="tour-action">
                      <span class="status-badge" [ngClass]="t.status">{{ t.status | uppercase }}</span>
                      @if (t.status === 'requested' || t.status === 'confirmed') {
                        <button (click)="cancelTour(t.id)" class="cancel-btn">Cancel</button>
                      }
                    </div>
                  </div>
                } @empty {
                  <div class="empty-list">No site visits scheduled yet. Browse room details to request one!</div>
                }
              </div>
            </div>

            <!-- Saved Alerts -->
            <div class="section">
              <h3>Active Saved Searches ({{ alerts().length }})</h3>
              <div class="alerts-list">
                @for (a of alerts(); track a.id) {
                  <div class="alert-card">
                    <div class="alert-info">
                      <strong>Noida Locality Alert</strong>
                      <span class="filters-summary">
                        Radius: {{ a.filters.radiusKm || 5 }} km • 
                        Category: {{ a.filters.category || 'Any' | uppercase }} • 
                        Rent: ₹{{ a.filters.minRent || 0 }} - ₹{{ a.filters.maxRent || 'Max' }}
                      </span>
                      <span class="last-run" *ngIf="a.lastNotifiedAt">Last notified: {{ a.lastNotifiedAt | date:'short' }}</span>
                    </div>
                    <button (click)="deleteAlert(a.id)" class="delete-icon" aria-label="Delete">×</button>
                  </div>
                } @empty {
                  <div class="empty-list">No saved search alerts. Save searches to get email notifications on matches!</div>
                }
              </div>
            </div>
          </div>

          <!-- Visitor Right Panel (Favorites) -->
          <div class="panel-right">
            <div class="section favorites-section">
              <h3>Saved Favorites ({{ favorites().length }})</h3>
              <div class="favorites-grid">
                @for (f of favorites(); track f.listingId) {
                  <div class="fav-card">
                    <div class="card-details">
                      <h4>Listing Details</h4>
                      <p class="address">Listing ID: {{ f.listingId }}</p>
                      <div class="fav-actions">
                        <a [routerLink]="['/listings', f.listingId]" class="details-link">View Details</a>
                        <button (click)="removeFavorite(f.listingId)" class="remove-fav-btn">Remove</button>
                      </div>
                    </div>
                  </div>
                } @empty {
                  <div class="empty-list text-center" style="padding: 2rem 0;">
                    <p>Your saved favorites list is empty.</p>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
      }

      <!-- Owner Dashboard -->
      @if (authService.userRole() === 'owner') {
        <div class="owner-layout">
          <div class="dashboard-header-row">
            <div>
              <h2>Owner Property Console</h2>
              <p>Manage listing parameters, availability state machines, and view site visits.</p>
            </div>
            <button (click)="toggleAddForm()" class="add-listing-btn">
              {{ showAddForm() ? 'Close Form' : 'List New Property' }}
            </button>
          </div>

          <!-- Add / Edit Listing Form -->
          @if (showAddForm()) {
            <div class="section form-section">
              <h3>{{ editMode() ? 'Edit Listing Details' : 'List a Noida Room/Flat' }}</h3>
              <form (ngSubmit)="saveListing()" class="form-grid">
                <div class="form-group">
                  <label for="title">Listing Title</label>
                  <input type="text" id="title" name="title" [(ngModel)]="listingModel.title" required placeholder="Cozy Room near Sector 62" />
                </div>
                <div class="form-group">
                  <label for="category">Category</label>
                  <select id="category" name="category" [(ngModel)]="listingModel.category" required>
                    <option value="pg">PG</option>
                    <option value="1bhk">1BHK</option>
                    <option value="2bhk">2BHK</option>
                    <option value="3bhk">3BHK</option>
                    <option value="independent_room">Independent Room</option>
                  </select>
                </div>
                <div class="form-group">
                  <label for="rentAmount">Rent Amount (INR / month)</label>
                  <input type="number" id="rentAmount" name="rentAmount" [(ngModel)]="listingModel.rentAmount" required placeholder="12000" />
                </div>
                <div class="form-group">
                  <label for="depositAmount">Security Deposit</label>
                  <input type="number" id="depositAmount" name="depositAmount" [(ngModel)]="listingModel.depositAmount" placeholder="24000" />
                </div>
                <div class="form-group">
                  <label for="gender">Gender Preference</label>
                  <select id="gender" name="gender" [(ngModel)]="listingModel.genderPreference">
                    <option value="any">Any</option>
                    <option value="male">Male Only</option>
                    <option value="female">Female Only</option>
                  </select>
                </div>
                <div class="form-group">
                  <label for="bathroom">Bathroom Type</label>
                  <select id="bathroom" name="bathroom" [(ngModel)]="listingModel.bathroomType">
                    <option value="attached">Attached</option>
                    <option value="shared">Shared</option>
                  </select>
                </div>
                <div class="form-group">
                  <label for="furnishing">Furnishing</label>
                  <input type="text" id="furnishing" name="furnishing" [(ngModel)]="listingModel.furnishing" placeholder="semi-furnished, fully-furnished" />
                </div>
                <div class="form-group">
                  <label for="curfew">Curfew Time (Optional)</label>
                  <input type="time" id="curfew" name="curfew" [(ngModel)]="listingModel.curfewTime" />
                </div>
                <div class="form-group">
                  <label for="ac">AC Type</label>
                  <select id="ac" name="ac" [(ngModel)]="listingModel.ac">
                    <option value="ac">AC</option>
                    <option value="non-ac">Non-AC</option>
                  </select>
                </div>
                <div class="form-group">
                  <label for="address">Full Address Text</label>
                  <input type="text" id="address" name="address" [(ngModel)]="listingModel.addressText" required placeholder="A-45 Sector 62, Noida" />
                </div>

                <!-- Interactive Leaflet Map Selector -->
                <div class="form-group full-width">
                  <label>Pin Your Location on Noida Map</label>
                  <p class="map-hint">Drag the marker or click on the map to position your listing. It will display accurately to searchers.</p>
                  <div id="dashboard-map"></div>
                  <!-- Coordinate readout -->
                  <div class="coords-readout">
                    <span>Latitude: <strong id="readout-lat">{{ listingModel.latitude }}</strong></span>
                    <span>Longitude: <strong id="readout-lng">{{ listingModel.longitude }}</strong></span>
                  </div>
                </div>
                <div class="form-group">
                  <label for="status">Availability Status</label>
                  <select id="status" name="status" [(ngModel)]="listingModel.status" (change)="onStatusChange()">
                    <option value="available">Available</option>
                    <option value="occupied">Occupied</option>
                    <option value="available_from">Available From Date</option>
                  </select>
                </div>
                <div class="form-group" *ngIf="listingModel.status === 'available_from'">
                  <label for="availDate">Available From Date</label>
                  <input type="date" id="availDate" name="availDate" [(ngModel)]="listingModel.availableFromDate" />
                </div>

                <div class="checkbox-options form-group">
                  <label>Additional Amenities</label>
                  <div class="checkbox-row">
                    <label><input type="checkbox" name="wifi" [(ngModel)]="listingModel.wifi" /> WiFi</label>
                    <label><input type="checkbox" name="parking" [(ngModel)]="listingModel.parking" /> Parking</label>
                    <label><input type="checkbox" name="laundry" [(ngModel)]="listingModel.laundry" /> Laundry</label>
                    <label><input type="checkbox" name="food" [(ngModel)]="listingModel.foodIncluded" /> Meals Included</label>
                  </div>
                </div>

                <div class="form-group full-width" *ngIf="listingModel.foodIncluded">
                  <label for="foodType">Food Category</label>
                  <select id="foodType" name="foodType" [(ngModel)]="listingModel.foodType">
                    <option value="veg">Veg Only</option>
                    <option value="non-veg">Non-Veg</option>
                    <option value="both">Both</option>
                    <option value="none">None</option>
                  </select>
                </div>

                <div class="form-group full-width">
                  <label for="desc">Long Description</label>
                  <textarea id="desc" name="desc" [(ngModel)]="listingModel.description" rows="3" placeholder="Provide details about roommates, security rules etc."></textarea>
                </div>

                <div class="form-actions full-width">
                  <button type="submit" class="save-form-btn">Save Listing</button>
                  <button type="button" (click)="resetForm()" class="cancel-form-btn">Cancel</button>
                </div>
              </form>
            </div>
          }

          <!-- Owner Dashboard Columns -->
          <div class="owner-columns">
            <!-- Properties Listing CRUD -->
            <div class="section col-listings">
              <h3>My Property Listings ({{ properties().length }})</h3>
              <div class="properties-list">
                @for (p of properties(); track p.id) {
                  <div class="property-card">
                    <div class="prop-details">
                      <h4>{{ p.title }}</h4>
                      <span class="rent">Rent: ₹{{ p.rentAmount }}</span>
                      <span class="address">Address: {{ p.addressText }}</span>
                      <span class="status-indicator" [ngClass]="p.status">{{ p.status | uppercase }}</span>
                    </div>
                    
                    <!-- S3 Media Uploading Widget inside Card -->
                    <div class="media-upload-section">
                      <h5>Media Gallery ({{ p.media?.length || 0 }})</h5>
                      <div class="gallery-thumbs">
                        @for (m of p.media; track m.id) {
                          <div class="thumb-wrapper" [style.background-image]="'url(' + m.thumbnailUrl + ')'">
                            <button (click)="deleteImage(p.id!, m.id)" class="del-thumb-btn">×</button>
                          </div>
                        }
                      </div>
                      <label class="file-upload-label">
                        <input type="file" (change)="onUploadImage(p.id!, $event)" accept="image/*" class="hidden-file-input" />
                        Upload Photo
                      </label>
                    </div>

                    <div class="prop-actions">
                      <button (click)="editListing(p)" class="edit-btn">Edit</button>
                      <button (click)="toggleAvailability(p)" class="toggle-status-btn">Toggle Status</button>
                      <button (click)="deleteListing(p.id!)" class="delete-btn">Delete</button>
                    </div>
                  </div>
                } @empty {
                  <div class="empty-list">You haven't listed any rooms yet. Click 'List New Property' to add Noida listings!</div>
                }
              </div>
            </div>

            <!-- Tour Approvals List -->
            <div class="section col-tours">
              <h3>Site Visit Requests ({{ ownerTours().length }})</h3>
              <div class="owner-tours-list">
                @for (t of ownerTours(); track t.id) {
                  <div class="tour-request-card" [ngClass]="t.status">
                    <div class="req-info">
                      <strong>{{ t.listingTitle }}</strong>
                      <span class="visitor">Visitor ID: {{ t.visitorId }}</span>
                      <span class="time">Time: {{ t.requestedTime | date:'medium' }}</span>
                      <p *ngIf="t.notes" class="notes">"{{ t.notes }}"</p>
                    </div>
                    <div class="req-actions">
                      @if (t.status === 'requested') {
                        <button (click)="updateTourStatus(t.id, 'confirmed')" class="approve-btn">Confirm</button>
                        <button (click)="updateTourStatus(t.id, 'declined')" class="decline-btn">Decline</button>
                      } @else {
                        <span class="status-badge" [ngClass]="t.status">{{ t.status | uppercase }}</span>
                      }
                    </div>
                  </div>
                } @empty {
                  <div class="empty-list">No site visit requests received yet.</div>
                }
              </div>
            </div>
          </div>
        </div>
      }

      @if (toastMsg()) {
        <div class="toast-popup" [class.error]="toastError()">
          {{ toastMsg() }}
        </div>
      }
    </div>
  `,
  styles: [`
    .dashboard-container {
      max-width: 1200px;
      margin: 2rem auto;
      padding: 0 1.5rem;
      min-height: calc(100vh - 180px);
    }
    h2 {
      color: var(--text-primary);
      margin: 0;
      font-weight: 800;
      letter-spacing: -0.5px;
      transition: color 0.4s ease;
    }
    .subtitle {
      color: var(--text-secondary);
      margin: 0.3rem 0 1.5rem 0;
      font-size: 0.95rem;
      transition: color 0.4s ease;
    }
    .section {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
      transition: background 0.4s ease, border-color 0.4s ease;
    }
    .section h3 {
      color: var(--text-primary);
      margin: 0 0 1.2rem 0;
      font-size: 1.1rem;
      font-weight: 700;
      border-bottom: 1px solid var(--card-border);
      padding-bottom: 0.5rem;
      transition: color 0.4s ease, border-color 0.4s ease;
    }
    .dashboard-layout {
      display: grid;
      grid-template-columns: 1.6fr 1fr;
      gap: 2rem;
    }
    @media (max-width: 900px) {
      .dashboard-layout {
        grid-template-columns: 1fr;
      }
    }
    .empty-list {
      color: var(--text-secondary);
      font-size: 0.85rem;
      padding: 1rem 0;
      transition: color 0.4s ease;
    }
    /* Tours / Alerts Style */
    .tour-card, .alert-card, .tour-request-card {
      background: var(--card-bg-hover);
      border: 1px solid var(--card-border);
      border-radius: 8px;
      padding: 1rem;
      margin-bottom: 0.8rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
      transition: background 0.4s ease, border-color 0.4s ease;
    }
    .tour-card.confirmed, .tour-request-card.confirmed {
      border-left: 4px solid #00e676;
    }
    .tour-card.requested, .tour-request-card.requested {
      border-left: 4px solid #ffb800;
    }
    .tour-card.declined, .tour-request-card.declined {
      border-left: 4px solid #ff1744;
    }
    .tour-info, .alert-info, .req-info {
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
    }
    .tour-info strong, .alert-info strong, .req-info strong {
      color: var(--text-primary);
      font-size: 0.95rem;
      transition: color 0.4s ease;
    }
    .tour-info .address, .visitor {
      color: var(--text-secondary);
      font-size: 0.8rem;
      transition: color 0.4s ease;
    }
    .tour-info .time, .time {
      color: var(--accent-blue);
      font-size: 0.8rem;
      font-weight: 600;
      transition: color 0.4s ease;
    }
    .notes {
      color: var(--text-secondary);
      font-size: 0.8rem;
      font-style: italic;
      margin: 0.3rem 0 0 0;
      transition: color 0.4s ease;
    }
    .tour-action, .req-actions {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 0.5rem;
    }
    .status-badge {
      font-size: 0.7rem;
      font-weight: 800;
      padding: 0.15rem 0.4rem;
      border-radius: 4px;
    }
    .status-badge.requested { background: rgba(255, 184, 0, 0.15); color: #ffb800; }
    .status-badge.confirmed { background: rgba(0, 230, 118, 0.15); color: #00e676; }
    .status-badge.declined { background: rgba(255, 23, 68, 0.15); color: #ff1744; }
    .status-badge.cancelled { background: var(--card-border); color: var(--text-secondary); }
    .cancel-btn, .decline-btn {
      background: transparent;
      border: 1px solid rgba(255, 23, 68, 0.3);
      color: #ff1744;
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.25rem 0.6rem;
      border-radius: 4px;
      cursor: pointer;
    }
    .approve-btn {
      background: #00e676;
      border: 0;
      color: #121218;
      font-size: 0.75rem;
      font-weight: 700;
      padding: 0.3rem 0.8rem;
      border-radius: 4px;
      cursor: pointer;
    }
    .filters-summary, .last-run {
      color: var(--text-secondary);
      font-size: 0.8rem;
      transition: color 0.4s ease;
    }
    .delete-icon {
      background: transparent;
      border: 0;
      cursor: pointer;
      font-size: 1.25rem;
      color: var(--text-secondary);
      opacity: 0.6;
      transition: opacity 0.2s ease, color 0.4s ease;
      line-height: 1;
    }
    .delete-icon:hover {
      opacity: 1;
      color: #ff1744;
    }

    /* Favorites column styles */
    .favorites-grid {
      display: flex;
      flex-direction: column;
      gap: 0.8rem;
    }
    .fav-card {
      background: var(--card-bg-hover);
      border: 1px solid var(--card-border);
      border-radius: 8px;
      padding: 1rem;
      transition: background 0.4s ease, border-color 0.4s ease;
    }
    .fav-card h4 {
      color: var(--text-primary);
      margin: 0;
      font-size: 0.9rem;
      transition: color 0.4s ease;
    }
    .fav-actions {
      display: flex;
      justify-content: space-between;
      margin-top: 0.5rem;
    }
    .details-link {
      color: var(--accent-cyan);
      text-decoration: none;
      font-size: 0.8rem;
      font-weight: 600;
    }
    .remove-fav-btn {
      background: transparent;
      border: 0;
      color: var(--text-secondary);
      font-size: 0.8rem;
      cursor: pointer;
      text-decoration: underline;
      transition: color 0.4s ease;
    }
    .remove-fav-btn:hover {
      color: #ff3366;
    }

    /* Owner dashboard styles */
    .owner-layout {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .dashboard-header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
      border-bottom: 1px solid var(--card-border);
      padding-bottom: 1rem;
      transition: border-color 0.4s ease;
    }
    .add-listing-btn {
      background: linear-gradient(135deg, #00f2fe 0%, #4facfe 100%);
      color: #121218;
      border: 0;
      font-weight: 700;
      padding: 0.6rem 1.2rem;
      border-radius: 8px;
      cursor: pointer;
      box-shadow: 0 4px 15px rgba(0, 242, 254, 0.2);
    }
    .owner-columns {
      display: grid;
      grid-template-columns: 1.4fr 1fr;
      gap: 2rem;
    }
    @media (max-width: 900px) {
      .owner-columns {
        grid-template-columns: 1fr;
      }
    }
    .property-card {
      background: var(--card-bg-hover);
      border: 1px solid var(--card-border);
      border-radius: 8px;
      padding: 1.2rem;
      margin-bottom: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.8rem;
      transition: background 0.4s ease, border-color 0.4s ease;
    }
    .prop-details h4 {
      color: var(--text-primary);
      margin: 0 0 0.3rem 0;
      font-size: 1.05rem;
      transition: color 0.4s ease;
    }
    .prop-details span {
      display: block;
      font-size: 0.8rem;
      color: var(--text-secondary);
      transition: color 0.4s ease;
    }
    .prop-details .status-indicator {
      display: inline-block;
      font-size: 0.65rem;
      font-weight: 800;
      padding: 0.1rem 0.3rem;
      border-radius: 3px;
      margin-top: 0.4rem;
    }
    .prop-details .status-indicator.available { background: rgba(0, 230, 118, 0.15); color: #00e676; }
    .prop-details .status-indicator.occupied { background: rgba(255, 23, 68, 0.15); color: #ff1744; }
    .prop-details .status-indicator.available_from { background: rgba(255, 184, 0, 0.15); color: #ffb800; }
    .prop-actions {
      display: flex;
      gap: 0.5rem;
    }
    .prop-actions button {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      color: var(--text-primary);
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.35rem 0.8rem;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .prop-actions button.delete-btn {
      color: #ff1744;
      border-color: rgba(255, 23, 68, 0.2);
    }
    .prop-actions button.delete-btn:hover {
      background: rgba(255, 23, 68, 0.1);
    }
    .prop-actions button:hover {
      background: var(--card-bg-hover);
    }

    /* Media Upload Area in property card */
    .media-upload-section {
      background: var(--card-bg);
      border: 1px dashed var(--card-border);
      border-radius: 6px;
      padding: 0.8rem;
      transition: background 0.4s ease, border-color 0.4s ease;
    }
    .media-upload-section h5 {
      margin: 0 0 0.5rem 0;
      color: var(--text-secondary);
      font-size: 0.75rem;
      transition: color 0.4s ease;
    }
    .gallery-thumbs {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-bottom: 0.6rem;
    }
    .thumb-wrapper {
      position: relative;
      width: 60px;
      height: 40px;
      background: var(--card-bg-hover);
      background-size: cover;
      background-position: center;
      border: 1px solid var(--card-border);
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.4s ease, border-color 0.4s ease;
    }
    .thumb-placeholder {
      font-size: 0.72rem;
      color: var(--text-secondary);
      transition: color 0.4s ease;
    }
    .del-thumb-btn {
      position: absolute;
      top: -6px;
      right: -6px;
      width: 16px;
      height: 16px;
      background: #ff1744;
      border: 0;
      border-radius: 50%;
      color: #fff;
      font-size: 0.75rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }
    .file-upload-label {
      display: inline-block;
      background: rgba(0, 242, 254, 0.1);
      border: 1px solid rgba(0, 242, 254, 0.3);
      color: var(--accent-cyan);
      font-size: 0.7rem;
      font-weight: 700;
      padding: 0.25rem 0.6rem;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .file-upload-label:hover {
      background: rgba(0, 242, 254, 0.2);
    }
    .hidden-file-input {
      display: none;
    }

    /* Add room form details */
    .form-section {
      margin-top: 0;
    }
    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 1.2rem;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
    }
    .form-group label {
      color: var(--text-secondary);
      font-size: 0.8rem;
      font-weight: 600;
      transition: color 0.4s ease;
    }
    .form-group input:not([type="checkbox"]), .form-group select, .form-group textarea {
      background: var(--input-bg);
      border: 1px solid var(--input-border);
      border-radius: 6px;
      color: var(--text-primary);
      padding: 0.6rem;
      outline: none;
      font-family: inherit;
      transition: background 0.4s ease, color 0.4s ease, border-color 0.4s ease;
    }
    .form-group.full-width {
      grid-column: 1 / -1;
    }

    #dashboard-map {
      height: 300px;
      width: 100%;
      border-radius: 8px;
      border: 1.5px solid var(--card-border);
      background: var(--card-bg-hover);
      z-index: 1; /* Keep controls below dropdowns */
    }
    .map-hint {
      font-size: 0.75rem;
      color: var(--text-secondary);
      margin: 0 0 0.5rem 0;
      transition: color 0.4s ease;
    }
    .coords-readout {
      display: flex;
      gap: 1.5rem;
      margin-top: 0.5rem;
      font-size: 0.78rem;
      color: var(--text-secondary);
      transition: color 0.4s ease;
    }
    .coords-readout strong {
      color: var(--accent-cyan);
      font-weight: 700;
    }
    .checkbox-options {
      grid-column: 1 / -1;
    }
    .checkbox-row {
      display: flex;
      flex-wrap: wrap;
      gap: 1.2rem;
      margin-top: 0.3rem;
    }
    .checkbox-row label {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      color: var(--text-secondary);
      font-size: 0.85rem;
      cursor: pointer;
      transition: color 0.4s ease;
    }
    .form-actions {
      display: flex;
      gap: 0.8rem;
      margin-top: 0.5rem;
    }
    .save-form-btn {
      background: linear-gradient(135deg, #00f2fe 0%, #4facfe 100%);
      color: #121218;
      border: 0;
      font-weight: 700;
      padding: 0.7rem 1.5rem;
      border-radius: 6px;
      cursor: pointer;
    }
    .cancel-form-btn {
      background: transparent;
      border: 1px solid var(--card-border);
      color: var(--text-primary);
      font-weight: 600;
      padding: 0.7rem 1.5rem;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .cancel-form-btn:hover {
      background: var(--card-bg-hover);
    }

    /* Toast popup styles */
    .toast-popup {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      background: var(--accent-cyan);
      color: #121218;
      padding: 0.8rem 1.5rem;
      border-radius: 8px;
      font-weight: 700;
      font-size: 0.85rem;
      max-width: 360px;
      box-shadow: 0 10px 30px var(--shadow-color);
      z-index: 2000;
      animation: slideUp 0.3s ease;
    }
    .toast-popup.error {
      background: #ff1744;
      color: #fff;
    }
    @keyframes slideUp {
      from { transform: translateY(100px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
  `]
})
export class DashboardComponent implements OnInit {
  protected readonly authService = inject(AuthService);
  private readonly listingsService = inject(ListingsService);
  private readonly toursService = inject(ToursService);
  private readonly favoritesService = inject(FavoritesService);
  private readonly alertsService = inject(AlertsService);

  // Lists Signals
  tours = signal<TourResponse[]>([]);
  alerts = signal<any[]>([]);
  favorites = signal<any[]>([]);
  properties = signal<Listing[]>([]);
  ownerTours = signal<TourResponse[]>([]);

  // Forms Management
  showAddForm = signal(false);
  editMode = signal(false);
  toastMsg = signal('');
  toastError = signal(false);

  // Noida bounding box for map conversions
  private readonly LAT_MAX = 28.72;
  private readonly LAT_MIN = 28.48;
  private readonly LNG_MIN = 77.26;
  private readonly LNG_MAX = 77.52;

  // Leaflet map instances
  private leafletMap: any = null;
  private leafletMarker: any = null;

  // Forms Models
  listingModel: Listing = {
    title: '',
    description: '',
    category: 'pg',
    rentAmount: 10000,
    depositAmount: 20000,
    genderPreference: 'any',
    bathroomType: 'attached',
    furnishing: '',
    curfewTime: '',
    ac: 'ac',
    wifi: false,
    parking: false,
    laundry: false,
    foodIncluded: false,
    foodType: 'veg',
    addressText: '',
    latitude: 28.62,
    longitude: 77.36,
    status: 'available',
    availableFromDate: ''
  };

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    if (!this.authService.isAuthenticated()) return;
    const role = this.authService.userRole();

    if (role === 'visitor') {
      this.loadVisitorData();
    } else if (role === 'owner') {
      this.loadOwnerData();
    }
  }

  loadVisitorData(): void {
    this.toursService.getVisitorTours().subscribe(res => this.tours.set(res));
    this.alertsService.getSavedSearches().subscribe(res => this.alerts.set(res));
    this.favoritesService.getFavorites(0, 100).subscribe(res => this.favorites.set(res.content || []));
  }

  loadOwnerData(): void {
    this.listingsService.getMyListings(0, 100).subscribe(res => this.properties.set(res.content || []));
    this.toursService.getOwnerTours().subscribe(res => this.ownerTours.set(res));
  }

  cancelTour(tourId: string): void {
    this.toursService.updateTourStatus(tourId, 'cancelled').subscribe({
      next: () => {
        this.showToast('Site visit request cancelled.');
        this.loadData();
      }
    });
  }

  deleteAlert(alertId: string): void {
    this.alertsService.deleteSearch(alertId).subscribe({
      next: () => {
        this.showToast('Saved search alert removed.');
        this.loadData();
      }
    });
  }

  removeFavorite(listingId: string): void {
    this.favoritesService.toggleFavorite(listingId).subscribe({
      next: () => {
        this.showToast('Removed from favorites.');
        this.loadData();
      }
    });
  }

  // Owner Actions
  toggleAddForm(): void {
    this.showAddForm.set(!this.showAddForm());
    if (!this.showAddForm()) {
      this.resetForm();
    } else {
      setTimeout(() => this.initLeafletMap(), 100);
    }
  }

  resetForm(): void {
    this.editMode.set(false);
    this.listingModel = {
      title: '',
      description: '',
      category: 'pg',
      rentAmount: 10000,
      depositAmount: 20000,
      genderPreference: 'any',
      bathroomType: 'attached',
      furnishing: '',
      curfewTime: '',
      ac: 'ac',
      wifi: false,
      parking: false,
      laundry: false,
      foodIncluded: false,
      foodType: 'veg',
      addressText: '',
      latitude: 28.62,
      longitude: 77.36,
      status: 'available',
      availableFromDate: ''
    };
  }

  editListing(listing: Listing): void {
    this.listingModel = { ...listing };
    this.editMode.set(true);
    this.showAddForm.set(true);
    setTimeout(() => this.initLeafletMap(), 100);
  }

  onStatusChange(): void {
    if (this.listingModel.status !== 'available_from') {
      this.listingModel.availableFromDate = undefined;
    }
  }

  saveListing(): void {
    if (this.listingModel.status === 'available_from' && !this.listingModel.availableFromDate) {
      this.showToast('Please specify the date property is available from.', true);
      return;
    }
    if (!this.listingModel.title || !this.listingModel.addressText) {
      this.showToast('Listing Title and Address are required.', true);
      return;
    }

    // Sanitize payload: remove empty optional strings that break backend validation
    const payload: any = {
      ...this.listingModel,
      cityId: 1, // Noida = cityId 1
      curfewTime: this.listingModel.curfewTime?.trim() || undefined,
      availableFromDate: this.listingModel.availableFromDate?.trim() || undefined,
      depositAmount: this.listingModel.depositAmount || undefined,
      description: this.listingModel.description?.trim() || undefined,
      ac: this.listingModel.ac || undefined,
      furnishing: this.listingModel.furnishing?.trim() || undefined,
      bathroomType: this.listingModel.bathroomType || undefined,
      foodType: this.listingModel.foodIncluded ? (this.listingModel.foodType || 'veg') : undefined,
    };
    // Remove undefined keys so JSON.stringify omits them
    Object.keys(payload).forEach(k => payload[k] === undefined && delete payload[k]);

    if (this.editMode() && this.listingModel.id) {
      this.listingsService.updateListing(this.listingModel.id, payload).subscribe({
        next: () => {
          this.showToast('Listing updated successfully!');
          this.toggleAddForm();
          this.loadData();
        },
        error: (err) => {
          console.error('Failed to update listing', err);
          let msg = err?.error?.message || err?.message || 'Update failed. Please try again.';
          if (err?.status === 403) {
            msg = 'Access Forbidden (403): Your account role on the server is not authorized as OWNER. Please register a new account as Owner.';
          }
          this.showToast(msg, true);
        }
      });
    } else {
      this.listingsService.createListing(payload).subscribe({
        next: () => {
          this.showToast('Listing posted successfully!');
          this.toggleAddForm();
          this.loadData();
        },
        error: (err) => {
          console.error('Failed to create listing', err);
          let msg = err?.error?.message || err?.message || 'Failed to save listing. Please try again.';
          if (err?.status === 403) {
            msg = 'Access Forbidden (403): Your account role on the server is not authorized as OWNER. Please register a new account as Owner.';
          }
          this.showToast(msg, true);
        }
      });
    }
  }

  toggleAvailability(listing: Listing): void {
    const nextStatus = listing.status === 'available' ? 'occupied' : 'available';
    this.listingsService.updateStatus(listing.id!, nextStatus).subscribe({
      next: () => {
        this.showToast(`Status updated to ${nextStatus.toUpperCase()}.`);
        this.loadData();
      }
    });
  }

  deleteListing(listingId: string): void {
    if (confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
      this.listingsService.deleteListing(listingId).subscribe({
        next: () => {
          this.showToast('Listing deleted successfully.');
          this.loadData();
        }
      });
    }
  }

  updateTourStatus(tourId: string, status: string): void {
    this.toursService.updateTourStatus(tourId, status).subscribe({
      next: () => {
        this.showToast(`Site visit request ${status}.`);
        this.loadData();
      }
    });
  }

  onUploadImage(listingId: string, event: any): void {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];

      // Client-side file size check (10MB maximum)
      const maxSizeBytes = 10 * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        this.showToast('File size exceeds the 10MB limit.', true);
        return;
      }

      // Client-side MIME type check
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(file.type.toLowerCase())) {
        this.showToast('Invalid image format. Please select JPG, PNG, WEBP, or GIF.', true);
        return;
      }

      this.showToast('Uploading photo to storage...');
      this.listingsService.uploadListingImage(listingId, file).subscribe({
        next: () => {
          this.showToast('Photo uploaded successfully!');
          this.loadData();
        },
        error: (err) => {
          console.error('Image upload error:', err);
          let msg = 'Media upload failed.';

          if (err?.status === 0 || (err?.name === 'HttpErrorResponse' && err?.status === 0)) {
            msg = 'Upload failed due to CORS or network error reaching storage bucket.';
          } else if (err?.error?.message) {
            msg = err.error.message;
          } else if (typeof err?.error === 'string' && err.error.length > 0 && err.error.length < 200) {
            msg = err.error;
          } else if (err?.message) {
            msg = err.message;
          }

          this.showToast(msg, true);
        }
      });
    }
  }

  deleteImage(listingId: string, mediaId: string): void {
    if (confirm('Delete this photo?')) {
      this.listingsService.deleteListingImage(listingId, mediaId).subscribe({
        next: () => {
          this.showToast('Photo deleted.');
          this.loadData();
        }
      });
    }
  }

  // Leaflet map initialization
  initLeafletMap(): void {
    const container = document.getElementById('dashboard-map');
    if (!container) return;

    if (this.leafletMap) {
      try {
        this.leafletMap.remove();
      } catch (e) {
        console.error(e);
      }
      this.leafletMap = null;
      this.leafletMarker = null;
    }

    const L = (window as any).L;
    if (!L) {
      console.warn('Leaflet library is not loaded on window.');
      return;
    }

    const startLat = this.listingModel.latitude || 28.62;
    const startLng = this.listingModel.longitude || 77.36;

    // Initialize Leaflet Map centered at selected coordinates or Noida center
    this.leafletMap = L.map('dashboard-map').setView([startLat, startLng], 13);

    // Add standard OpenStreetMap roads/streets layer (fast, clean, attribution-contained)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.leafletMap);

    // Place draggable marker
    this.leafletMarker = L.marker([startLat, startLng], {
      draggable: true
    }).addTo(this.leafletMap);

    // Update form coordinates on dragend
    this.leafletMarker.on('dragend', () => {
      const position = this.leafletMarker.getLatLng();
      this.listingModel.latitude = Math.round(position.lat * 10000) / 10000;
      this.listingModel.longitude = Math.round(position.lng * 10000) / 10000;
    });

    // Update marker and form coordinates on map click
    this.leafletMap.on('click', (e: any) => {
      const coords = e.latlng;
      this.leafletMarker.setLatLng(coords);
      this.listingModel.latitude = Math.round(coords.lat * 10000) / 10000;
      this.listingModel.longitude = Math.round(coords.lng * 10000) / 10000;
    });

    // Solve map canvas sizing/rendering inside hidden Angular container grids
    setTimeout(() => {
      if (this.leafletMap) {
        this.leafletMap.invalidateSize();
      }
    }, 150);
  }

  showToast(msg: string, isError = false): void {
    this.toastMsg.set(msg);
    this.toastError.set(isError);
    setTimeout(() => {
      this.toastMsg.set('');
      this.toastError.set(false);
    }, 4000);
  }
}
