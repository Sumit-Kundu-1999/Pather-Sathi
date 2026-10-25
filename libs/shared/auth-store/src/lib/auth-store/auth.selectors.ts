import { createFeatureSelector, createSelector } from "@ngrx/store";
import { AuthState } from "./auth.reducer";

// Grab the top-level auth feature state slice
export const selectAuthState = createFeatureSelector<AuthState>('auth');

// Select individual properties derived from the actions

export const selectAuthToken = createSelector(
    selectAuthState,
    (state) => state.token
);

export const selectAuthError = createSelector(
    selectAuthState,
    (state) => state.error
)

export const selectIsAuthenticated = createSelector(
  selectAuthState,
  (state) => !!state.token
);