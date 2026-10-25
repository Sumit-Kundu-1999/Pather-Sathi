import { createFeature, createReducer, on } from '@ngrx/store';
import { authActions, islogInFailure, islogInSuccess } from './auth.action';

export interface AuthState {
    token: string | null;
    error: string | null;
}

export const initialState: AuthState = { token: null, error: null };

export const authFeature = createFeature({
    name: 'auth',
    reducer: createReducer(
        initialState,
        // Short approach (Implicit return using parentheses)
        on(authActions.loginSuccess, (state, { token }) => ({ ...state, token, error: null })),
        // Explicit approach (Block body with a return statement)
        on(authActions.loginFailure, (state, { error }) => {
            return { ...state, token: null, error }
        }),
        on(authActions.logout, () => initialState)
    )
})
