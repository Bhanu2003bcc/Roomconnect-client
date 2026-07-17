import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { SignupComponent } from './features/auth/signup/signup.component';
import { ListingSearchComponent } from './features/search/listing-search/listing-search.component';
import { ListingDetailComponent } from './features/listings/listing-detail/listing-detail.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { ChatComponent } from './features/chat/chat.component';
import { AdminDashboardComponent } from './features/admin/admin-dashboard/admin-dashboard.component';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  { path: '', component: ListingSearchComponent },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'listings/:id', component: ListingDetailComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard], data: { role: 'visitor' } },
  { path: 'owner/dashboard', component: DashboardComponent, canActivate: [authGuard], data: { role: 'owner' } },
  { path: 'chat', component: ChatComponent, canActivate: [authGuard] },
  { path: 'admin', component: AdminDashboardComponent, canActivate: [authGuard], data: { role: 'admin' } },
  { path: '**', redirectTo: '' }
];
