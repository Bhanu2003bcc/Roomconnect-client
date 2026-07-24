import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <footer class="footer">
      <div class="container">
        <div class="footer-top">

          <!-- Brand column -->
          <div class="footer-brand">
            <a routerLink="/" class="brand-logo">
              <svg width="22" height="22" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 3L26 12V26H18V18H10V26H2V12L14 3Z" fill="url(#fLogoGrad)" stroke-linejoin="round"/>
                <circle cx="14" cy="13.5" r="2.5" fill="white" opacity="0.9"/>
                <defs>
                  <linearGradient id="fLogoGrad" x1="2" y1="3" x2="26" y2="26" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#00f2fe"/>
                    <stop offset="1" stop-color="#4facfe"/>
                  </linearGradient>
                </defs>
              </svg>
              <span>Rent<span class="accent">2</span>Live</span>
            </a>
            <p class="brand-desc">
              Noida's zero-brokerage room rental platform. Find verified flats, PGs
              &amp; rooms — connect directly with owners. No agents, no fees.
            </p>
            <div class="social-links">
              <a href="https://x.com/slxionsure" class="social-btn" aria-label="X (Twitter)" target="_blank" rel="noopener noreferrer">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a href="https://www.instagram.com/x__faxtor/" class="social-btn" aria-label="Instagram" target="_blank" rel="noopener noreferrer">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
              <a href="https://www.linkedin.com/in/bpsingh7507/" class="social-btn" aria-label="LinkedIn" target="_blank" rel="noopener noreferrer">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.762-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </a>
            </div>
          </div>

          <!-- Quick links -->
          <div class="footer-col">
            <h4 class="col-heading">Explore</h4>
            <ul>
              <li><a routerLink="/search">Browse All Rooms</a></li>
              <li><a routerLink="/search">PG in Noida</a></li>
              <li><a routerLink="/search">1BHK / 2BHK</a></li>
              <li><a routerLink="/search">Near Metro</a></li>
            </ul>
          </div>

          <!-- Company -->
          <div class="footer-col">
            <h4 class="col-heading">Company</h4>
            <ul>
              <li><a routerLink="/">About Us</a></li>
              <li><a routerLink="/signup">List a Property</a></li>
              <li><a routerLink="/login">Sign In</a></li>
              <li><a routerLink="/signup">Sign Up</a></li>
            </ul>
          </div>

          <!-- Privacy / Legal -->
          <div class="footer-col">
            <h4 class="col-heading">Legal</h4>
            <ul>
              <li><a routerLink="/privacy">Privacy Policy</a></li>
              <li><a routerLink="/terms">Terms of Service</a></li>
              <li><a routerLink="/dpdp">DPDP Compliance</a></li>
              <li><a routerLink="/cookies">Cookie Policy</a></li>
            </ul>
          </div>
        </div>

        <!-- DPDP notice -->
        <div class="dpdp-notice">
          <span class="dpdp-icon">🔒</span>
          <p>
            <strong>DPDP Act Compliance:</strong> All personal data (phone numbers, emails) is stored securely
            and used exclusively to facilitate listing matching and owner–visitor communication, as mandated by
            India's Digital Personal Data Protection Act.
          </p>
        </div>

        <!-- Bottom bar -->
        <div class="footer-bottom">
          <span class="copyright">© 2026 Rent2Live. All rights reserved.</span>
          <div class="bottom-links">
            <a routerLink="/privacy">Privacy</a>
            <a routerLink="/terms">Terms</a>
            <a routerLink="/contact">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      background: var(--footer-bg);
      border-top: 1px solid var(--card-border);
      padding: 4rem 1.5rem 1.5rem;
      transition: background 0.4s ease, border-color 0.4s ease;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 3rem;
    }

    /* Top grid */
    .footer-top {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr;
      gap: 3rem;
    }
    @media (max-width: 900px) {
      .footer-top { grid-template-columns: 1fr 1fr; gap: 2rem; }
      .footer-brand { grid-column: 1 / -1; }
    }
    @media (max-width: 500px) {
      .footer-top { grid-template-columns: 1fr; }
    }

    /* Brand column */
    .brand-logo {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      text-decoration: none;
      font-weight: 800;
      font-size: 1.25rem;
      color: var(--text-primary);
      letter-spacing: -0.3px;
      margin-bottom: 1rem;
      transition: color 0.4s ease;
    }
    .brand-logo svg { filter: drop-shadow(0 0 6px rgba(0,242,254,0.3)); }
    .accent {
      background: linear-gradient(135deg, #00f2fe, #4facfe);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .brand-desc {
      font-size: 0.84rem;
      color: var(--text-secondary);
      line-height: 1.65;
      max-width: 340px;
      margin-bottom: 1.2rem;
      transition: color 0.4s ease;
    }
    .social-links { display: flex; gap: 0.6rem; }
    .social-btn {
      display: flex; align-items: center; justify-content: center;
      width: 34px; height: 34px;
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 8px;
      text-decoration: none;
      font-size: 0.85rem;
      transition: background 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
      cursor: pointer;
    }
    .social-btn:hover {
      background: var(--card-bg-hover);
      border-color: var(--card-border-hover);
      transform: translateY(-2px);
    }

    /* Link columns */
    .footer-col {}
    .col-heading {
      font-size: 0.8rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1.2px;
      color: var(--text-primary);
      margin-bottom: 1.1rem;
      transition: color 0.4s ease;
    }
    .footer-col ul {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
    }
    .footer-col ul li a {
      font-size: 0.85rem;
      color: var(--text-secondary);
      text-decoration: none;
      transition: color 0.2s ease;
    }
    .footer-col ul li a:hover { color: var(--accent-cyan); }

    /* DPDP notice */
    .dpdp-notice {
      display: flex;
      align-items: flex-start;
      gap: 0.8rem;
      background: var(--card-bg);
      border: 1px solid rgba(255,184,0,0.15);
      border-left: 3px solid var(--accent-gold);
      border-radius: 8px;
      padding: 0.9rem 1.1rem;
      font-size: 0.8rem;
      color: var(--text-secondary);
      line-height: 1.6;
      transition: background 0.4s ease, color 0.4s ease;
    }
    .dpdp-notice strong { color: var(--accent-gold); }
    .dpdp-icon { font-size: 1.1rem; flex-shrink: 0; margin-top: 0.1rem; }

    /* Bottom bar */
    .footer-bottom {
      border-top: 1px solid var(--card-border);
      padding-top: 1.3rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
      transition: border-color 0.4s ease;
    }
    .copyright {
      font-size: 0.78rem;
      color: var(--text-muted);
      transition: color 0.4s ease;
    }
    .bottom-links {
      display: flex;
      gap: 1.2rem;
    }
    .bottom-links a {
      font-size: 0.78rem;
      color: var(--text-muted);
      text-decoration: none;
      transition: color 0.2s ease;
    }
    .bottom-links a:hover { color: var(--accent-cyan); }
  `]
})
export class FooterComponent {}
