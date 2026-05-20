import { Routes } from '@angular/router';
import { VehicleFormPageComponent } from './pages/vehicle-form-page.component';
import { VehicleListPageComponent } from './pages/vehicle-list-page.component';

export const VEHICLE_ROUTES: Routes = [
  { path: '', redirectTo: 'vehicles', pathMatch: 'full' },
  { path: 'vehicles', component: VehicleListPageComponent },
  { path: 'vehicles/new', component: VehicleFormPageComponent },
  { path: 'vehicles/:id/edit', component: VehicleFormPageComponent },
];
