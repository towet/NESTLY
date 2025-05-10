import { ApplicationConfig, provideZoneChangeDetection, importProvidersFrom } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { routes } from './app.routes';


export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    importProvidersFrom(NgbModule),  
    provideRouter(routes, withComponentInputBinding()),
    provideZoneChangeDetection({ 
      eventCoalescing: true,
      runCoalescing: true 
    }),
    provideHttpClient(withInterceptors([])),
    provideAnimations(),
 
 
    
  ]
};
