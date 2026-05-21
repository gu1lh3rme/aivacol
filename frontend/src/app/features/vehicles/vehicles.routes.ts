import { Routes } from '@angular/router';
import { VehicleFormPageComponent } from './pages/vehicle-form-page.component';
import { VehicleListPageComponent } from './pages/vehicle-list-page.component';

export const VEHICLE_ROUTES: Routes = [
  { path: '', component: VehicleListPageComponent },
  { path: 'new', component: VehicleFormPageComponent },
  { path: ':id/edit', component: VehicleFormPageComponent },
];
