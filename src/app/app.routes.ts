import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AboutComponent } from './about/about.component';
import { ContactUsComponent } from './contact-us/contact-us.component';
import { SearchResultsComponent } from './search/search-results/search-results.component';
import { PhoneNumberGuard } from './guards/phone-number.guard';
import { OfficeSpacesComponent } from './commercial/office-spaces/office-spaces.component';
import { RetailSpacesComponent } from './commercial/retail-spaces/retail-spaces.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'about', component: AboutComponent },
  { path: 'contact', component: ContactUsComponent },
  {
    path: 'property/:id',
    loadComponent: () =>
      import('./property-details/property-details.component').then(
        (m) => m.PropertyDetailsComponent
      )
  },
  { path: 'search', component: SearchResultsComponent, canActivate: [PhoneNumberGuard] },
  {
    path: 'help/contact-support',
    loadComponent: () =>
      import('./help/contact-support/contact-support.component').then(m => m.ContactSupportComponent)
  },
  {
    path: 'properties',
    loadChildren: () =>
      import('./properties/properties.routes').then(m => m.PROPERTIES_ROUTES)
  },
  {
    path: 'short-stays',
    loadChildren: () =>
      import('./short-stays/short-stays.routes').then(m => m.SHORT_STAYS_ROUTES)
  },
  {
    path: 'explore',
    loadChildren: () =>
      import('./explore/explore.routes').then(m => m.EXPLORE_ROUTES)
  },
  {
    path: 'help',
    loadChildren: () =>
      import('./help/help.routes').then(m => m.HELP_ROUTES)
  },
  {
    path: 'commercial/office-spaces',
    component: OfficeSpacesComponent
  },
  {
    path: 'commercial/retail-spaces',
    component: RetailSpacesComponent
  }
];
