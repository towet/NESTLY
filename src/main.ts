import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { importProvidersFrom } from '@angular/core';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { environment } from './environments/environment';
import 'zone.js';
import { provideHttpClient } from '@angular/common/http';
import { NgImageSliderModule } from 'ng-image-slider';
import { ModalService } from './app/shared/services/modal.service';
import { provideFunctions, getFunctions } from '@angular/fire/functions';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import '@angular/localize/init';


bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(),
    NgbModule,
    ModalService,
    importProvidersFrom(
      NgImageSliderModule,
      provideFirebaseApp(() => initializeApp(environment.firebase)),
      provideFirestore(() => getFirestore()),
      provideFunctions(() => getFunctions()),
      provideAuth(() => getAuth())
    ),
    provideRouter(routes)
  ]
})
.catch((err) => console.error(err));
