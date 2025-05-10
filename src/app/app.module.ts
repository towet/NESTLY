import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';
import { HomeComponent } from './home/home.component';
import { AboutComponent } from './about/about.component';
import { ContactUsComponent } from './contact-us/contact-us.component';
import { PropertyDetailsComponent } from './property-details/property-details.component';
import { MatDialogModule } from '@angular/material/dialog';
import { ScheduleViewingModalComponent } from './shared/components/schedule-viewing-modal/schedule-viewing-modal.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    AboutComponent,
    ContactUsComponent,
    MatDialogModule,
    PropertyDetailsComponent,
    ScheduleViewingModalComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    AppRoutingModule,
    FormsModule
    
  ],
  providers: [],
  bootstrap: [AppComponent] 
})
export class AppModule { }
