import { Component, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { AuthState, selectIsAuthenticated } from '@pather-sathi/auth-store';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header-component.html',
  styleUrls: ['./header-component.css']
})
export class HeaderComponent {
  isScrolled = false;
  isMobileMenuOpen = false;
  // const router = inject(Router);
  isLoggedIn$!: Observable<boolean>;
  
  constructor(private store:Store<AuthState>) {
    this.isLoggedIn$ = this.store.select(selectIsAuthenticated)
  }

  // Adds a shadow when the user scrolls down
  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled = window.scrollY > 20;
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

}