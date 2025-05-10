// src/app/properties/properties.routes.ts
import { Routes } from '@angular/router';

export const PROPERTIES_ROUTES: Routes = [
  {
    path: 'residential',
    loadComponent: () =>
      import('./residential/residential.component').then(m => m.ResidentialComponent)
  },
  {
    path: 'commercial',
    loadComponent: () =>
      import('./commercial/commercial.component').then(m => m.CommercialComponent)
  },
  {
    path: 'land',
    loadComponent: () =>
      import('./land/land.component').then(m => m.LandComponent)
  },
  // Optionally, redirect empty path to one of the subroutes:
  { path: '', redirectTo: 'residential', pathMatch: 'full' }
];
