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
              <h3>📅 Scheduled Site Visits ({{ tours().length }})</h3>
              <div class="tours-list">
                @for (t of tours(); track t.id) {
                  <div class="tour-card" [ngClass]="t.status">
                    <div class="tour-info">
                      <strong>{{ t.listingTitle }}</strong>
                      <span class="address">📍 {{ t.listingAddress }}</span>
                      <span class="time">🕒 {{ t.requestedTime | date:'medium' }}</span>
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
              <h3>🔔 Active Saved Searches ({{ alerts().length }})</h3>
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
                    <button (click)="deleteAlert(a.id)" class="delete-icon">🗑️</button>
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
              <h3>❤️ Saved Favorites ({{ favorites().length }})</h3>
              <div class="favorites-grid">
                @for (f of favorites(); track f.listingId) {
                  <div class="fav-card">
                    <div class="card-details">
                      <h4>Listing Details</h4>
                      <p class="address">📍 Listing ID: {{ f.listingId }}</p>
                      <div class="fav-actions">
                        <a [routerLink]="['/listings', f.listingId]" class="details-link">View Details</a>
                        <button (click)="removeFavorite(f.listingId)" class="remove-fav-btn">Remove</button>
                      </div>
                    </div>
                  </div>
                } @empty {
                  <div class="empty-list text-center" style="padding: 2rem 0;">
                    <span>🤍</span>
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
              {{ showAddForm() ? 'Close Form' : '➕ List New Property' }}
            </button>
          </div>

          <!-- Add / Edit Listing Form -->
          @if (showAddForm()) {
            <div class="section form-section">
              <h3>{{ editMode() ? '✏️ Edit Listing Details' : '🏠 List a Noida Room/Flat' }}</h3>
              <form (ngSubmit)="saveListing()" class="form-grid">
                <div class="form-group">
                  <label for="title">Listing Title</label>
                  <input type="text" id="title" name="title" [(ngModel)]="listingModel.title" required placeholder="Aesthetic Cozy Room near Sector 62" />
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
                <div class="form-group">
                  <label for="lat">Latitude (Noida map placement)</label>
                  <input type="number" step="0.0001" id="lat" name="lat" [(ngModel)]="listingModel.latitude" required placeholder="28.62" />
                </div>
                <div class="form-group">
                  <label for="lng">Longitude</label>
                  <input type="number" step="0.0001" id="lng" name="lng" [(ngModel)]="listingModel.longitude" required placeholder="77.36" />
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
              <h3>🏠 My Property Listings ({{ properties().length }})</h3>
              <div class="properties-list">
                @for (p of properties(); track p.id) {
                  <div class="property-card">
                    <div class="prop-details">
                      <h4>{{ p.title }}</h4>
                      <span class="rent">Rent: ₹{{ p.rentAmount }}</span>
                      <span class="address">📍 {{ p.addressText }}</span>
                      <span class="status-indicator" [ngClass]="p.status">{{ p.status | uppercase }}</span>
                    </div>
                    
                    <!-- S3 Media Uploading Widget inside Card -->
                    <div class="media-upload-section">
                      <h5>📸 Media Gallery ({{ p.media?.length || 0 }})</h5>
                      <div class="gallery-thumbs">
                        @for (m of p.media; track m.id) {
                          <div class="thumb-wrapper">
                            <span class="thumb-placeholder">🖼️</span>
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
              <h3>📥 Site Visit Requests ({{ ownerTours().length }})</h3>
              <div class="owner-tours-list">
                @for (t of ownerTours(); track t.id) {
                  <div class="tour-request-card" [ngClass]="t.status">
                    <div class="req-info">
                      <strong>{{ t.listingTitle }}</strong>
                      <span class="visitor">Visitor ID: {{ t.visitorId }}</span>
                      <span class="time">🕒 {{ t.requestedTime | date:'medium' }}</span>
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
        <div class="toast-popup">
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
      color: #fff;
      margin: 0;
      font-weight: 800;
      letter-spacing: -0.5px;
    }
    .subtitle {
      color: rgba(255, 255, 255, 0.5);
      margin: 0.3rem 0 1.5rem 0;
      font-size: 0.95rem;
    }
    .section {
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
    }
    .section h3 {
      color: #fff;
      margin: 0 0 1.2rem 0;
      font-size: 1.1rem;
      font-weight: 700;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      padding-bottom: 0.5rem;
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
      color: rgba(255, 255, 255, 0.4);
      font-size: 0.85rem;
      padding: 1rem 0;
    }
    /* Tours / Alerts Style */
    .tour-card, .alert-card, .tour-request-card {
      background: rgba(255, 255, 255, 0.01);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      padding: 1rem;
      margin-bottom: 0.8rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
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
      color: #fff;
      font-size: 0.95rem;
    }
    .tour-info .address, .visitor {
      color: rgba(255, 255, 255, 0.5);
      font-size: 0.8rem;
    }
    .tour-info .time, .time {
      color: #00f2fe;
      font-size: 0.8rem;
      font-weight: 600;
    }
    .notes {
      color: rgba(255, 255, 255, 0.6);
      font-size: 0.8rem;
      font-style: italic;
      margin: 0.3rem 0 0 0;
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
    .status-badge.cancelled { background: rgba(255, 255, 255, 0.08); color: rgba(255,255,255,0.4); }
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
      color: rgba(255, 255, 255, 0.5);
      font-size: 0.8rem;
    }
    .delete-icon {
      background: transparent;
      border: 0;
      cursor: pointer;
      font-size: 1.1rem;
      opacity: 0.6;
      transition: opacity 0.2s ease;
    }
    .delete-icon:hover {
      opacity: 1;
    }

    /* Favorites column styles */
    .favorites-grid {
      display: flex;
      flex-direction: column;
      gap: 0.8rem;
    }
    .fav-card {
      background: rgba(255, 255, 255, 0.01);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      padding: 1rem;
    }
    .fav-card h4 {
      color: #fff;
      margin: 0;
      font-size: 0.9rem;
    }
    .fav-actions {
      display: flex;
      justify-content: space-between;
      margin-top: 0.5rem;
    }
    .details-link {
      color: #00f2fe;
      text-decoration: none;
      font-size: 0.8rem;
      font-weight: 600;
    }
    .remove-fav-btn {
      background: transparent;
      border: 0;
      color: rgba(255, 255, 255, 0.4);
      font-size: 0.8rem;
      cursor: pointer;
      text-decoration: underline;
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
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      padding-bottom: 1rem;
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
      background: rgba(255, 255, 255, 0.01);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      padding: 1.2rem;
      margin-bottom: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.8rem;
    }
    .prop-details h4 {
      color: #fff;
      margin: 0 0 0.3rem 0;
      font-size: 1.05rem;
    }
    .prop-details span {
      display: block;
      font-size: 0.8rem;
      color: rgba(255, 255, 255, 0.5);
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
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #fff;
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.35rem 0.8rem;
      border-radius: 4px;
      cursor: pointer;
    }
    .prop-actions button.delete-btn {
      color: #ff1744;
      border-color: rgba(255, 23, 68, 0.2);
    }
    .prop-actions button.delete-btn:hover {
      background: rgba(255, 23, 68, 0.1);
    }
    .prop-actions button:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    /* Media Upload Area in property card */
    .media-upload-section {
      background: rgba(255, 255, 255, 0.01);
      border: 1px dashed rgba(255, 255, 255, 0.15);
      border-radius: 6px;
      padding: 0.8rem;
    }
    .media-upload-section h5 {
      margin: 0 0 0.5rem 0;
      color: rgba(255, 255, 255, 0.7);
      font-size: 0.75rem;
    }
    .gallery-thumbs {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-bottom: 0.6rem;
    }
    .thumb-wrapper {
      position: relative;
      width: 40px;
      height: 40px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .thumb-placeholder {
      font-size: 0.9rem;
    }
    .del-thumb-btn {
      position: absolute;
      top: -4px;
      right: -4px;
      width: 14px;
      height: 14px;
      background: #ff1744;
      border: 0;
      border-radius: 50%;
      color: #fff;
      font-size: 0.65rem;
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
      color: #00f2fe;
      font-size: 0.7rem;
      font-weight: 700;
      padding: 0.25rem 0.6rem;
      border-radius: 4px;
      cursor: pointer;
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
      color: rgba(255, 255, 255, 0.7);
      font-size: 0.8rem;
      font-weight: 600;
    }
    .form-group input:not([type="checkbox"]), .form-group select, .form-group textarea {
      background: #1a1a24;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 6px;
      color: #fff;
      padding: 0.6rem;
      outline: none;
      font-family: inherit;
    }
    .form-group.full-width {
      grid-column: 1 / -1;
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
      color: rgba(255,255,255,0.7);
      font-size: 0.85rem;
      cursor: pointer;
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
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: #fff;
      font-weight: 600;
      padding: 0.7rem 1.5rem;
      border-radius: 6px;
      cursor: pointer;
    }

    /* Toast popup styles */
    .toast-popup {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      background: rgba(0, 242, 254, 0.95);
      backdrop-filter: blur(10px);
      color: #121218;
      padding: 0.8rem 1.5rem;
      border-radius: 8px;
      font-weight: 750;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      z-index: 2000;
      animation: slideUp 0.3s ease;
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
  }

  onStatusChange(): void {
    if (this.listingModel.status !== 'available_from') {
      this.listingModel.availableFromDate = undefined;
    }
  }

  saveListing(): void {
    if (this.listingModel.status === 'available_from' && !this.listingModel.availableFromDate) {
      this.showToast('Please specify the date property is available from.');
      return;
    }

    if (this.editMode() && this.listingModel.id) {
      this.listingsService.updateListing(this.listingModel.id, this.listingModel).subscribe({
        next: () => {
          this.showToast('Listing updated successfully!');
          this.toggleAddForm();
          this.loadData();
        }
      });
    } else {
      this.listingsService.createListing(this.listingModel).subscribe({
        next: () => {
          this.showToast('Listing posted successfully!');
          this.toggleAddForm();
          this.loadData();
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
      this.showToast('Uploading photo to MinIO storage...');
      this.listingsService.uploadListingImage(listingId, file).subscribe({
        next: () => {
          this.showToast('Photo uploaded successfully!');
          this.loadData();
        },
        error: (err) => {
          console.error(err);
          this.showToast('Media upload failed. Bucket configurations missing or incorrect.');
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

  showToast(msg: string): void {
    this.toastMsg.set(msg);
    setTimeout(() => this.toastMsg.set(''), 3500);
  }
}
