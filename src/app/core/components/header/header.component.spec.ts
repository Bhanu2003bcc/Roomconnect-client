import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeaderComponent } from './header.component';
import { provideRouter } from '@angular/router';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create header component', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle mobile menu open and close state', () => {
    expect(component.isMobileMenuOpen()).toBe(false);
    
    component.toggleMobileMenu();
    expect(component.isMobileMenuOpen()).toBe(true);

    component.closeMobileMenu();
    expect(component.isMobileMenuOpen()).toBe(false);
  });

  it('should render mobile drawer when open', () => {
    component.toggleMobileMenu();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const drawer = compiled.querySelector('#mobile-menu-drawer');
    expect(drawer).not.toBeNull();

    const exploreLink = compiled.querySelector('#mobile-nav-explore-link');
    expect(exploreLink?.textContent).toContain('Explore');

    const loginLink = compiled.querySelector('#mobile-nav-login-link');
    expect(loginLink?.textContent).toContain('Sign In');

    const signupLink = compiled.querySelector('#mobile-nav-signup-link');
    expect(signupLink?.textContent).toContain('Get Started');
  });
});
