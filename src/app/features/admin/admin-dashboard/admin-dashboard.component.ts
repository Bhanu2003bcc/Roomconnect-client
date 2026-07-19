import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';

interface AdminUser {
  id: string;
  phone: string;
  email: string;
  role: string;
  status: string;
  fullName: string;
  createdAt: string;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-container">
      <div class="header-section">
        <h2>Platform Operations Hub</h2>
        <p class="subtitle">Supervise platform metrics, manage users across categories, moderate listings, and review audit logs.</p>
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <span class="label">Total Platform Members</span>
          <span class="value">{{ totalUsers() }}</span>
        </div>
        <div class="stat-card">
          <span class="label">Total Real Estate Listings</span>
          <span class="value">{{ totalListingsCount() }}</span>
        </div>
        <div class="stat-card">
          <span class="label">Chat Messages Sent</span>
          <span class="value">{{ totalMessages() }}</span>
        </div>
      </div>

      <div class="main-grid">
        <!-- Left Pane: User & Listing Management -->
        <div class="left-pane">
          
          <!-- Section: Add User Form -->
          <div class="section-card">
            <h3>Add New Platform Member</h3>
            <p class="card-desc">Instantly register a new administrator, owner, or visitor profile.</p>
            <form (ngSubmit)="addUser()" #userForm="ngForm" class="add-user-form">
              <div class="form-grid">
                <div class="form-group">
                  <label for="newFullName">Full Name *</label>
                  <input
                    type="text"
                    id="newFullName"
                    name="fullName"
                    [(ngModel)]="newUser.fullName"
                    required
                    placeholder="John Doe"
                    class="form-control"
                  />
                </div>
                <div class="form-group">
                  <label for="newPhone">Phone Number (10 digits) *</label>
                  <div class="phone-wrapper">
                    <span class="prefix">+91</span>
                    <input
                      type="text"
                      id="newPhone"
                      name="phone"
                      [(ngModel)]="newUser.phone"
                      required
                      pattern="^[0-9]{10}$"
                      placeholder="9876543210"
                      class="form-control phone-input"
                    />
                  </div>
                </div>
                <div class="form-group">
                  <label for="newEmail">Email Address</label>
                  <input
                    type="email"
                    id="newEmail"
                    name="email"
                    [(ngModel)]="newUser.email"
                    placeholder="john@example.com"
                    class="form-control"
                  />
                </div>
                <div class="form-group">
                  <label for="newRole">System Role *</label>
                  <select
                    id="newRole"
                    name="role"
                    [(ngModel)]="newUser.role"
                    required
                    class="form-control"
                  >
                    <option value="visitor">Visitor</option>
                    <option value="owner">Owner</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              <button type="submit" [disabled]="!userForm.form.valid" class="btn btn-blue-filled mt-3">
                Register User
              </button>
            </form>
          </div>

          <!-- Section: User Moderation Sections -->
          <div class="section-card">
            <div class="section-header">
              <h3>Member Directories</h3>
              <!-- Tab selection -->
              <div class="tabs-container">
                <button [class.active]="activeUserTab() === 'visitors'" (click)="activeUserTab.set('visitors')">
                  Visitors ({{ visitors().length }})
                </button>
                <button [class.active]="activeUserTab() === 'owners'" (click)="activeUserTab.set('owners')">
                  Owners ({{ owners().length }})
                </button>
                <button [class.active]="activeUserTab() === 'admins'" (click)="activeUserTab.set('admins')">
                  Admins ({{ admins().length }})
                </button>
              </div>
            </div>

            <!-- Users List Table -->
            <div class="table-wrapper">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Full Name</th>
                    <th>Phone</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th class="actions-col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  @for (u of getSelectedUserList(); track u.id) {
                    <tr>
                      <td class="bold-text">{{ u.fullName || 'Admin User' }}</td>
                      <td>{{ u.phone }}</td>
                      <td>{{ u.email || 'N/A' }}</td>
                      <td>
                        <span class="status-pill" [class.suspended]="u.status === 'suspended'">
                          {{ u.status | uppercase }}
                        </span>
                      </td>
                      <td class="actions-cell">
                        @if (u.status === 'active') {
                          <button (click)="suspendUser(u.id)" class="btn btn-sm btn-orange-outline">Suspend</button>
                        } @else {
                          <button (click)="unsuspendUser(u.id)" class="btn btn-sm btn-green-outline">Activate</button>
                        }
                        <button (click)="deleteUser(u.id)" class="btn btn-sm btn-red-filled ml-1">Delete</button>
                      </td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="5" class="empty-cell">No members registered in this category.</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>

