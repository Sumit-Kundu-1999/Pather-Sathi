import { createAction, createActionGroup, emptyProps, props } from '@ngrx/store'

export const islogInSuccess = createAction('[LoggedIn] IslogInSuccess');
export const islogInFailure = createAction('[LoggedIn] IslogInFailure');

export const authActions = createActionGroup({
    source: 'Auth',
    events: {
        'Login Success': props<{token: string}>(),
        'Login Failure': props<{error: string}>(),
        'Logout': emptyProps(),
    }
})