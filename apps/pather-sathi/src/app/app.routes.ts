import { Route } from '@angular/router';
import { loginGuard } from '@pather-sathi/login'

export const appRoutes: Route[] = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'home'
    },
    {
        path: 'home',
        loadComponent: () => 
            import('@pather-sathi/home').then((compoent) => compoent.Home)
    },
    {
        path: 'gallery',
        loadComponent: () => 
            import('@pather-sathi/gallery').then((component) => component.GalleryComponent)
    },
    {
        path: 'admin/upload',
        loadComponent: () => 
            import('@pather-sathi/upload').then((component) => component.UploadComponent),
        canActivate: [loginGuard]
    },
    {
        path: 'admin/login',
        loadComponent: () => 
            import('@pather-sathi/login').then((component) => component.Login)
    },
    {
        path: 'admin/sign-up',
        loadComponent: () => 
            import('@pather-sathi/sign-up').then((component) => component.SignUp)
    },
    {
        path: 'donate',
        loadComponent: () => 
            import('@pather-sathi/payment-gateway').then((component) => component.PaymentGateway)
    }

];
