import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    const expectedRole = route.data['role'];
    if (!expectedRole || authService.userRole() === expectedRole || authService.userRole() === 'admin') {
      return true;
    }
    // Role mismatch, redirect to home or corresponding dashboard
    router.navigate(['/']);
    return false;
  }

  // Not authenticated, redirect to login
  router.navigate(['/login']);
  return false;
};
