import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ElementRef,
  ViewChild,
  inject,
  signal,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="landing-page">

      <!-- ── HERO ───────────────────────────────────────────── -->
      <section class="hero" #heroSection>

        <!-- Particle field -->
        <div class="particle-field" aria-hidden="true">
          <span *ngFor="let p of particles" class="particle"
            [style.left.%]="p.x"
            [style.top.%]="p.y"
            [style.width.px]="p.size"
            [style.height.px]="p.size"
            [style.animationDelay]="p.delay + 's'"
            [style.animationDuration]="p.dur + 's'">
          </span>
        </div>

        <!-- Gradient orbs -->
        <div class="orb orb-1" aria-hidden="true"></div>
        <div class="orb orb-2" aria-hidden="true"></div>
        <div class="orb orb-3" aria-hidden="true"></div>

        <div class="hero-inner">
          <!-- Left: Copy -->
          <div class="hero-copy">
            <div class="hero-badge">
              <span class="badge-dot"></span>
              <span>India's #1 Zero-Brokerage Room Finder</span>
            </div>

            <h1 class="hero-title">
              Find Your <br>
              <span class="gradient-text">Dream Room</span><br>
              in Noida
            </h1>

            <p class="hero-sub">
              Browse 500+ verified flats, PGs, 1BHK, 2BHK &amp; independent rooms.
              Zero broker fees. Real owners. Move in with confidence.
            </p>

            <div class="hero-cta">
              <a routerLink="/search" class="btn-primary" id="hero-find-room-btn">
                Find My Room
              </a>
              <a routerLink="/signup" class="btn-secondary" id="hero-list-property-btn">
                List a Property
              </a>
            </div>

            <div class="trust-badges">
              <div class="badge-item">
                <span class="badge-icon">✓</span>
                <span>500+ Listings</span>
              </div>
              <div class="badge-item">
                <span class="badge-icon">✓</span>
                <span>Zero Brokerage</span>
              </div>
              <div class="badge-item">
                <span class="badge-icon">✓</span>
                <span>Verified Owners</span>
              </div>
              <div class="badge-item">
                <span class="badge-icon">✓</span>
                <span>Instant Connect</span>
              </div>
            </div>
          </div>

          <!-- Right: 3D Building Scene -->
          <div class="hero-scene" aria-hidden="true">
            <div class="scene-wrapper">

              <!-- Floating city backdrop -->
              <div class="city-skyline">
                <svg viewBox="0 0 520 200" fill="none" xmlns="http://www.w3.org/2000/svg" class="skyline-svg">
                  <!-- Building silhouettes -->
                  <rect x="0"   y="140" width="40"  height="60"  rx="3" fill="url(#skyGrad)" opacity="0.35"/>
                  <rect x="45"  y="100" width="55"  height="100" rx="3" fill="url(#skyGrad)" opacity="0.4"/>
                  <rect x="105" y="80"  width="35"  height="120" rx="3" fill="url(#skyGrad)" opacity="0.3"/>
                  <rect x="145" y="120" width="28"  height="80"  rx="3" fill="url(#skyGrad)" opacity="0.45"/>
                  <rect x="180" y="60"  width="50"  height="140" rx="3" fill="url(#skyGrad)" opacity="0.5"/>
                  <rect x="235" y="90"  width="40"  height="110" rx="3" fill="url(#skyGrad)" opacity="0.35"/>
                  <rect x="282" y="110" width="35"  height="90"  rx="3" fill="url(#skyGrad)" opacity="0.4"/>
                  <rect x="324" y="70"  width="60"  height="130" rx="3" fill="url(#skyGrad)" opacity="0.5"/>
                  <rect x="390" y="100" width="45"  height="100" rx="3" fill="url(#skyGrad)" opacity="0.35"/>
                  <rect x="440" y="130" width="35"  height="70"  rx="3" fill="url(#skyGrad)" opacity="0.3"/>
                  <rect x="480" y="85"  width="40"  height="115" rx="3" fill="url(#skyGrad)" opacity="0.45"/>
                  <!-- Window lights -->
                  <rect x="188" y="80"  width="8" height="6" rx="1" fill="#00f2fe" opacity="0.7" class="win-blink"/>
                  <rect x="200" y="80"  width="8" height="6" rx="1" fill="#4facfe" opacity="0.5"/>
                  <rect x="188" y="95"  width="8" height="6" rx="1" fill="#4facfe" opacity="0.6"/>
                  <rect x="332" y="85"  width="8" height="6" rx="1" fill="#00f2fe" opacity="0.7"/>
                  <rect x="344" y="85"  width="8" height="6" rx="1" fill="#4facfe" opacity="0.5" class="win-blink"/>
                  <rect x="332" y="100" width="8" height="6" rx="1" fill="#00f2fe" opacity="0.6"/>
                  <defs>
                    <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%"   stop-color="var(--accent-cyan)" stop-opacity="0.8"/>
                      <stop offset="100%" stop-color="var(--accent-blue)"  stop-opacity="0.4"/>
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              <!-- Main floating 3D building block -->
              <div class="building-3d">
                <div class="b-face b-top"></div>
                <div class="b-face b-front">
                  <div class="window-grid">
                    <div class="win lit"></div><div class="win lit"></div><div class="win"></div>
                    <div class="win"></div><div class="win lit"></div><div class="win lit"></div>
                    <div class="win lit"></div><div class="win"></div><div class="win lit"></div>
                    <div class="win"></div><div class="win lit"></div><div class="win"></div>
                  </div>
                  <div class="door"></div>
                </div>
                <div class="b-face b-side">
                  <div class="window-grid side-grid">
                    <div class="win lit"></div><div class="win"></div>
                    <div class="win"></div><div class="win lit"></div>
                    <div class="win lit"></div><div class="win lit"></div>
                  </div>
                </div>
              </div>

              <!-- Location pin -->
              <div class="location-pin">
                <div class="pin-body">
                  <div class="pin-pulse-ring"></div>
                </div>
                <div class="pin-label">Noida, UP</div>
              </div>

              <!-- Floating listing mini-cards -->
              <div class="float-card fc-1">
                <div class="fc-img"></div>
                <div class="fc-info">
                  <span class="fc-tag">1BHK</span>
                  <span class="fc-price">₹9,500/mo</span>
                  <span class="fc-loc">Sector 62</span>
                </div>
              </div>

              <div class="float-card fc-2">
                <div class="fc-img fc-img-2"></div>
                <div class="fc-info">
                  <span class="fc-tag">PG</span>
                  <span class="fc-price">₹6,200/mo</span>
                  <span class="fc-loc">Sector 18</span>
                </div>
              </div>

              <div class="float-card fc-3">
                <div class="fc-img fc-img-3"></div>
                <div class="fc-info">
                  <span class="fc-tag">2BHK</span>
                  <span class="fc-price">₹16,000/mo</span>
                  <span class="fc-loc">Sector 50</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      <!-- ── STATS BAR ───────────────────────────────────────── -->
      <section class="stats-bar" #statsSection>
        <div class="stats-inner">
          <div class="stat-item" *ngFor="let s of stats; let i = index">
            <span class="stat-value" [id]="'stat-' + i">{{ s.display }}</span>
            <span class="stat-label">{{ s.label }}</span>
          </div>
        </div>
      </section>

      <!-- ── HOW IT WORKS ────────────────────────────────────── -->
      <section class="how-it-works">
        <div class="section-inner">
          <div class="section-header">
            <span class="section-eyebrow">Simple & Fast</span>
            <h2 class="section-title">How Rent2Live Works</h2>
            <p class="section-sub">From search to move-in in 3 easy steps</p>
          </div>

          <div class="steps-grid">
            <div class="step-card" *ngFor="let step of steps; let i = index"
              [style.animationDelay]="(i * 0.15) + 's'">
              <div class="step-number">{{ i + 1 }}</div>
              <div class="step-icon-wrap">{{ step.icon }}</div>
              <h3 class="step-title">{{ step.title }}</h3>
              <p class="step-desc">{{ step.desc }}</p>
              <div class="step-connector" *ngIf="i < steps.length - 1"></div>
            </div>
          </div>
        </div>
      </section>

      <!-- ── CATEGORY HIGHLIGHTS ─────────────────────────────── -->
      <section class="categories-section">
        <div class="section-inner">
          <div class="section-header">
            <span class="section-eyebrow">Browse by Type</span>
            <h2 class="section-title">Every Kind of Home</h2>
            <p class="section-sub">From budget-friendly PGs to spacious 3BHKs — we have it all.</p>
          </div>
          <div class="categories-grid">
            <a routerLink="/search" class="cat-card" *ngFor="let cat of categories">
              <div class="cat-icon">{{ cat.icon }}</div>
              <div class="cat-bg" [style.background]="cat.gradient"></div>
              <span class="cat-name">{{ cat.name }}</span>
              <span class="cat-count">{{ cat.count }} listings</span>
              <div class="cat-arrow">→</div>
            </a>
          </div>
        </div>
      </section>

      <!-- ── FEATURES / WHY US ───────────────────────────────── -->
      <section class="features-section">
        <div class="section-inner features-inner">
          <!-- Left: illustration placeholder -->
          <div class="features-visual">
            <div class="features-scene">
              <div class="fs-phone">
                <div class="fs-screen">
                  <div class="fs-row" *ngFor="let r of [1,2,3]">
                    <div class="fs-thumb"></div>
                    <div class="fs-lines">
                      <div class="fs-line long"></div>
                      <div class="fs-line short"></div>
                    </div>
                    <div class="fs-badge">✓</div>
                  </div>
                </div>
              </div>
              <div class="fs-badge-float fs-b1">Safe</div>
              <div class="fs-badge-float fs-b2">Fast</div>
              <div class="fs-badge-float fs-b3">Verified</div>
            </div>
          </div>

          <!-- Right: feature list -->
          <div class="features-list">
            <div class="section-header" style="text-align:left">
              <span class="section-eyebrow">Why Choose Us</span>
              <h2 class="section-title">Built for Renters<br><span class="gradient-text">Like You</span></h2>
            </div>
            <div class="feature-item" *ngFor="let f of features; let i = index"
              [style.animationDelay]="(i * 0.1) + 's'">
              <div class="fi-icon-wrap" [style.background]="f.iconBg">{{ f.icon }}</div>
              <div class="fi-content">
                <h4 class="fi-title">{{ f.title }}</h4>
                <p class="fi-desc">{{ f.desc }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ── TESTIMONIALS ────────────────────────────────────── -->
      <section class="testimonials-section">
        <div class="section-inner">
          <div class="section-header">
            <span class="section-eyebrow">Happy Renters</span>
            <h2 class="section-title">What People Say</h2>
          </div>
          <div class="testimonials-grid">
            <div class="testimonial-card" *ngFor="let t of testimonials; let i = index"
              [style.animationDelay]="(i * 0.12) + 's'">
              <div class="stars">{{ '★'.repeat(t.stars) }}</div>
              <p class="t-quote">"{{ t.quote }}"</p>
              <div class="t-author">
                <div class="t-avatar" [style.background]="t.avatarBg">{{ t.initials }}</div>
                <div>
                  <span class="t-name">{{ t.name }}</span>
                  <span class="t-role">{{ t.role }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ── CTA BAND ────────────────────────────────────────── -->
      <section class="cta-band">
        <div class="cta-orb cta-orb-1"></div>
        <div class="cta-orb cta-orb-2"></div>
        <div class="section-inner cta-inner">
          <h2 class="cta-title">Ready to find your <span class="gradient-text">perfect room?</span></h2>
          <p class="cta-sub">Join thousands of happy renters in Noida. It's free to search.</p>
          <div class="cta-actions">
            <a routerLink="/search" class="btn-primary btn-large" id="cta-search-btn">
              Browse All Rooms
            </a>
            <a routerLink="/signup" class="btn-outline btn-large" id="cta-signup-btn">
              Create Free Account
            </a>
          </div>
        </div>
      </section>

    </div>
  `,
  styles: [`
    /* ─── PAGE SHELL ─────────────────────────────────────────── */
    .landing-page {
      width: 100%;
      overflow: hidden;
    }

    /* ─── SHARED SECTION STYLES ──────────────────────────────── */
    .section-inner {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1.5rem;
    }
    .section-header {
      text-align: center;
      margin-bottom: 3.5rem;
    }
    .section-eyebrow {
      display: inline-block;
      font-size: 0.78rem;
      font-weight: 700;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: var(--accent-cyan);
      background: rgba(0,242,254,0.1);
      border: 1px solid rgba(0,242,254,0.25);
      padding: 0.3rem 0.9rem;
      border-radius: 20px;
      margin-bottom: 1rem;
    }
    .section-title {
      font-size: clamp(1.9rem, 4vw, 2.8rem);
      font-weight: 700;
      color: var(--text-primary);
      line-height: 1.2;
      margin-bottom: 0.8rem;
      transition: color 0.4s ease;
    }
    .section-sub {
      font-size: 1rem;
      color: var(--text-secondary);
      max-width: 560px;
      margin: 0 auto;
      line-height: 1.65;
      transition: color 0.4s ease;
    }
    .gradient-text {
      background: linear-gradient(135deg, #00f2fe 0%, #4facfe 50%, #a855f7 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    /* ─── BUTTONS ─────────────────────────────────────────────── */
    .btn-primary {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: linear-gradient(135deg, #00f2fe 0%, #4facfe 100%);
      color: #0d0d1a;
      font-weight: 700;
      font-size: 0.95rem;
      padding: 0.85rem 1.8rem;
      border-radius: 12px;
      text-decoration: none;
      box-shadow: 0 8px 28px rgba(0,242,254,0.35);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      white-space: nowrap;
    }
    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 14px 36px rgba(0,242,254,0.45);
      color: #0d0d1a;
    }
    .btn-secondary {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: var(--card-bg);
      backdrop-filter: blur(12px);
      border: 1px solid var(--card-border);
      color: var(--text-primary);
      font-weight: 600;
      font-size: 0.95rem;
      padding: 0.85rem 1.8rem;
      border-radius: 12px;
      text-decoration: none;
      transition: all 0.2s ease;
      white-space: nowrap;
    }
    .btn-secondary:hover {
      background: var(--card-bg-hover);
      border-color: var(--card-border-hover);
      transform: translateY(-2px);
      color: var(--text-primary);
    }
    .btn-outline {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: transparent;
      border: 2px solid rgba(255,255,255,0.3);
      color: #fff;
      font-weight: 600;
      font-size: 1rem;
      padding: 0.9rem 2rem;
      border-radius: 12px;
      text-decoration: none;
      transition: all 0.2s ease;
    }
    .btn-outline:hover {
      border-color: rgba(255,255,255,0.7);
      background: rgba(255,255,255,0.08);
      color: #fff;
    }
    .btn-large { font-size: 1.05rem; padding: 1rem 2.2rem; }
    .btn-icon { font-size: 1.1rem; }

    /* ─── HERO ────────────────────────────────────────────────── */
    .hero {
      position: relative;
      min-height: 100vh;
      display: flex;
      align-items: center;
      overflow: hidden;
      padding: 7rem 1.5rem 4rem;
    }

    /* Gradient orbs */
    .orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(80px);
      pointer-events: none;
      z-index: 0;
    }
    .orb-1 {
      width: 600px; height: 600px;
      top: -200px; left: -150px;
      background: radial-gradient(circle, rgba(0,242,254,0.12) 0%, transparent 70%);
      animation: float 10s ease-in-out infinite;
    }
    .orb-2 {
      width: 500px; height: 500px;
      bottom: -200px; right: -100px;
      background: radial-gradient(circle, rgba(168,85,247,0.10) 0%, transparent 70%);
      animation: float 13s ease-in-out infinite reverse;
    }
    .orb-3 {
      width: 300px; height: 300px;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      background: radial-gradient(circle, rgba(79,172,254,0.07) 0%, transparent 70%);
      animation: float 8s ease-in-out infinite 2s;
    }

    /* Particles */
    .particle-field { position: absolute; inset: 0; pointer-events: none; z-index: 0; }
    .particle {
      position: absolute;
      background: var(--accent-cyan);
      border-radius: 50%;
      animation: twinkle var(--dur, 4s) ease-in-out infinite;
    }

    .hero-inner {
      position: relative;
      z-index: 1;
      max-width: 1200px;
      margin: 0 auto;
      width: 100%;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4rem;
      align-items: center;
    }

    /* Hero copy */
    .hero-copy {
      animation: slide-in-left 0.8s ease both;
    }
    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.78rem;
      font-weight: 600;
      color: var(--accent-cyan);
      background: rgba(0,242,254,0.08);
      border: 1px solid rgba(0,242,254,0.2);
      padding: 0.35rem 0.9rem;
      border-radius: 20px;
      margin-bottom: 1.5rem;
    }
    .badge-dot {
      width: 6px; height: 6px;
      background: var(--accent-cyan);
      border-radius: 50%;
      animation: pulse-glow 2s infinite;
    }
    .hero-title {
      font-size: clamp(2.4rem, 5.5vw, 4rem);
      font-weight: 700;
      line-height: 1.1;
      color: var(--text-primary);
      margin-bottom: 1.4rem;
      letter-spacing: -1px;
      transition: color 0.4s ease;
    }
    .hero-sub {
      font-size: 1.05rem;
      color: var(--text-secondary);
      line-height: 1.7;
      margin-bottom: 2.2rem;
      max-width: 460px;
      transition: color 0.4s ease;
    }
    .hero-cta {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
      margin-bottom: 2.5rem;
    }
    .trust-badges {
      display: flex;
      gap: 1.2rem;
      flex-wrap: wrap;
    }
    .badge-item {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.82rem;
      font-weight: 500;
      color: var(--text-secondary);
      transition: color 0.4s ease;
    }
    .badge-icon { font-size: 1rem; }

    /* ─── 3D SCENE ────────────────────────────────────────────── */
    .hero-scene {
      animation: slide-in-right 0.8s ease 0.2s both;
      display: flex;
      justify-content: center;
    }
    .scene-wrapper {
      position: relative;
      width: 420px;
      height: 420px;
    }

    /* City skyline SVG backdrop */
    .city-skyline {
      position: absolute;
      bottom: 20px;
      left: -10px;
      right: -10px;
      height: 200px;
      opacity: 0.6;
    }
    .skyline-svg { width: 100%; height: 100%; }
    .win-blink {
      animation: twinkle 2.5s ease-in-out infinite;
    }

    /* 3D isometric building */
    .building-3d {
      position: absolute;
      top: 50px;
      left: 50%;
      transform: translateX(-50%);
      width: 130px;
      height: 180px;
      transform-style: preserve-3d;
      animation: float 5s ease-in-out infinite;
    }
    .b-face {
      position: absolute;
      backface-visibility: hidden;
    }
    .b-top {
      width: 130px;
      height: 60px;
      background: linear-gradient(135deg, #1e2a4a 0%, #0f1826 100%);
      border: 1px solid rgba(0,242,254,0.3);
      transform: rotateX(60deg) translateZ(0px) translateY(-30px);
      top: 0;
      left: 0;
      border-radius: 4px 4px 0 0;
    }
    .b-front {
      width: 130px;
      height: 180px;
      background: linear-gradient(180deg, #1a2540 0%, #0f1520 100%);
      border: 1px solid rgba(79,172,254,0.25);
      border-radius: 0 0 6px 6px;
      top: 10px;
      left: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 16px 10px 0;
      gap: 8px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05);
    }
    .b-side {
      width: 50px;
      height: 180px;
      background: linear-gradient(180deg, #111d35 0%, #09101c 100%);
      border: 1px solid rgba(79,172,254,0.15);
      transform: skewY(-30deg) translateX(128px) translateY(-54px);
      top: 10px;
      left: 0;
      padding: 20px 6px 0;
    }
    .window-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 6px;
      width: 100%;
    }
    .side-grid {
      grid-template-columns: repeat(2, 1fr);
    }
    .win {
      height: 18px;
      border-radius: 3px;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.08);
      transition: background 0.4s ease;
    }
    .win.lit {
      background: rgba(0,242,254,0.25);
      border-color: rgba(0,242,254,0.4);
      box-shadow: 0 0 8px rgba(0,242,254,0.3);
      animation: twinkle 3s ease-in-out infinite;
    }
    .door {
      width: 24px;
      height: 32px;
      background: rgba(0,242,254,0.15);
      border: 1px solid rgba(0,242,254,0.3);
      border-radius: 3px 3px 0 0;
      margin-top: auto;
      align-self: flex-end;
      margin-bottom: -1px;
    }

    /* Location pin */
    .location-pin {
      position: absolute;
      top: 20px;
      right: 30px;
      display: flex;
      flex-direction: column;
      align-items: center;
      animation: bounce-pin 2.5s ease-in-out infinite;
    }
    .pin-body {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .pin-emoji { font-size: 2.4rem; filter: drop-shadow(0 4px 8px rgba(0,242,254,0.5)); }
    .pin-pulse-ring {
      position: absolute;
      width: 50px; height: 50px;
      border-radius: 50%;
      border: 2px solid rgba(0,242,254,0.5);
      animation: pulse-glow 2s ease-out infinite;
    }
    .pin-label {
      font-size: 0.7rem;
      font-weight: 700;
      color: var(--accent-cyan);
      background: rgba(0,242,254,0.1);
      border: 1px solid rgba(0,242,254,0.25);
      padding: 0.15rem 0.5rem;
      border-radius: 10px;
      margin-top: 0.3rem;
      white-space: nowrap;
    }

    /* Key icon */
    .key-icon {
      position: absolute;
      bottom: 60px;
      left: 20px;
      font-size: 2.5rem;
      animation: float 4s ease-in-out infinite 1s;
      filter: drop-shadow(0 4px 10px rgba(255,184,0,0.4));
    }

    /* Floating mini listing cards */
    .float-card {
      position: absolute;
      display: flex;
      gap: 0.5rem;
      background: var(--card-bg);
      backdrop-filter: blur(14px);
      border: 1px solid var(--card-border);
      border-radius: 10px;
      padding: 0.5rem;
      width: 155px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.3);
      cursor: pointer;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .float-card:hover {
      transform: translateY(-4px) scale(1.02) !important;
      box-shadow: 0 16px 32px rgba(0,0,0,0.4);
    }
    .fc-1 {
      top: 20px; left: -10px;
      animation: cascade-in 0.6s ease 0.3s both, float 6s ease-in-out 1s infinite;
    }
    .fc-2 {
      top: 170px; right: -10px;
      animation: cascade-in 0.6s ease 0.5s both, float 7s ease-in-out 0.5s infinite reverse;
    }
    .fc-3 {
      bottom: 70px; left: -5px;
      animation: cascade-in 0.6s ease 0.7s both, float 5.5s ease-in-out 2s infinite;
    }
    .fc-img {
      width: 44px; height: 52px;
      border-radius: 6px;
      background: linear-gradient(135deg, #1a3054, #0e1d36);
      flex-shrink: 0;
    }
    .fc-img-2 { background: linear-gradient(135deg, #1a2540, #2d1a40); }
    .fc-img-3 { background: linear-gradient(135deg, #1a3030, #0e2420); }
    .fc-info {
      display: flex; flex-direction: column; gap: 0.2rem;
      overflow: hidden;
    }
    .fc-tag {
      font-size: 0.65rem; font-weight: 800;
      background: var(--accent-cyan); color: #0d0d1a;
      padding: 0.1rem 0.35rem; border-radius: 4px;
      align-self: flex-start;
    }
    .fc-price {
      font-size: 0.75rem; font-weight: 700;
      color: var(--text-primary);
      transition: color 0.4s ease;
    }
    .fc-loc {
      font-size: 0.65rem;
      color: var(--text-secondary);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      transition: color 0.4s ease;
    }

    /* ─── STATS BAR ───────────────────────────────────────────── */
    .stats-bar {
      padding: 2.5rem 1.5rem;
      background: var(--bg-secondary);
      border-top: 1px solid var(--card-border);
      border-bottom: 1px solid var(--card-border);
      transition: background 0.4s ease, border-color 0.4s ease;
    }
    .stats-inner {
      max-width: 1200px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 2rem;
    }
    .stat-item {
      display: flex; flex-direction: column;
      align-items: center; gap: 0.3rem;
    }
    .stat-value {
      font-size: clamp(1.8rem, 3.5vw, 2.8rem);
      font-weight: 700;
      background: linear-gradient(135deg, #00f2fe, #4facfe);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      line-height: 1;
    }
    .stat-label {
      font-size: 0.8rem;
      color: var(--text-secondary);
      font-weight: 500;
      text-align: center;
      transition: color 0.4s ease;
    }

    /* ─── HOW IT WORKS ────────────────────────────────────────── */
    .how-it-works {
      padding: 6rem 1.5rem;
    }
    .steps-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 2rem;
      position: relative;
    }
    .step-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 20px;
      padding: 2.2rem 1.8rem;
      text-align: center;
      position: relative;
      transition: transform 0.25s ease, box-shadow 0.25s ease, background 0.4s ease, border-color 0.4s ease;
      animation: fadeInUp 0.6s ease both;
    }
    .step-card:hover {
      transform: translateY(-6px);
      box-shadow: 0 20px 48px rgba(0,242,254,0.08);
      border-color: rgba(0,242,254,0.2);
    }
    .step-number {
      position: absolute;
      top: -16px; left: 50%;
      transform: translateX(-50%);
      width: 32px; height: 32px;
      background: linear-gradient(135deg, #00f2fe, #4facfe);
      color: #0d0d1a;
      font-weight: 800; font-size: 0.85rem;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
    }
    .step-icon-wrap { font-size: 2.5rem; margin-bottom: 1rem; }
    .step-title {
      font-size: 1.05rem; font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 0.5rem;
      transition: color 0.4s ease;
    }
    .step-desc {
      font-size: 0.85rem;
      color: var(--text-secondary);
      line-height: 1.65;
      transition: color 0.4s ease;
    }
    .step-connector {
      display: none;
    }

    /* ─── CATEGORIES ──────────────────────────────────────────── */
    .categories-section {
      padding: 6rem 1.5rem;
      background: var(--bg-secondary);
      transition: background 0.4s ease;
    }
    .categories-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 1.2rem;
    }
    .cat-card {
      position: relative;
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 16px;
      padding: 1.8rem 1.2rem 1.4rem;
      text-decoration: none;
      display: flex; flex-direction: column; gap: 0.35rem;
      overflow: hidden;
      transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease, background 0.4s ease;
      cursor: pointer;
    }
    .cat-card:hover {
      transform: translateY(-5px) scale(1.02);
      box-shadow: 0 16px 40px rgba(0,0,0,0.25);
      border-color: rgba(0,242,254,0.25);
    }
    .cat-bg {
      position: absolute; inset: 0;
      opacity: 0.06;
      transition: opacity 0.25s ease;
    }
    .cat-card:hover .cat-bg { opacity: 0.12; }
    .cat-icon { font-size: 2.2rem; margin-bottom: 0.2rem; }
    .cat-name {
      font-size: 1rem; font-weight: 700;
      color: var(--text-primary);
      transition: color 0.4s ease;
    }
    .cat-count {
      font-size: 0.75rem;
      color: var(--text-secondary);
      transition: color 0.4s ease;
    }
    .cat-arrow {
      position: absolute; top: 1rem; right: 1rem;
      font-size: 1.1rem;
      color: var(--accent-cyan);
      opacity: 0;
      transform: translateX(-4px);
      transition: opacity 0.2s ease, transform 0.2s ease;
    }
    .cat-card:hover .cat-arrow { opacity: 1; transform: translateX(0); }

    /* ─── FEATURES ────────────────────────────────────────────── */
    .features-section {
      padding: 6rem 1.5rem;
    }
    .features-inner {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 5rem;
      align-items: center;
    }

    /* Phone mockup */
    .features-scene {
      position: relative;
      display: flex;
      justify-content: center;
    }
    .fs-phone {
      width: 240px;
      background: var(--bg-secondary);
      border: 1px solid var(--card-border);
      border-radius: 24px;
      padding: 1.5rem 1rem;
      box-shadow: 0 30px 70px rgba(0,0,0,0.4);
      animation: float 7s ease-in-out infinite;
      transition: background 0.4s ease;
    }
    .fs-screen { display: flex; flex-direction: column; gap: 0.8rem; }
    .fs-row {
      display: flex; align-items: center; gap: 0.8rem;
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 10px;
      padding: 0.7rem;
      transition: background 0.4s ease;
    }
    .fs-thumb {
      width: 36px; height: 36px; border-radius: 8px;
      background: linear-gradient(135deg, #1a3054, #0e1d36);
      flex-shrink: 0;
    }
    .fs-lines { flex: 1; display: flex; flex-direction: column; gap: 0.3rem; }
    .fs-line {
      height: 8px; border-radius: 4px;
      background: var(--card-border);
    }
    .fs-line.long { width: 100%; }
    .fs-line.short { width: 60%; }
    .fs-badge {
      width: 24px; height: 24px; border-radius: 50%;
      background: rgba(0,242,254,0.15);
      color: var(--accent-cyan);
      display: flex; align-items: center; justify-content: center;
      font-size: 0.7rem; font-weight: 800;
    }
    .fs-badge-float {
      position: absolute;
      font-size: 0.72rem; font-weight: 700;
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      backdrop-filter: blur(12px);
      padding: 0.3rem 0.7rem;
      border-radius: 20px;
      color: var(--text-primary);
      transition: background 0.4s ease, color 0.4s ease;
      white-space: nowrap;
    }
    .fs-b1 { top: -10px; right: -20px; animation: float 5s ease-in-out 0.5s infinite; }
    .fs-b2 { top: 50%; right: -30px; animation: float 6s ease-in-out 1s infinite reverse; }
    .fs-b3 { bottom: 10px; left: -20px; animation: float 4.5s ease-in-out 0.2s infinite; }

    /* Feature items */
    .feature-item {
      display: flex; align-items: flex-start; gap: 1rem;
      padding: 1.1rem;
      border-radius: 12px;
      transition: background 0.2s ease;
      animation: fadeInUp 0.5s ease both;
    }
    .feature-item:hover {
      background: var(--card-bg);
    }
    .fi-icon-wrap {
      width: 44px; height: 44px;
      border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.4rem;
      flex-shrink: 0;
    }
    .fi-title {
      font-size: 0.95rem; font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 0.3rem;
      transition: color 0.4s ease;
    }
    .fi-desc {
      font-size: 0.83rem;
      color: var(--text-secondary);
      line-height: 1.55;
      transition: color 0.4s ease;
    }

    /* ─── TESTIMONIALS ────────────────────────────────────────── */
    .testimonials-section {
      padding: 6rem 1.5rem;
      background: var(--bg-secondary);
      transition: background 0.4s ease;
    }
    .testimonials-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;
    }
    .testimonial-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 16px;
      padding: 1.8rem;
      display: flex; flex-direction: column; gap: 1rem;
      transition: transform 0.25s ease, box-shadow 0.25s ease, background 0.4s ease, border-color 0.4s ease;
      animation: fadeInUp 0.6s ease both;
    }
    .testimonial-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 16px 40px rgba(0,0,0,0.2);
      border-color: rgba(0,242,254,0.15);
    }
    .stars { color: #ffb800; font-size: 0.9rem; letter-spacing: 2px; }
    .t-quote {
      font-size: 0.88rem;
      color: var(--text-secondary);
      line-height: 1.65;
      font-style: italic;
      flex: 1;
      transition: color 0.4s ease;
    }
    .t-author {
      display: flex; align-items: center; gap: 0.8rem;
    }
    .t-avatar {
      width: 38px; height: 38px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.85rem; font-weight: 700; color: #fff;
      flex-shrink: 0;
    }
    .t-name {
      display: block;
      font-size: 0.85rem; font-weight: 700;
      color: var(--text-primary);
      transition: color 0.4s ease;
    }
    .t-role {
      display: block;
      font-size: 0.75rem;
      color: var(--text-muted);
      transition: color 0.4s ease;
    }

    /* ─── CTA BAND ────────────────────────────────────────────── */
    .cta-band {
      position: relative;
      overflow: hidden;
      padding: 6rem 1.5rem;
      background: linear-gradient(135deg, #09090d 0%, #0f1826 50%, #09090d 100%);
      text-align: center;
    }
    :root.light .cta-band {
      background: linear-gradient(135deg, #e8eeff 0%, #d0d8ff 50%, #e8eeff 100%);
    }
    .cta-orb {
      position: absolute;
      border-radius: 50%; filter: blur(80px); pointer-events: none;
    }
    .cta-orb-1 {
      width: 400px; height: 400px; top: -100px; left: -100px;
      background: radial-gradient(circle, rgba(0,242,254,0.12), transparent 70%);
    }
    .cta-orb-2 {
      width: 350px; height: 350px; bottom: -80px; right: -80px;
      background: radial-gradient(circle, rgba(168,85,247,0.1), transparent 70%);
    }
    .cta-inner { position: relative; z-index: 1; }
    .cta-title {
      font-size: clamp(1.9rem, 4vw, 3rem);
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 1rem;
      transition: color 0.4s ease;
    }
    .cta-sub {
      font-size: 1rem;
      color: var(--text-secondary);
      margin-bottom: 2.5rem;
      transition: color 0.4s ease;
    }
    .cta-actions {
      display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;
    }

    /* ─── RESPONSIVE ──────────────────────────────────────────── */
    @media (max-width: 900px) {
      .hero-inner {
        grid-template-columns: 1fr;
        gap: 3rem;
        text-align: center;
      }
      .hero-scene { order: -1; }
      .scene-wrapper { width: 320px; height: 320px; margin: 0 auto; }
      .hero-cta { justify-content: center; }
      .trust-badges { justify-content: center; }
      .hero-badge { margin: 0 auto 1.5rem; }
      .hero-sub { margin: 0 auto 2.2rem; }
      .fc-1 { top: 0; left: -20px; }
      .fc-2 { top: 100px; right: -20px; }
      .fc-3 { bottom: 20px; left: -10px; }
      .steps-grid { grid-template-columns: 1fr; max-width: 460px; margin: 0 auto; }
      .stats-inner { grid-template-columns: repeat(2, 1fr); }
      .testimonials-grid { grid-template-columns: 1fr; max-width: 460px; margin: 0 auto; }
      .features-inner { grid-template-columns: 1fr; }
      .features-visual { display: none; }
    }
    @media (max-width: 600px) {
      .hero { padding: 6rem 1rem 3rem; }
      .scene-wrapper { width: 280px; height: 280px; }
      .building-3d { width: 100px; height: 140px; }
      .b-front { width: 100px; }
      .b-top { width: 100px; }
      .stats-inner { grid-template-columns: repeat(2, 1fr); gap: 1.2rem; }
      .categories-grid { grid-template-columns: repeat(2, 1fr); }
    }
  `]
})
export class LandingComponent implements OnInit, AfterViewInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);

  @ViewChild('statsSection') statsSection!: ElementRef;

  particles: Array<{ x: number; y: number; size: number; delay: number; dur: number }> = [];
  statsAnimated = false;
  private observer?: IntersectionObserver;

  stats = [
    { label: 'Rooms Listed',      target: 500,  display: '0+' },
    { label: 'Verified Owners',   target: 200,  display: '0+' },
    { label: 'Happy Tenants',     target: 1200, display: '0+' },
    { label: 'Avg. Days to Move', target: 3,    display: '0' },
  ];

  steps = [
    { icon: '1', title: 'Search & Filter',    desc: 'Use smart filters — radius, budget, category, amenities — to find your ideal room in seconds.' },
    { icon: '2', title: 'Connect Directly',   desc: 'Message or call verified owners directly. No middlemen, no brokerage, no hidden fees.' },
    { icon: '3', title: 'Move In Happy',       desc: 'Visit the property, finalise the deal, and move in with full confidence in your new home.' },
  ];

  categories = [
    { icon: 'PG', name: 'PG',               count: '120+', gradient: 'linear-gradient(135deg, #00f2fe, #4facfe)' },
    { icon: '1B', name: '1 BHK',            count: '95+',  gradient: 'linear-gradient(135deg, #a855f7, #6366f1)' },
    { icon: '2B', name: '2 BHK',            count: '80+',  gradient: 'linear-gradient(135deg, #f97316, #fb923c)' },
    { icon: '3B', name: '3 BHK',            count: '45+',  gradient: 'linear-gradient(135deg, #22c55e, #16a34a)' },
    { icon: 'SR', name: 'Single Room',      count: '110+', gradient: 'linear-gradient(135deg, #ec4899, #f43f5e)' },
    { icon: 'IF', name: 'Independent Floor', count: '50+',  gradient: 'linear-gradient(135deg, #ffb800, #f59e0b)' },
  ];

  features = [
    { icon: '✓', iconBg: 'rgba(0,242,254,0.12)',   title: 'Zero Brokerage Guarantee',    desc: 'Connect with owners directly. Every single listing on Rent2Live is broker-free.' },
    { icon: '✓', iconBg: 'rgba(168,85,247,0.12)',  title: 'DPDP-Compliant & Secure',     desc: 'Your personal data is protected under the Digital Personal Data Protection Act.' },
    { icon: '✓', iconBg: 'rgba(249,115,22,0.12)',  title: 'Photo-Verified Listings',     desc: 'All listings must include real photos. No fake or misleading listings — ever.' },
    { icon: '✓', iconBg: 'rgba(34,197,94,0.12)',   title: 'In-App Owner Chat',           desc: 'Chat securely with property owners without sharing your number until you\'re ready.' },
    { icon: '✓', iconBg: 'rgba(255,184,0,0.12)',   title: 'Smart Search Alerts',         desc: 'Save your search and get notified the moment a matching room becomes available.' },
    { icon: '✓', iconBg: 'rgba(236,72,153,0.12)',  title: 'Hyper-Local Map View',        desc: 'See listings plotted on a Noida map. Filter by distance from your workplace or college.' },
  ];

  testimonials = [
    {
      stars: 5,
      quote: 'Found my 1BHK in Sector 62 within 2 days. No broker, no drama. Rent2Live is a lifesaver for working professionals.',
      name: 'Priya S.',
      role: 'Software Engineer, Noida',
      initials: 'PS',
      avatarBg: 'linear-gradient(135deg, #00f2fe, #4facfe)',
    },
    {
      stars: 5,
      quote: 'I listed my flat and got genuine inquiries within hours. The in-app chat made it so easy to screen tenants.',
      name: 'Rahul M.',
      role: 'Property Owner, Sector 50',
      initials: 'RM',
      avatarBg: 'linear-gradient(135deg, #a855f7, #6366f1)',
    },
    {
      stars: 5,
      quote: 'The search alert feature is genius. I saved my filters and got notified as soon as my perfect PG was listed!',
      name: 'Ananya K.',
      role: 'MBA Student, Noida',
      initials: 'AK',
      avatarBg: 'linear-gradient(135deg, #f97316, #fb923c)',
    },
  ];

  private realTimeTimer: any = null;

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.generateParticles();
    }
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.setupStatsObserver();
    }
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    if (this.realTimeTimer) {
      clearInterval(this.realTimeTimer);
    }
  }

  generateParticles(): void {
    this.particles = Array.from({ length: 28 }, () => ({
      x:     Math.random() * 100,
      y:     Math.random() * 100,
      size:  Math.random() * 2.5 + 1,
      delay: Math.random() * 5,
      dur:   Math.random() * 4 + 3,
    }));
  }

  setupStatsObserver(): void {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.statsAnimated) {
          this.statsAnimated = true;
          this.animateStats();
        }
      });
    }, { threshold: 0.05 });

    if (this.statsSection?.nativeElement) {
      this.observer.observe(this.statsSection.nativeElement);
    }
  }

  animateStats(): void {
    const duration = 1800;
    const steps    = 60;
    const interval = duration / steps;
    let completedCount = 0;

    this.stats.forEach((stat, i) => {
      let current = 0;
      const increment = stat.target / steps;
      const timer = setInterval(() => {
        current = Math.min(current + increment, stat.target);
        const val = Math.round(current);
        this.stats[i] = {
          ...stat,
          display: i < 3 ? val + '+' : val + ' days',
        };
        // Copy array reference to force Angular CD rendering
        this.stats = [...this.stats];

        if (current >= stat.target) {
          clearInterval(timer);
          completedCount++;
          if (completedCount === this.stats.length) {
            this.startRealTimeStatsUpdates();
          }
        }
      }, interval);
    });
  }

  startRealTimeStatsUpdates(): void {
    // Increment stats every 7-10 seconds to simulate real-time growth
    this.realTimeTimer = setInterval(() => {
      this.stats = this.stats.map((stat, i) => {
        if (i === 3) return stat; // Do not increment days to move
        
        // Randomly increment by 1 or 2
        const increment = Math.floor(Math.random() * 2) + 1;
        const newTarget = stat.target + increment;
        
        return {
          ...stat,
          target: newTarget,
          display: newTarget + '+'
        };
      });
    }, 8500);
  }
}
