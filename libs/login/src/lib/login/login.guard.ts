import { inject } from '@angular/core'
import { CanActivateFn, Router } from '@angular/router'
import { Store } from '@ngrx/store'
import { selectIsAuthenticated } from '@pather-sathi/auth-store';
import { map, take } from 'rxjs';

export const loginGuard: CanActivateFn = () => {
    const store = inject(Store);
    const router = inject(Router);
    return store.select(selectIsAuthenticated).pipe(
        take(1),
        map(loggedIn => loggedIn || router.createUrlTree(['/admin/login']))
    );
}