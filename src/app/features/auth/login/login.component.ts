import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="auth-page">
      <div class="glass-card">
        <div class="header">
          <span class="emoji">⚡</span>
          <h2>Welcome back to RoomConnect</h2>
          <p>Verify your phone number with a 6-digit OTP to get started.</p>
        </div>

        @if (!otpSent()) {
          <form (ngSubmit)="sendOtp()" class="form">
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
            
            <button type="submit" [disabled]="loading()" class="submit-btn">
              {{ loading() ? 'Sending...' : 'Send Verification Code' }}
            </button>
          </form>
        } @else {
          <form (ngSubmit)="verifyOtp()" class="form">
            <div class="input-group">
              <label for="code">Enter 6-Digit OTP</label>
              <input
                type="text"
                id="code"
                name="code"
                [(ngModel)]="code"
                placeholder="000000"
                required
                maxlength="6"
                class="otp-input"
              />
              <span class="otp-hint">
                @if (isProd) {
                  Verification code sent to your phone.
                } @else {
                  OTP sent. Check terminal logs in development!
                }
              </span>
            </div>

            <button type="submit" [disabled]="loading()" class="submit-btn">
              {{ loading() ? 'Verifying...' : 'Verify & Sign In' }}
            </button>
            
            <button type="button" (click)="resetOtp()" class="resend-btn">
              Change Phone Number
            </button>
          </form>
        }

        @if (errorMsg()) {
          <div class="error-banner">
            {{ errorMsg() }}
          </div>
        }
        
        <div class="footer-links">
          Don't have an account? <a routerLink="/signup">Create one here</a>
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
      padding: 1.5rem;
    }
    .glass-card {
      background: rgba(255, 255, 255, 0.03);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 16px;
      padding: 2.5rem;
      width: 100%;
      max-width: 440px;
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
      gap: 1.5rem;
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
    .otp-input {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      color: #fff;
      font-size: 1.1rem;
      font-weight: 700;
      letter-spacing: 4px;
      text-align: center;
      padding: 0.8rem;
      outline: none;
    }
    .otp-input:focus, .phone-input-wrapper:focus-within {
      border-color: #00f2fe;
      box-shadow: 0 0 0 2px rgba(0, 242, 254, 0.15);
    }
    .otp-hint {
      color: #ffb800;
      font-size: 0.75rem;
      font-weight: 500;
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
    }
    .submit-btn:hover {
      box-shadow: 0 6px 20px rgba(0, 242, 254, 0.4);
    }
    .submit-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .resend-btn {
      background: transparent;
      border: 0;
      color: rgba(255, 255, 255, 0.6);
      font-size: 0.85rem;
      cursor: pointer;
      text-decoration: underline;
    }
    .resend-btn:hover {
      color: #fff;
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
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  isProd = environment.production;

  phone = '';
  code = '';
  otpSent = signal(false);
  loading = signal(false);
  errorMsg = signal('');

  sendOtp(): void {
    if (!this.phone || this.phone.length !== 10) {
      this.errorMsg.set('Please enter a valid 10-digit phone number.');
      return;
    }
    this.loading.set(true);
    this.errorMsg.set('');

    const phoneWithPrefix = '+91' + this.phone;
    this.authService.sendOtp(phoneWithPrefix).subscribe({
      next: () => {
        this.otpSent.set(true);
        this.loading.set(false);
      },
      error: (err) => {
        this.errorMsg.set(err?.error?.message || 'Failed to send verification code.');
        this.loading.set(false);
      }
    });
  }

  verifyOtp(): void {
    if (!this.code || this.code.length !== 6) {
      this.errorMsg.set('Please enter the 6-digit verification code.');
      return;
    }
    this.loading.set(true);
    this.errorMsg.set('');

    const phoneWithPrefix = '+91' + this.phone;
    this.authService.verifyOtp(phoneWithPrefix, this.code).subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.role === 'admin') {
          this.router.navigate(['/admin']);
        } else if (res.role === 'owner') {
          this.router.navigate(['/owner/dashboard']);
        } else {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        this.errorMsg.set(err?.error?.message || 'Verification failed. Please try again.');
        this.loading.set(false);
      }
    });
  }

  resetOtp(): void {
    this.otpSent.set(false);
    this.code = '';
    this.errorMsg.set('');
  }
}
