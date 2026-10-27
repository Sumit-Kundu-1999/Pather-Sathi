import { Component, HostListener, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { authActions, AuthState, selectIsAuthenticated } from '@pather-sathi/auth-store';
import { AuthService } from '@pather-sathi/auth';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header-component.html',
  styleUrls: ['./header-component.css']
})
export class HeaderComponent {
  router = inject(Router);
  authService = inject(AuthService);

  isScrolled = false;
  isMobileMenuOpen = false;
  // isLoggedIn$!: Observable<boolean>;
  isLoggedIn!: boolean;
  loginLabel = signal<'Login' | 'Logout'>('Login')

  constructor(private store: Store<AuthState>) {
    this.store.select(selectIsAuthenticated).subscribe((value) => {
      if(value) {
        this.loginLabel.set('Logout');
      }
      return this.isLoggedIn = value;
    });

  }

  // Adds a shadow when the user scrolls down
  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled = window.scrollY > 20;
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  onLoginClick() {
    this.isMobileMenuOpen = false;
    if (this.isLoggedIn) {
      this.loginLabel.set('Login');
      this.authService.logout();
      this.store.dispatch(authActions.logout());
      this.router.navigate(['home']);
    }
    else {
      this.loginLabel.set('Login');
      this.router.navigate(['/admin/login']);
    }
  }

}