          <!-- Section: Properties Moderation -->
          <div class="section-card">
            <h3>Supervise All Properties ({{ listings().length }})</h3>
            <p class="card-desc">Review and manage every listing on the platform.</p>
            <div class="table-wrapper">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Property Title</th>
                    <th>Type</th>
                    <th>Monthly Rent</th>
                    <th>Status</th>
                    <th class="actions-col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  @for (l of listings(); track l.id) {
                    <tr>
                      <td class="bold-text">{{ l.title }}</td>
                      <td><span class="category-tag">{{ l.category | uppercase }}</span></td>
                      <td>₹{{ l.rentAmount | number }}</td>
                      <td>
                        <span class="status-pill" [class.suspended]="l.status !== 'available'">
                          {{ l.status | uppercase }}
                        </span>
                      </td>
                      <td class="actions-cell">
                        @if (l.status === 'available') {
                          <button (click)="suspendListing(l.id)" class="btn btn-sm btn-orange-outline">Mark Occupied</button>
                        }
                        <button (click)="deleteListing(l.id)" class="btn btn-sm btn-red-filled ml-1">Delete</button>
                      </td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="5" class="empty-cell">No listings published on the platform.</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>

        </div>

        <!-- Right Pane: Platform Audit Trail -->
        <div class="right-pane">
          <div class="section-card sticky-audit">
            <h3>🛡️ Security & Operations Audit Trail</h3>
            <p class="card-desc">Real-time log of administrative and system moderation actions.</p>
            <div class="audit-list">
              @for (log of auditLogs(); track log.id) {
                <div class="audit-item">
                  <div class="audit-meta">
                    <span class="action-tag" [class.delete-act]="log.action.includes('DELETE')">
                      {{ log.action }}
                    </span>
                    <span class="timestamp">{{ log.timestamp | date:'medium' }}</span>
                  </div>
                  <div class="audit-details">
                    <p>Target Type: <strong>{{ log.targetType }}</strong></p>
                    <p>Target ID: <span class="uuid-text">{{ log.targetId }}</span></p>
                    <p class="admin-actor">Triggered By: {{ log.adminId }}</p>
                  </div>
                </div>
              } @empty {
                <div class="empty-audit">No audit trail events recorded yet.</div>
              }
            </div>
          </div>
        </div>
      </div>

