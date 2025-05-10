// src/app/short-stays/short-stays.routes.ts
import { Routes } from '@angular/router';

export const SHORT_STAYS_ROUTES: Routes = [
  {
    path: 'vacation-homes',
    loadComponent: () =>
      import('./vacation-homes/vacation-homes.component').then(m => m.VacationHomesComponent)
  },
  {
    path: 'serviced-apartments',
    loadComponent: () =>
      import('./serviced-apartments/serviced-apartments.component').then(m => m.ServicedApartmentsComponent)
  },
  { path: '', redirectTo: 'vacation-homes', pathMatch: 'full' }
];
