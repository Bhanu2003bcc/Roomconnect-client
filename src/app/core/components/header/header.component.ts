import { Component, inject, signal, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="navbar" [class.light]="!isDark()">
      <div class="container">

        <!-- Logo -->
        <a routerLink="/" (click)="closeMobileMenu()" class="logo" id="logo-home-link">
          <svg class="logo-icon" width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 3L26 12V26H18V18H10V26H2V12L14 3Z" fill="url(#logoGrad)" stroke="url(#logoStroke)" stroke-width="1.2" stroke-linejoin="round"/>
            <circle cx="14" cy="13.5" r="2.5" fill="white" opacity="0.9"/>
            <defs>
              <linearGradient id="logoGrad" x1="2" y1="3" x2="26" y2="26" gradientUnits="userSpaceOnUse">
                <stop stop-color="#00f2fe"/>
                <stop offset="1" stop-color="#4facfe"/>
              </linearGradient>
              <linearGradient id="logoStroke" x1="2" y1="3" x2="26" y2="26" gradientUnits="userSpaceOnUse">
                <stop stop-color="#00f2fe" stop-opacity="0.6"/>
                <stop offset="1" stop-color="#4facfe" stop-opacity="0.3"/>
              </linearGradient>
            </defs>
          </svg>
          <span class="logo-text">Rent<span class="logo-accent">2</span>Live</span>
        </a>

        <!-- Desktop Nav Links -->
        <nav class="nav-links desktop-nav" role="navigation">
          <a routerLink="/search" routerLinkActive="active" class="nav-item" id="nav-explore-link">Explore</a>

          @if (authService.isAuthenticated()) {
            @if (authService.userRole() === 'visitor') {
              <a routerLink="/dashboard" routerLinkActive="active" class="nav-item" id="nav-favorites-link">My Favorites</a>
              <a routerLink="/chat" routerLinkActive="active" class="nav-item" id="nav-messages-link">Messages</a>
            }
            @if (authService.userRole() === 'owner') {
              <a routerLink="/owner/dashboard" routerLinkActive="active" class="nav-item" id="nav-properties-link">My Properties</a>
              <a routerLink="/chat" routerLinkActive="active" class="nav-item" id="nav-owner-messages-link">Messages</a>
            }
            @if (authService.userRole() === 'admin') {
              <a routerLink="/admin" routerLinkActive="active" class="nav-item admin-badge" id="nav-admin-link">Admin Panel</a>
            }

            <div class="user-profile">
              <span class="phone">{{ authService.currentUser()?.phone }}</span>
              <span class="role-badge" [ngClass]="authService.userRole()">
                {{ authService.userRole() | uppercase }}
              </span>
              <button (click)="logout()" class="logout-btn" id="logout-btn">Sign Out</button>
            </div>
          } @else {
            <a routerLink="/login" class="nav-item" id="nav-login-link">Sign In</a>
            <a routerLink="/signup" class="signup-btn" id="nav-signup-link">Get Started</a>
          }

          <!-- ── DARK / LIGHT TOGGLE ── -->
          <button
            class="theme-toggle"
            [class.dark]="isDark()"
            [class.light]="!isDark()"
            (click)="toggleTheme()"
            id="theme-toggle-btn"
            [attr.aria-label]="isDark() ? 'Switch to light mode' : 'Switch to dark mode'"
            [attr.aria-pressed]="!isDark()"
          >
            <span class="toggle-track">
              <span class="toggle-icon sun-icon" aria-hidden="true">☀️</span>
              <span class="toggle-thumb"></span>
              <span class="toggle-icon moon-icon" aria-hidden="true">🌙</span>
            </span>
          </button>
        </nav>

        <!-- Mobile Controls (Theme Toggle + Hamburger) -->
        <div class="mobile-controls">
          <button
            class="theme-toggle mobile-theme-btn"
            [class.dark]="isDark()"
            [class.light]="!isDark()"
            (click)="toggleTheme()"
            id="mobile-theme-toggle-btn"
            [attr.aria-label]="isDark() ? 'Switch to light mode' : 'Switch to dark mode'"
          >
            <span class="toggle-track">
              <span class="toggle-icon sun-icon" aria-hidden="true">☀️</span>
              <span class="toggle-thumb"></span>
              <span class="toggle-icon moon-icon" aria-hidden="true">🌙</span>
            </span>
          </button>

          <button
            class="hamburger-btn"
            (click)="toggleMobileMenu()"
            id="mobile-menu-toggle-btn"
            [attr.aria-expanded]="isMobileMenuOpen()"
            aria-label="Toggle navigation menu"
          >
            <div class="hamburger-icon" [class.open]="isMobileMenuOpen()">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </button>
        </div>

      </div>

      <!-- ── MOBILE MENU DRAWER ── -->
      @if (isMobileMenuOpen()) {
        <div class="mobile-backdrop" (click)="closeMobileMenu()"></div>
        <div class="mobile-drawer" [class.light]="!isDark()" id="mobile-menu-drawer">
          <nav class="mobile-nav-links">
            <a
              routerLink="/search"
              routerLinkActive="active"
              (click)="closeMobileMenu()"
              class="mobile-nav-item"
              id="mobile-nav-explore-link"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              <span>Explore</span>
            </a>

            @if (authService.isAuthenticated()) {
              @if (authService.userRole() === 'visitor') {
                <a routerLink="/dashboard" routerLinkActive="active" (click)="closeMobileMenu()" class="mobile-nav-item" id="mobile-nav-favorites-link">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.78-8.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                  <span>My Favorites</span>
                </a>
                <a routerLink="/chat" routerLinkActive="active" (click)="closeMobileMenu()" class="mobile-nav-item" id="mobile-nav-messages-link">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                  <span>Messages</span>
                </a>
              }
              @if (authService.userRole() === 'owner') {
                <a routerLink="/owner/dashboard" routerLinkActive="active" (click)="closeMobileMenu()" class="mobile-nav-item" id="mobile-nav-properties-link">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                  <span>My Properties</span>
                </a>
                <a routerLink="/chat" routerLinkActive="active" (click)="closeMobileMenu()" class="mobile-nav-item" id="mobile-nav-owner-messages-link">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                  <span>Messages</span>
                </a>
              }
              @if (authService.userRole() === 'admin') {
                <a routerLink="/admin" routerLinkActive="active" (click)="closeMobileMenu()" class="mobile-nav-item admin-badge" id="mobile-nav-admin-link">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                  <span>Admin Panel</span>
                </a>
              }

              <div class="mobile-user-card">
                <div class="mobile-user-info">
                  <span class="phone">{{ authService.currentUser()?.phone }}</span>
                  <span class="role-badge" [ngClass]="authService.userRole()">
                    {{ authService.userRole() | uppercase }}
                  </span>
                </div>
                <button (click)="logout()" class="mobile-logout-btn" id="mobile-logout-btn">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                  <span>Sign Out</span>
                </button>
              </div>
            } @else {
              <div class="mobile-auth-actions">
                <a
                  routerLink="/login"
                  (click)="closeMobileMenu()"
                  class="mobile-nav-item mobile-login-item"
                  id="mobile-nav-login-link"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" y1="12" x2="3" y2="12"></line></svg>
                  <span>Sign In</span>
                </a>

                <a
                  routerLink="/signup"
                  (click)="closeMobileMenu()"
                  class="signup-btn mobile-signup-btn"
                  id="mobile-nav-signup-link"
                >
                  <span>Get Started</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                </a>
              </div>
            }
          </nav>
        </div>
      }
    </header>
  `,
  styles: [`
    /* ─── NAVBAR SHELL ───────────────────────────────────────── */
    .navbar {
      background: var(--nav-bg);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-bottom: 1px solid var(--card-border);
      position: sticky;
      top: 0;
      z-index: 1000;
      padding: 0.75rem 1.5rem;
      transition: background 0.4s ease, border-color 0.4s ease;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
    }

    /* ─── LOGO ───────────────────────────────────────────────── */
    .logo {
      display: flex;
      align-items: center;
      gap: 0.55rem;
      text-decoration: none;
      flex-shrink: 0;
    }
    .logo-icon {
      transition: transform 0.3s ease;
      filter: drop-shadow(0 0 8px rgba(0,242,254,0.4));
    }
    .logo:hover .logo-icon {
      transform: rotate(-6deg) scale(1.05);
    }
    .logo-text {
      font-weight: 800;
      font-size: 1.35rem;
      color: var(--text-primary);
      letter-spacing: -0.5px;
      transition: color 0.4s ease;
    }
    .logo-accent {
      background: linear-gradient(135deg, #00f2fe, #4facfe);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    /* ─── NAV LINKS (DESKTOP) ────────────────────────────────── */
    .nav-links {
      display: flex;
      align-items: center;
      gap: 1.2rem;
    }
    .nav-item {
      color: var(--text-secondary);
      text-decoration: none;
      font-weight: 500;
      font-size: 0.92rem;
      transition: color 0.2s ease;
      position: relative;
    }
    .nav-item::after {
      content: '';
      position: absolute;
      bottom: -3px; left: 0; right: 0;
      height: 2px;
      background: linear-gradient(90deg, #00f2fe, #4facfe);
      border-radius: 2px;
      transform: scaleX(0);
      transition: transform 0.2s ease;
      transform-origin: left;
    }
    .nav-item:hover, .nav-item.active {
      color: var(--accent-cyan);
    }
    .nav-item:hover::after, .nav-item.active::after {
      transform: scaleX(1);
    }
    .admin-badge { color: var(--accent-rose); }
    .admin-badge:hover { color: #ff6688; }

    /* ─── USER PROFILE ───────────────────────────────────────── */
    .user-profile {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      border-left: 1px solid var(--card-border);
      padding-left: 1rem;
      transition: border-color 0.4s ease;
    }
    .phone {
      color: var(--text-primary);
      font-size: 0.88rem;
      font-weight: 500;
      transition: color 0.4s ease;
    }
    .role-badge {
      font-size: 0.7rem;
      font-weight: 700;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      letter-spacing: 0.5px;
    }
    .role-badge.visitor { background: rgba(79,172,254,0.15); color: #4facfe; }
    .role-badge.owner   { background: rgba(0,242,254,0.15);  color: #00f2fe; }
    .role-badge.admin   { background: rgba(255,51,102,0.15); color: #ff3366; }

    .logout-btn {
      background: transparent;
      border: 1px solid var(--card-border);
      color: var(--text-secondary);
      font-size: 0.82rem;
      font-weight: 600;
      padding: 0.38rem 0.75rem;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .logout-btn:hover {
      background: var(--card-bg-hover);
      border-color: var(--card-border-hover);
      color: var(--text-primary);
    }

    /* ─── SIGN IN / GET STARTED ──────────────────────────────── */
    .login-btn {
      color: var(--text-primary);
      text-decoration: none;
      font-weight: 600;
      font-size: 0.92rem;
      transition: color 0.2s ease;
    }
    .signup-btn {
      background: linear-gradient(135deg, #00f2fe 0%, #4facfe 100%);
      color: #0d0d1a !important;
      text-decoration: none;
      font-weight: 700;
      font-size: 0.88rem;
      padding: 0.48rem 1.1rem;
      border-radius: 8px;
      box-shadow: 0 4px 16px rgba(0,242,254,0.3);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      white-space: nowrap;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.4rem;
    }
    .signup-btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 22px rgba(0,242,254,0.42);
      color: #0d0d1a !important;
    }

    /* ─── DARK / LIGHT TOGGLE ────────────────────────────────── */
    .theme-toggle {
      display: flex;
      align-items: center;
      background: none;
      border: none;
      cursor: pointer;
      padding: 0;
      flex-shrink: 0;
    }

    .toggle-track {
      display: flex;
      align-items: center;
      position: relative;
      width: 68px;
      height: 32px;
      border-radius: 20px;
      padding: 0 6px;
      gap: 0;
      transition: background 0.4s ease, box-shadow 0.4s ease, transform 0.2s ease;
      justify-content: space-between;
    }

    /* DARK state */
    .theme-toggle.dark .toggle-track {
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      border: 1px solid rgba(255,255,255,0.12);
      box-shadow: inset 0 2px 6px rgba(0,0,0,0.4), 0 0 12px rgba(0,242,254,0.15);
    }
    /* LIGHT state */
    .theme-toggle.light .toggle-track {
      background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
      border: 1px solid rgba(0,0,0,0.1);
      box-shadow: inset 0 2px 6px rgba(0,0,0,0.08), 0 0 12px rgba(255,184,0,0.2);
    }

    .toggle-icon {
      font-size: 0.9rem;
      line-height: 1;
      transition: opacity 0.3s ease, transform 0.3s ease;
      flex-shrink: 0;
      z-index: 1;
    }
    .sun-icon  { order: 1; }
    .moon-icon { order: 3; }

    .theme-toggle.dark  .sun-icon  { opacity: 0.3; transform: scale(0.8); }
    .theme-toggle.dark  .moon-icon { opacity: 1;   transform: scale(1.1); }
    .theme-toggle.light .sun-icon  { opacity: 1;   transform: scale(1.1); }
    .theme-toggle.light .moon-icon { opacity: 0.3; transform: scale(0.8); }

    .toggle-thumb {
      order: 2;
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: 24px;
      height: 24px;
      border-radius: 50%;
      transition: left 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.35s ease, box-shadow 0.35s ease;
    }

    .theme-toggle.dark .toggle-thumb {
      left: calc(100% - 30px);
      background: linear-gradient(135deg, #00f2fe, #4facfe);
      box-shadow: 0 2px 8px rgba(0,242,254,0.5), 0 0 0 2px rgba(0,242,254,0.2);
    }
    .theme-toggle.light .toggle-thumb {
      left: 6px;
      background: linear-gradient(135deg, #ffb800, #f59e0b);
      box-shadow: 0 2px 8px rgba(255,184,0,0.5), 0 0 0 2px rgba(255,184,0,0.2);
    }

    .theme-toggle:hover .toggle-track {
      transform: scale(1.04);
    }

    .theme-toggle:focus-visible .toggle-track {
      outline: 2px solid var(--accent-cyan);
      outline-offset: 3px;
    }

    /* ─── MOBILE CONTROLS & HAMBURGER ───────────────────────── */
    .mobile-controls {
      display: none;
      align-items: center;
      gap: 0.75rem;
    }

    .hamburger-btn {
      background: transparent;
      border: 1px solid var(--card-border);
      border-radius: 8px;
      padding: 0.45rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s ease, border-color 0.2s ease;
    }
    .hamburger-btn:hover {
      background: var(--card-bg-hover);
      border-color: var(--card-border-hover);
    }

    .hamburger-icon {
      width: 22px;
      height: 16px;
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .hamburger-icon span {
      display: block;
      height: 2px;
      width: 100%;
      background: var(--text-primary);
      border-radius: 2px;
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease;
      transform-origin: center;
    }

    .hamburger-icon.open span:nth-child(1) {
      transform: translateY(7px) rotate(45deg);
    }
    .hamburger-icon.open span:nth-child(2) {
      opacity: 0;
    }
    .hamburger-icon.open span:nth-child(3) {
      transform: translateY(-7px) rotate(-45deg);
    }

    /* ─── MOBILE BACKDROP & DRAWER ────────────────────────────── */
    .mobile-backdrop {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
      z-index: 998;
      animation: fadeIn 0.25s ease forwards;
    }

    .mobile-drawer {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: var(--bg-secondary);
      border-bottom: 1px solid var(--card-border);
      box-shadow: 0 16px 40px var(--shadow-color);
      z-index: 999;
      padding: 1.25rem 1.5rem;
      animation: slideDownFade 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    .mobile-nav-links {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .mobile-nav-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      border-radius: 10px;
      color: var(--text-primary);
      text-decoration: none;
      font-size: 1rem;
      font-weight: 500;
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      transition: all 0.2s ease;
    }
    .mobile-nav-item:hover, .mobile-nav-item.active {
      background: var(--card-bg-hover);
      border-color: var(--accent-cyan);
      color: var(--accent-cyan);
    }

    .mobile-auth-actions {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      margin-top: 0.25rem;
    }

    .mobile-login-item {
      justify-content: center;
      font-weight: 600;
    }

    .mobile-signup-btn {
      width: 100%;
      padding: 0.85rem;
      font-size: 1rem;
      border-radius: 10px;
    }

    .mobile-user-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 12px;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      margin-top: 0.5rem;
    }

    .mobile-user-info {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .mobile-logout-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      width: 100%;
      background: rgba(255, 51, 102, 0.1);
      border: 1px solid rgba(255, 51, 102, 0.25);
      color: #ff3366;
      font-weight: 600;
      font-size: 0.9rem;
      padding: 0.65rem;
      border-radius: 8px;
      cursor: pointer;
      transition: background 0.2s ease;
    }
    .mobile-logout-btn:hover {
      background: rgba(255, 51, 102, 0.2);
    }

    /* ─── ANIMATIONS ─────────────────────────────────────────── */
    @keyframes fadeIn {
      from { opacity: 0; }
      to   { opacity: 1; }
    }

    @keyframes slideDownFade {
      from { opacity: 0; transform: translateY(-12px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    /* ─── RESPONSIVE BREAKPOINTS ─────────────────────────────── */
    @media (max-width: 767px) {
      .desktop-nav {
        display: none !important;
      }
      .mobile-controls {
        display: flex !important;
      }
      .navbar {
        padding: 0.65rem 1rem;
      }
      .logo-text {
        font-size: 1.2rem;
      }
    }
  `]
})
export class HeaderComponent implements OnInit {
  protected readonly authService = inject(AuthService);
  private platformId = inject(PLATFORM_ID);

  isDark = signal(true);
  isMobileMenuOpen = signal(false);

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const saved = localStorage.getItem('r2l-theme');
      if (saved === 'light') {
        this.isDark.set(false);
        document.documentElement.classList.add('light');
      } else {
        this.isDark.set(true);
        document.documentElement.classList.remove('light');
      }
    }
  }

  toggleTheme(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const nowDark = !this.isDark();
    this.isDark.set(nowDark);
    if (nowDark) {
      document.documentElement.classList.remove('light');
      localStorage.setItem('r2l-theme', 'dark');
    } else {
      document.documentElement.classList.add('light');
      localStorage.setItem('r2l-theme', 'light');
    }
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update(v => !v);
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }

  logout(): void {
    this.closeMobileMenu();
    this.authService.logout();
    window.location.href = '/';
  }
}
