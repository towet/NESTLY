// src/app/help/help.routes.ts
import { Routes } from '@angular/router';

export const HELP_ROUTES: Routes = [
  {
    path: 'help-center',
    loadComponent: () =>
      import('./help-center/help-center.component').then(m => m.HelpCenterComponent)
  },
  {
    path: 'faq',
    loadComponent: () =>
      import('./faq/faq.component').then(m => m.FaqComponent)
  },
  {
    path: 'contact-support',
    loadComponent: () =>
      import('./contact-support/contact-support.component').then(m => m.ContactSupportComponent)
  },
  {
    path: 'user-guide',
    loadComponent: () =>
      import('./user-guide/user-guide.component').then(m => m.UserGuideComponent)
  },
  { path: '', redirectTo: 'help-center', pathMatch: 'full' }
];
