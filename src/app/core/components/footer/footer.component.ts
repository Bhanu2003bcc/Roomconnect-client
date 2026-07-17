import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer class="footer">
      <div class="container">
        <div class="content">
          <div class="info">
            <span class="brand">RoomConnect Noida</span>
            <p class="description">
              India's first modular room rental platform built for single-city launch in Noida. Found your next flat or PG with zero broker fees.
            </p>
          </div>
          <div class="privacy-disclaimer">
            <span class="title">DPDP Act Compliance</span>
            <p class="text">
              We value your data privacy under the Digital Personal Data Protection (DPDP) Act. All phone number and email data is stored securely and is strictly used to facilitate listing matching and visitor-owner chat sessions.
            </p>
          </div>
        </div>
        <div class="bottom">
          <span class="copyright">© 2026 RoomConnect Noida. All rights reserved.</span>
          <span class="terms">Terms of Service | Privacy Policy</span>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      background: #0d0d12;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
      padding: 3rem 1.5rem 1.5rem 1.5rem;
      color: rgba(255, 255, 255, 0.5);
      font-size: 0.85rem;
      margin-top: auto;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }
    .content {
      display: grid;
      grid-template-columns: 1.5fr 1fr;
      gap: 3rem;
    }
    @media (max-width: 768px) {
      .content {
        grid-template-columns: 1fr;
        gap: 1.5rem;
      }
    }
    .brand {
      color: #fff;
      font-weight: 700;
      font-size: 1.1rem;
      display: block;
      margin-bottom: 0.8rem;
    }
    .description {
      line-height: 1.6;
      max-width: 500px;
    }
    .privacy-disclaimer .title {
      color: #ffb800;
      font-weight: 700;
      display: block;
      margin-bottom: 0.8rem;
    }
    .privacy-disclaimer .text {
      line-height: 1.6;
    }
    .bottom {
      border-top: 1px solid rgba(255, 255, 255, 0.05);
      padding-top: 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .terms {
      cursor: pointer;
    }
    .terms:hover {
      color: #fff;
    }
  `]
})
export class FooterComponent {}
