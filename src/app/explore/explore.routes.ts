// src/app/explore/explore.routes.ts
import { Routes } from '@angular/router';

export const EXPLORE_ROUTES: Routes = [
  {
    path: 'neighborhoods',
    loadComponent: () =>
      import('./neighborhoods/neighborhoods.component').then(m => m.NeighborhoodsComponent)
  },
  {
    path: 'area-guides',
    loadComponent: () =>
      import('./area-guides/area-guides.component').then(m => m.AreaGuidesComponent)
  },
  {
    path: 'market-trends',
    loadComponent: () =>
      import('./market-trends/market-trends.component').then(m => m.MarketTrendsComponent)
  },
  { path: '', redirectTo: 'neighborhoods', pathMatch: 'full' }
];