      <!-- Toast Popups -->
      @if (toastMsg()) {
        <div class="toast-popup">
          {{ toastMsg() }}
        </div>
      }
    </div>
  `,
  styles: [`
    .admin-container {
      max-width: 1400px;
      margin: 2rem auto;
      padding: 0 1.5rem;
      min-height: calc(100vh - 180px);
      color: #e2e8f0;
      font-family: 'Outfit', sans-serif;
    }
    .header-section {
      margin-bottom: 2rem;
    }
    h2 {
      color: #fff;
      font-size: 2.2rem;
      font-weight: 800;
      letter-spacing: -1px;
      background: linear-gradient(135deg, #fff 30%, #a5b4fc);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin: 0;
    }
    .subtitle {
      color: rgba(255, 255, 255, 0.55);
      margin-top: 0.4rem;
      font-size: 1rem;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2.5rem;
    }
    .stat-card {
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 16px;
      padding: 1.8rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      backdrop-filter: blur(10px);
      transition: transform 0.3s ease, border-color 0.3s ease;
    }
    .stat-card:hover {
      transform: translateY(-4px);
      border-color: rgba(165, 180, 252, 0.3);
    }
    .stat-card .label {
      color: rgba(255, 255, 255, 0.45);
      font-size: 0.85rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .stat-card .value {
      color: #fff;
      font-size: 2.5rem;
      font-weight: 800;
      text-shadow: 0 0 10px rgba(165, 180, 252, 0.2);
    }
    .main-grid {
      display: grid;
      grid-template-columns: 1.6fr 1fr;
      gap: 2.5rem;
      align-items: start;
    }
    @media (max-width: 1024px) {
      .main-grid {
        grid-template-columns: 1fr;
      }
    }
    .left-pane {
      display: flex;
      flex-direction: column;
      gap: 2.5rem;
    }
    .section-card {
      background: rgba(255, 255, 255, 0.015);
      border: 1px solid rgba(255, 255, 255, 0.07);
      border-radius: 20px;
      padding: 2rem;
      backdrop-filter: blur(12px);
      box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.2);
    }
    .section-card h3 {
      color: #fff;
      font-size: 1.3rem;
      font-weight: 700;
      margin: 0 0 0.5rem 0;
    }
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
      margin-bottom: 1.5rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      padding-bottom: 1rem;
    }
    .section-header h3 {
      margin: 0;
    }
    .card-desc {
      color: rgba(255, 255, 255, 0.45);
      font-size: 0.85rem;
      margin: 0 0 1.5rem 0;
      line-height: 1.5;
    }
    .tabs-container {
      display: flex;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 8px;
      padding: 0.2rem;
    }
    .tabs-container button {
      background: transparent;
      border: 0;
      color: rgba(255, 255, 255, 0.6);
      font-size: 0.8rem;
      font-weight: 600;
      padding: 0.4rem 1rem;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .tabs-container button:hover {
      color: #fff;
    }
    .tabs-container button.active {
      background: rgba(255, 255, 255, 0.08);
      color: #fff;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    
    /* Forms */
    .add-user-form .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.2rem;
    }
    @media (max-width: 600px) {
      .add-user-form .form-grid {
        grid-template-columns: 1fr;
      }
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }
    .form-group label {
      color: rgba(255, 255, 255, 0.6);
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .form-control {
      background: rgba(26, 26, 36, 0.8);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      color: #fff;
      padding: 0.75rem 1rem;
      font-size: 0.9rem;
      outline: none;
      transition: all 0.2s ease;
    }
    .form-control:focus {
      border-color: rgba(165, 180, 252, 0.5);
      box-shadow: 0 0 0 2px rgba(165, 180, 252, 0.15);
    }
    .phone-wrapper {
      display: flex;
      align-items: center;
      background: rgba(26, 26, 36, 0.8);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      padding-left: 1rem;
    }
    .phone-wrapper:focus-within {
      border-color: rgba(165, 180, 252, 0.5);
      box-shadow: 0 0 0 2px rgba(165, 180, 252, 0.15);
    }
    .phone-wrapper .prefix {
      color: rgba(255, 255, 255, 0.4);
      font-size: 0.9rem;
      margin-right: 0.4rem;
      user-select: none;
    }
    .phone-input {
      border: 0 !important;
      padding-left: 0 !important;
      background: transparent !important;
      flex: 1;
    }
    
    /* Tables */
    .table-wrapper {
      max-height: 400px;
      overflow-y: auto;
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 10px;
    }
    .data-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 0.85rem;
    }
    .data-table th {
      background: rgba(255, 255, 255, 0.03);
      color: rgba(255, 255, 255, 0.5);
      font-weight: 600;
      padding: 0.8rem 1rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.07);
    }
    .data-table td {
      padding: 0.9rem 1rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.04);
      color: rgba(255, 255, 255, 0.85);
    }
    .data-table tr:hover td {
      background: rgba(255, 255, 255, 0.01);
    }
    .bold-text {
      color: #fff !important;
      font-weight: 600;
    }
    .actions-col {
      text-align: right;
      width: 160px;
    }
    .actions-cell {
      text-align: right;
      white-space: nowrap;
    }
    .empty-cell {
      text-align: center;
      color: rgba(255, 255, 255, 0.4);
      padding: 2.5rem !important;
    }
    
    /* Pills & Tags */
    .status-pill {
      display: inline-block;
      font-size: 0.65rem;
      font-weight: 750;
      padding: 0.15rem 0.5rem;
      border-radius: 4px;
      background: rgba(16, 185, 129, 0.15);
      color: #10b981;
    }
    .status-pill.suspended {
      background: rgba(239, 68, 68, 0.15);
      color: #ef4444;
    }
    .category-tag {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      font-size: 0.65rem;
      font-weight: 700;
      padding: 0.15rem 0.4rem;
      border-radius: 4px;
      color: #a5b4fc;
    }
    
    /* Buttons */
    .btn {
      border: 0;
      font-family: inherit;
      font-size: 0.75rem;
      font-weight: 700;
      padding: 0.5rem 0.9rem;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s ease;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    .btn-sm {
      font-size: 0.7rem;
      padding: 0.35rem 0.7rem;
    }
    .btn-blue-filled {
      background: #4f46e5;
      color: #fff;
      box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
    }
    .btn-blue-filled:hover:not(:disabled) {
      background: #4338ca;
      box-shadow: 0 4px 16px rgba(79, 70, 229, 0.55);
    }
    .btn-blue-filled:disabled {
      background: rgba(255, 255, 255, 0.1);
      color: rgba(255, 255, 255, 0.3);
      cursor: not-allowed;
      box-shadow: none;
    }
    .btn-red-filled {
      background: #ef4444;
      color: #fff;
    }
    .btn-red-filled:hover {
      background: #dc2626;
    }
    .btn-orange-outline {
      background: transparent;
      border: 1px solid #f59e0b;
      color: #f59e0b;
    }
    .btn-orange-outline:hover {
      background: rgba(245, 158, 11, 0.1);
    }
    .btn-green-outline {
      background: transparent;
      border: 1px solid #10b981;
      color: #10b981;
    }
    .btn-green-outline:hover {
      background: rgba(16, 185, 129, 0.1);
    }
    .ml-1 { margin-left: 0.4rem; }
    .mt-3 { margin-top: 1rem; }
    
    /* Audit Logs */
    .sticky-audit {
      position: sticky;
      top: 2rem;
    }
    .audit-list {
      max-height: 650px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      padding-right: 0.5rem;
    }
    .audit-item {
      background: rgba(255, 255, 255, 0.01);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 12px;
      padding: 1rem;
      transition: background 0.2s ease;
    }
    .audit-item:hover {
      background: rgba(255, 255, 255, 0.02);
    }
    .audit-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.6rem;
    }
    .action-tag {
      background: rgba(79, 70, 229, 0.15);
      color: #818cf8;
      font-size: 0.65rem;
      font-weight: 800;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
    }
    .action-tag.delete-act {
      background: rgba(239, 68, 68, 0.15);
      color: #f87171;
    }
    .timestamp {
      color: rgba(255, 255, 255, 0.35);
      font-size: 0.75rem;
    }
    .audit-details p {
      margin: 0.2rem 0;
      font-size: 0.8rem;
      color: rgba(255, 255, 255, 0.75);
    }
    .uuid-text {
      font-family: monospace;
      color: rgba(255, 255, 255, 0.5);
    }
    .admin-actor {
      color: rgba(255, 255, 255, 0.4) !important;
      font-size: 0.75rem !important;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
      padding-top: 0.4rem;
      margin-top: 0.4rem !important;
    }
    .empty-audit {
      text-align: center;
      color: rgba(255, 255, 255, 0.4);
      font-size: 0.85rem;
      padding: 3rem 0;
    }
    
    /* Toasts */
    .toast-popup {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      background: #818cf8;
      color: #0f172a;
      padding: 0.9rem 1.8rem;
      border-radius: 10px;
      font-weight: 750;
      font-size: 0.9rem;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
      z-index: 2000;
      animation: fadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  private readonly adminService = inject(AdminService);

  totalUsers = signal(0);
  totalListingsCount = signal(0);
  totalMessages = signal(0);

  // Grouped user list signals
  admins = signal<AdminUser[]>([]);
  owners = signal<AdminUser[]>([]);
  visitors = signal<AdminUser[]>([]);
  activeUserTab = signal<'visitors' | 'owners' | 'admins'>('visitors');

  // Listings signal
  listings = signal<any[]>([]);

  // Audit logs signal
  auditLogs = signal<any[]>([]);

  // Add user model
  newUser = {
    fullName: '',
    phone: '',
    email: '',
    role: 'visitor' as 'visitor' | 'owner' | 'admin',
    status: 'active'
  };

  toastMsg = signal('');

  ngOnInit(): void {
    this.loadMetrics();
    this.loadUsers();
    this.loadListings();
    this.loadAuditLogs();
  }

  loadMetrics(): void {
    this.adminService.getMetrics().subscribe({
      next: (res) => {
        this.totalUsers.set(res.totalUsers || 0);
        this.totalListingsCount.set(res.totalListings || 0);
        this.totalMessages.set(res.totalMessages || 0);
      }
    });
  }

  loadUsers(): void {
    this.adminService.getUsers().subscribe({
      next: (res) => {
        this.admins.set(res.admins || []);
        this.owners.set(res.owners || []);
        this.visitors.set(res.visitors || []);
      },
      error: () => this.showToast('Failed to load user directories.')
    });
  }

  loadListings(): void {
    this.adminService.getAllListings().subscribe({
      next: (res) => {
        this.listings.set(res || []);
      },
      error: () => this.showToast('Failed to load properties list.')
    });
  }

  loadAuditLogs(): void {
    this.adminService.getAuditLogs(0, 50).subscribe({
      next: (res) => this.auditLogs.set(res.content || [])
    });
  }

  getSelectedUserList(): AdminUser[] {
    const tab = this.activeUserTab();
    if (tab === 'admins') return this.admins();
    if (tab === 'owners') return this.owners();
    return this.visitors();
  }

  addUser(): void {
    if (!this.newUser.fullName || !this.newUser.phone || this.newUser.phone.length !== 10) {
      this.showToast('Please specify a valid full name and 10-digit phone number.');
      return;
    }

    const payload = {
      ...this.newUser,
      phone: '+91' + this.newUser.phone
    };

    this.adminService.createUser(payload).subscribe({
      next: () => {
        this.showToast('New platform member registered successfully!');
        // Reset form model
        this.newUser = {
          fullName: '',
          phone: '',
          email: '',
          role: 'visitor',
          status: 'active'
        };
        // Refresh dashboard views
        this.loadMetrics();
        this.loadUsers();
        this.loadAuditLogs();
      },
      error: (err) => {
        this.showToast(err?.error?.message || 'Failed to add user. Ensure phone/email are unique.');
      }
    });
  }

  suspendUser(userId: string): void {
    this.adminService.suspendUser(userId).subscribe({
      next: () => {
        this.showToast('User suspended successfully!');
        this.loadUsers();
        this.loadAuditLogs();
      },
      error: () => this.showToast('Failed to suspend user.')
    });
  }

  unsuspendUser(userId: string): void {
    this.adminService.unsuspendUser(userId).subscribe({
      next: () => {
        this.showToast('User account reactivated!');
        this.loadUsers();
        this.loadAuditLogs();
      },
      error: () => this.showToast('Failed to reactivate user.')
    });
  }

  deleteUser(userId: string): void {
    if (confirm('CAUTION: This will permanently delete the user, their profile, their properties, chat logs, and S3/R2 files. This cannot be undone. Proceed?')) {
      if (confirm('Are you absolutely sure you want to proceed with full deletion?')) {
        this.adminService.deleteUser(userId).subscribe({
          next: () => {
            this.showToast('User and all associated content fully deleted.');
            this.loadMetrics();
            this.loadUsers();
            this.loadListings();
            this.loadAuditLogs();
          },
          error: (err) => {
            this.showToast(err?.error?.message || 'Failed to delete user.');
          }
        });
      }
    }
  }

  suspendListing(listingId: string): void {
    this.adminService.suspendListing(listingId).subscribe({
      next: () => {
        this.showToast('Listing marked as occupied.');
        this.loadListings();
        this.loadAuditLogs();
      },
      error: () => this.showToast('Failed to change listing status.')
    });
  }

  deleteListing(listingId: string): void {
    if (confirm('Permanently delete this property from the platform?')) {
      this.adminService.deleteListing(listingId).subscribe({
        next: () => {
          this.showToast('Listing permanently deleted.');
          this.loadMetrics();
          this.loadListings();
          this.loadAuditLogs();
        },
        error: () => this.showToast('Failed to delete listing.')
      });
    }
  }

  showToast(msg: string): void {
    this.toastMsg.set(msg);
    setTimeout(() => this.toastMsg.set(''), 3000);
  }
}
