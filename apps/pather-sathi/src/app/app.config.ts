import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { appRoutes } from './app.routes';
import { provideStore, Store } from '@ngrx/store'
import { authActions, authFeature, } from '@pather-sathi/auth-store'

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(), 
    provideRouter(appRoutes),
    provideStore({
      [authFeature.name]: authFeature.reducer,
    }),
    provideAppInitializer(() => {
      const token = localStorage.getItem('auth_token');
      const store = inject(Store);
      if(token) {
        store.dispatch(authActions.loginSuccess({token}));
      }
    })
  ],
};
