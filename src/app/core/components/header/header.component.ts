import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="navbar">
      <div class="container">
        <a routerLink="/" class="logo">
          <span class="icon">⚡</span>
          <span class="text">RoomConnect</span>
        </a>
        
        <nav class="nav-links">
          <a routerLink="/" class="nav-item">Explore</a>
          
          @if (authService.isAuthenticated()) {
            @if (authService.userRole() === 'visitor') {
              <a routerLink="/dashboard" class="nav-item">My Favorites</a>
              <a routerLink="/chat" class="nav-item">Messages</a>
            }
            @if (authService.userRole() === 'owner') {
              <a routerLink="/owner/dashboard" class="nav-item">My Properties</a>
              <a routerLink="/chat" class="nav-item">Messages</a>
            }
            @if (authService.userRole() === 'admin') {
              <a routerLink="/admin" class="nav-item admin-badge">Admin Panel</a>
            }
            
            <div class="user-profile">
              <span class="phone">{{ authService.currentUser()?.phone }}</span>
              <span class="role-badge" [ngClass]="authService.userRole()">
                {{ authService.userRole() | uppercase }}
              </span>
              <button (click)="logout()" class="logout-btn">Sign Out</button>
            </div>
          } @else {
            <a routerLink="/login" class="login-btn">Sign In</a>
            <a routerLink="/signup" class="signup-btn">Get Started</a>
          }
        </nav>
      </div>
    </header>
  `,
  styles: [`
    .navbar {
      background: rgba(18, 18, 24, 0.7);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      position: sticky;
      top: 0;
      z-index: 1000;
      padding: 0.8rem 1.5rem;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .logo {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      text-decoration: none;
      font-weight: 800;
      font-size: 1.4rem;
      color: #fff;
      letter-spacing: -0.5px;
    }
    .logo .icon {
      font-size: 1.5rem;
      background: linear-gradient(135deg, #00f2fe 0%, #4facfe 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .nav-links {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }
    .nav-item {
      color: rgba(255, 255, 255, 0.7);
      text-decoration: none;
      font-weight: 500;
      font-size: 0.95rem;
      transition: color 0.2s ease;
    }
    .nav-item:hover, .nav-item.active {
      color: #00f2fe;
    }
    .admin-badge {
      color: #ff3366;
    }
    .admin-badge:hover {
      color: #ff6688;
    }
    .user-profile {
      display: flex;
      align-items: center;
      gap: 0.8rem;
      border-left: 1px solid rgba(255, 255, 255, 0.15);
      padding-left: 1rem;
    }
    .phone {
      color: #fff;
      font-size: 0.9rem;
      font-weight: 500;
    }
    .role-badge {
      font-size: 0.75rem;
      font-weight: 700;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      letter-spacing: 0.5px;
    }
    .role-badge.visitor {
      background: rgba(79, 172, 254, 0.15);
      color: #4facfe;
    }
    .role-badge.owner {
      background: rgba(0, 242, 254, 0.15);
      color: #00f2fe;
    }
    .role-badge.admin {
      background: rgba(255, 51, 102, 0.15);
      color: #ff3366;
    }
    .logout-btn {
      background: transparent;
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: rgba(255, 255, 255, 0.8);
      font-size: 0.85rem;
      font-weight: 600;
      padding: 0.4rem 0.8rem;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .logout-btn:hover {
      background: rgba(255, 255, 255, 0.08);
      border-color: rgba(255, 255, 255, 0.4);
    }
    .login-btn {
      color: #fff;
      text-decoration: none;
      font-weight: 600;
      font-size: 0.95rem;
    }
    .signup-btn {
      background: linear-gradient(135deg, #00f2fe 0%, #4facfe 100%);
      color: #121218;
      text-decoration: none;
      font-weight: 700;
      font-size: 0.9rem;
      padding: 0.5rem 1.1rem;
      border-radius: 8px;
      box-shadow: 0 4px 15px rgba(0, 242, 254, 0.3);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .signup-btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(0, 242, 254, 0.4);
    }
  `]
})
export class HeaderComponent {
  protected readonly authService = inject(AuthService);

  logout(): void {
    this.authService.logout();
    window.location.href = '/';
  }
}
