import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-container">
      <h2>Platform Moderation Desk</h2>
      <p class="subtitle">Supervise Noida platform metrics, moderate users/listings, and review real-time security audit trails.</p>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <span class="label">Total Members</span>
          <span class="value">{{ totalUsers() }}</span>
        </div>
        <div class="stat-card">
          <span class="label">Properties Listed</span>
          <span class="value">{{ totalListings() }}</span>
        </div>
        <div class="stat-card">
          <span class="label">Chat Messages</span>
          <span class="value">{{ totalMessages() }}</span>
        </div>
      </div>

      <div class="admin-layout">
        <!-- Left: Moderation Operations -->
        <div class="section moderation-section">
          <h3>Moderation Actions</h3>
          <div class="mod-actions-grid">
            <div class="mod-card">
              <h4>Manage User Account</h4>
              <p class="card-desc">Suspend or reactivate a member profile. Disables posting/connecting.</p>
              <div class="input-action-row">
                <input
                  type="text"
                  placeholder="Enter User UUID"
                  [(ngModel)]="userIdToModerate"
                  class="control-input"
                />
                <button (click)="suspendUser()" class="btn btn-red">Suspend</button>
                <button (click)="unsuspendUser()" class="btn btn-green">Reactivate</button>
              </div>
            </div>

            <div class="mod-card">
              <h4>Moderate Listing</h4>
              <p class="card-desc">Flag a listing. Set status to OCCUPIED to hide from search immediately.</p>
              <div class="input-action-row">
                <input
                  type="text"
                  placeholder="Enter Listing UUID"
                  [(ngModel)]="listingIdToModerate"
                  class="control-input"
                />
                <button (click)="suspendListing()" class="btn btn-orange">Suspend Listing</button>
                <button (click)="deleteListing()" class="btn btn-red-filled">Delete Listing</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Audit Logs Paged List -->
        <div class="section audit-section">
          <h3>🛡️ Platform Security Audit Trail ({{ auditLogs().length }})</h3>
          <div class="audit-list">
            @for (log of auditLogs(); track log.id) {
              <div class="audit-item">
                <div class="audit-meta">
                  <span class="action-tag">{{ log.action }}</span>
                  <span class="timestamp">{{ log.timestamp | date:'medium' }}</span>
                </div>
                <div class="audit-details">
                  <p>Target: <strong>{{ log.targetType }}</strong> ({{ log.targetId }})</p>
                  <p class="admin">Admin ID: {{ log.adminId }}</p>
                </div>
              </div>
            } @empty {
              <div class="empty-audit">No audit trail logs recorded yet.</div>
            }
          </div>
        </div>
      </div>

      @if (toastMsg()) {
        <div class="toast-popup">
          {{ toastMsg() }}
        </div>
      }
    </div>
  `,
  styles: [`
    .admin-container {
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
      margin: 0.3rem 0 2rem 0;
      font-size: 0.95rem;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }
    .stat-card {
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .stat-card .label {
      color: rgba(255, 255, 255, 0.5);
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .stat-card .value {
      color: #fff;
      font-size: 2.2rem;
      font-weight: 800;
    }
    .admin-layout {
      display: grid;
      grid-template-columns: 1.2fr 1fr;
      gap: 2rem;
    }
    @media (max-width: 900px) {
      .admin-layout {
        grid-template-columns: 1fr;
      }
    }
    .section {
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      padding: 1.5rem;
    }
    .section h3 {
      color: #fff;
      margin: 0 0 1.2rem 0;
      font-size: 1.1rem;
      font-weight: 700;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      padding-bottom: 0.5rem;
    }
    .mod-actions-grid {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .mod-card {
      background: rgba(255, 255, 255, 0.01);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      padding: 1.2rem;
    }
    .mod-card h4 {
      color: #fff;
      margin: 0 0 0.3rem 0;
      font-size: 0.95rem;
    }
    .card-desc {
      color: rgba(255, 255, 255, 0.55);
      font-size: 0.8rem;
      margin: 0 0 1rem 0;
      line-height: 1.4;
    }
    .input-action-row {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }
    .control-input {
      flex: 1;
      background: #1a1a24;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 6px;
      color: #fff;
      padding: 0.55rem;
      outline: none;
      font-size: 0.8rem;
      min-width: 160px;
    }
    .btn {
      border: 0;
      font-size: 0.75rem;
      font-weight: 700;
      padding: 0.55rem 1rem;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .btn-red { background: transparent; border: 1px solid #ff1744; color: #ff1744; }
    .btn-red:hover { background: rgba(255, 23, 68, 0.1); }
    .btn-green { background: transparent; border: 1px solid #00e676; color: #00e676; }
    .btn-green:hover { background: rgba(0, 230, 118, 0.1); }
    .btn-orange { background: transparent; border: 1px solid #ffb800; color: #ffb800; }
    .btn-orange:hover { background: rgba(255, 184, 0, 0.1); }
    .btn-red-filled { background: #ff1744; color: #fff; }
    .btn-red-filled:hover { background: #d50000; }

    /* Audit Logs styles */
    .audit-list {
      max-height: 480px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 0.8rem;
      padding-right: 0.5rem;
    }
    .audit-item {
      background: rgba(255, 255, 255, 0.01);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      padding: 0.8rem 1rem;
    }
    .audit-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }
    .action-tag {
      background: rgba(0, 242, 254, 0.15);
      color: #00f2fe;
      font-size: 0.65rem;
      font-weight: 800;
      padding: 0.15rem 0.4rem;
      border-radius: 4px;
    }
    .timestamp {
      color: rgba(255, 255, 255, 0.4);
      font-size: 0.7rem;
    }
    .audit-details p {
      margin: 0;
      font-size: 0.8rem;
      color: rgba(255, 255, 255, 0.8);
      line-height: 1.5;
    }
    .audit-details p.admin {
      color: rgba(255, 255, 255, 0.45);
      font-size: 0.75rem;
    }
    .empty-audit {
      text-align: center;
      color: rgba(255, 255, 255, 0.4);
      font-size: 0.8rem;
      padding: 2rem 0;
    }
    .toast-popup {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      background: rgba(0, 242, 254, 0.95);
      color: #121218;
      padding: 0.8rem 1.5rem;
      border-radius: 8px;
      font-weight: 750;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      z-index: 2000;
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  private readonly adminService = inject(AdminService);

  totalUsers = signal(0);
  totalListings = signal(0);
  totalMessages = signal(0);

  auditLogs = signal<any[]>([]);

  userIdToModerate = '';
  listingIdToModerate = '';
  toastMsg = signal('');

  ngOnInit(): void {
    this.loadMetrics();
    this.loadAuditLogs();
  }

  loadMetrics(): void {
    this.adminService.getMetrics().subscribe({
      next: (res) => {
        this.totalUsers.set(res.totalUsers || 0);
        this.totalListings.set(res.totalListings || 0);
        this.totalMessages.set(res.totalMessages || 0);
      }
    });
  }

  loadAuditLogs(): void {
    this.adminService.getAuditLogs(0, 50).subscribe({
      next: (res) => this.auditLogs.set(res.content || [])
    });
  }

  suspendUser(): void {
    if (!this.userIdToModerate) return;
    this.adminService.suspendUser(this.userIdToModerate).subscribe({
      next: () => {
        this.showToast('User suspended successfully!');
        this.userIdToModerate = '';
        this.loadMetrics();
        this.loadAuditLogs();
      },
      error: () => this.showToast('Failed to suspend user. Check UUID.')
    });
  }

  unsuspendUser(): void {
    if (!this.userIdToModerate) return;
    this.adminService.unsuspendUser(this.userIdToModerate).subscribe({
      next: () => {
        this.showToast('User account reactivated!');
        this.userIdToModerate = '';
        this.loadMetrics();
        this.loadAuditLogs();
      },
      error: () => this.showToast('Failed to reactivate user. Check UUID.')
    });
  }

  suspendListing(): void {
    if (!this.listingIdToModerate) return;
    this.adminService.suspendListing(this.listingIdToModerate).subscribe({
      next: () => {
        this.showToast('Listing flagged and set to occupied!');
        this.listingIdToModerate = '';
        this.loadMetrics();
        this.loadAuditLogs();
      },
      error: () => this.showToast('Failed to suspend listing. Check UUID.')
    });
  }

  deleteListing(): void {
    if (!this.listingIdToModerate) return;
    if (confirm('Permanently delete this listing from platform?')) {
      this.adminService.deleteListing(this.listingIdToModerate).subscribe({
        next: () => {
          this.showToast('Listing permanently deleted.');
          this.listingIdToModerate = '';
          this.loadMetrics();
          this.loadAuditLogs();
        },
        error: () => this.showToast('Failed to delete listing. Check UUID.')
      });
    }
  }

  showToast(msg: string): void {
    this.toastMsg.set(msg);
    setTimeout(() => this.toastMsg.set(''), 3000);
  }
}
