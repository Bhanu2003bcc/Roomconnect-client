import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="auth-page">
      <div class="glass-card">
        <div class="header">
          <span class="emoji">✨</span>
          <h2>Join RoomConnect Noida</h2>
          <p>Find room rentals and connect directly. No brokers, no hidden fees.</p>
        </div>

        <form (ngSubmit)="signup()" class="form">
          <div class="input-group">
            <label for="fullName">Full Name</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              [(ngModel)]="fullName"
              placeholder="Enter your full name"
              required
              class="input-field"
            />
          </div>

          <div class="input-group">
            <label for="phone">Phone Number</label>
            <div class="phone-input-wrapper">
              <span class="prefix">+91</span>
              <input
                type="tel"
                id="phone"
                name="phone"
                [(ngModel)]="phone"
                placeholder="9999999999"
                required
                pattern="[0-9]{10}"
                class="phone-input"
              />
            </div>
          </div>

          <div class="input-group">
            <label for="email">Email Address (Optional)</label>
            <input
              type="email"
              id="email"
              name="email"
              [(ngModel)]="email"
              placeholder="name@example.com"
              class="input-field"
            />
          </div>

          <div class="input-group">
            <label>Select Your Account Type</label>
            <div class="role-selector">
              <label class="role-card" [class.selected]="role === 'visitor'">
                <input
                  type="radio"
                  name="role"
                  value="visitor"
                  [(ngModel)]="role"
                  class="hidden-radio"
                />
                <span class="icon">🔍</span>
                <span class="title">Visitor</span>
                <span class="desc">Browse, book visits & connect</span>
              </label>

              <label class="role-card" [class.selected]="role === 'owner'">
                <input
                  type="radio"
                  name="role"
                  value="owner"
                  [(ngModel)]="role"
                  class="hidden-radio"
                />
                <span class="icon">🔑</span>
                <span class="title">Owner</span>
                <span class="desc">List rooms & manage bookings</span>
              </label>
            </div>
          </div>

          <div class="consent-group">
            <label class="checkbox-container">
              <input
                type="checkbox"
                name="consent"
                [(ngModel)]="consent"
                required
              />
              <span class="checkmark"></span>
              <span class="label-text">
                I consent to RoomConnect storing my phone number and profile data for matching listing search criteria under India's Digital Personal Data Protection (DPDP) Act.
              </span>
            </label>
          </div>

          <button type="submit" [disabled]="loading()" class="submit-btn">
            {{ loading() ? 'Creating Account...' : 'Sign Up' }}
          </button>
        </form>

        @if (errorMsg()) {
          <div class="error-banner">
            {{ errorMsg() }}
          </div>
        }

        @if (successMsg()) {
          <div class="success-banner">
            {{ successMsg() }}
          </div>
        }

        <div class="footer-links">
          Already have an account? <a routerLink="/login">Sign in here</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: 100dvh;
      display: flex;
      justify-content: center;
      align-items: center;
      background: radial-gradient(circle at top, #1e1e30 0%, #0d0d12 100%);
      padding: 2rem 1.5rem;
    }
    .glass-card {
      background: rgba(255, 255, 255, 0.03);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 16px;
      padding: 2.5rem;
      width: 100%;
      max-width: 480px;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
    }
    .header {
      text-align: center;
      margin-bottom: 2rem;
    }
    .header .emoji {
      font-size: 2.5rem;
      display: inline-block;
      margin-bottom: 0.5rem;
    }
    .header h2 {
      color: #fff;
      font-size: 1.5rem;
      font-weight: 800;
      letter-spacing: -0.5px;
      margin-bottom: 0.5rem;
    }
    .header p {
      color: rgba(255, 255, 255, 0.6);
      font-size: 0.9rem;
      line-height: 1.5;
    }
    .form {
      display: flex;
      flex-direction: column;
      gap: 1.2rem;
    }
    .input-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .input-group label {
      color: rgba(255, 255, 255, 0.8);
      font-size: 0.85rem;
      font-weight: 600;
    }
    .input-field {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      color: #fff;
      font-size: 0.95rem;
      padding: 0.8rem;
      outline: none;
      transition: all 0.2s ease;
    }
    .input-field:focus {
      border-color: #00f2fe;
      box-shadow: 0 0 0 2px rgba(0, 242, 254, 0.15);
    }
    .phone-input-wrapper {
      display: flex;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      align-items: center;
      padding: 0 0.8rem;
    }
    .prefix {
      color: rgba(255, 255, 255, 0.6);
      font-weight: 600;
      font-size: 0.95rem;
      border-right: 1px solid rgba(255, 255, 255, 0.15);
      padding-right: 0.6rem;
      margin-right: 0.6rem;
    }
    .phone-input {
      background: transparent;
      border: 0;
      color: #fff;
      font-size: 0.95rem;
      font-weight: 500;
      width: 100%;
      padding: 0.8rem 0;
      outline: none;
    }
    .role-selector {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }
    .role-card {
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      cursor: pointer;
      text-align: center;
      transition: all 0.2s ease;
    }
    .role-card:hover {
      background: rgba(255, 255, 255, 0.05);
      border-color: rgba(255, 255, 255, 0.2);
    }
    .role-card.selected {
      background: rgba(0, 242, 254, 0.05);
      border-color: #00f2fe;
      box-shadow: 0 0 10px rgba(0, 242, 254, 0.1);
    }
    .role-card .icon {
      font-size: 1.5rem;
      margin-bottom: 0.4rem;
    }
    .role-card .title {
      color: #fff;
      font-weight: 700;
      font-size: 0.95rem;
      margin-bottom: 0.2rem;
    }
    .role-card .desc {
      color: rgba(255, 255, 255, 0.5);
      font-size: 0.75rem;
      line-height: 1.3;
    }
    .hidden-radio {
      display: none;
    }
    .consent-group {
      margin-top: 0.5rem;
    }
    .checkbox-container {
      display: flex;
      align-items: flex-start;
      gap: 0.6rem;
      cursor: pointer;
      position: relative;
      user-select: none;
    }
    .checkbox-container input {
      position: absolute;
      opacity: 0;
      cursor: pointer;
      height: 0;
      width: 0;
    }
    .checkmark {
      min-width: 18px;
      height: 18px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 4px;
      display: inline-block;
      position: relative;
      margin-top: 2px;
    }
    .checkbox-container:hover input ~ .checkmark {
      border-color: rgba(255, 255, 255, 0.4);
    }
    .checkbox-container input:checked ~ .checkmark {
      background: #00f2fe;
      border-color: #00f2fe;
    }
    .checkmark:after {
      content: "";
      position: absolute;
      display: none;
    }
    .checkbox-container input:checked ~ .checkmark:after {
      display: block;
    }
    .checkbox-container .checkmark:after {
      left: 6px;
      top: 2px;
      width: 4px;
      height: 9px;
      border: solid #121218;
      border-width: 0 2px 2px 0;
      transform: rotate(45deg);
    }
    .label-text {
      color: rgba(255, 255, 255, 0.65);
      font-size: 0.8rem;
      line-height: 1.4;
    }
    .submit-btn {
      background: linear-gradient(135deg, #00f2fe 0%, #4facfe 100%);
      color: #121218;
      border: 0;
      font-size: 0.95rem;
      font-weight: 700;
      padding: 0.9rem;
      border-radius: 8px;
      cursor: pointer;
      box-shadow: 0 4px 15px rgba(0, 242, 254, 0.3);
      transition: all 0.2s ease;
      margin-top: 0.5rem;
    }
    .submit-btn:hover {
      box-shadow: 0 6px 20px rgba(0, 242, 254, 0.4);
    }
    .submit-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .error-banner {
      background: rgba(255, 51, 102, 0.15);
      border: 1px solid rgba(255, 51, 102, 0.3);
      color: #ff3366;
      border-radius: 8px;
      padding: 0.8rem;
      text-align: center;
      font-size: 0.85rem;
      font-weight: 500;
      margin-top: 1.2rem;
    }
    .success-banner {
      background: rgba(0, 242, 254, 0.15);
      border: 1px solid rgba(0, 242, 254, 0.3);
      color: #00f2fe;
      border-radius: 8px;
      padding: 0.8rem;
      text-align: center;
      font-size: 0.85rem;
      font-weight: 500;
      margin-top: 1.2rem;
    }
    .footer-links {
      text-align: center;
      color: rgba(255, 255, 255, 0.5);
      font-size: 0.85rem;
      margin-top: 1.5rem;
    }
    .footer-links a {
      color: #00f2fe;
      text-decoration: none;
      font-weight: 600;
    }
  `]
})
export class SignupComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  fullName = '';
  phone = '';
  email = '';
  role: 'visitor' | 'owner' = 'visitor';
  consent = false;

  loading = signal(false);
  errorMsg = signal('');
  successMsg = signal('');

  signup(): void {
    if (!this.consent) {
      this.errorMsg.set('You must consent to data processing for registration.');
      return;
    }
    if (!this.fullName || !this.phone || this.phone.length !== 10) {
      this.errorMsg.set('Please fill out all required fields with a valid phone number.');
      return;
    }

    this.loading.set(true);
    this.errorMsg.set('');
    this.successMsg.set('');

    const payload = {
      phone: '+91' + this.phone,
      email: this.email ? this.email : undefined,
      fullName: this.fullName,
      role: this.role,
      consent: this.consent
    };

    this.authService.signup(payload).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.successMsg.set('Account created successfully! Redirecting to login...');
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err) => {
        this.errorMsg.set(err?.error?.message || 'Registration failed. Check if phone is already registered.');
        this.loading.set(false);
      }
    });
  }
}
