import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./shared/layouts/auth-shell/auth-shell.component').then((m) => m.AuthShellComponent),
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      {
        path: 'home',
        loadComponent: () => import('./features/home/pages/home-page.component').then((m) => m.HomePageComponent),
      },
      {
        path: 'vehicles',
        loadChildren: () => import('./features/vehicles/vehicles.routes').then((m) => m.VEHICLE_ROUTES),
      },
      {
        path: 'catalog',
        loadChildren: () => import('./features/catalog/catalog.routes').then((m) => m.CATALOG_ROUTES),
      },
      {
        path: 'history',
        loadComponent: () =>
          import('./features/history/pages/history-page.component').then((m) => m.HistoryPageComponent),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
