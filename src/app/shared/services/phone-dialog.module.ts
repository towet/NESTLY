// phone-dialog.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { PhoneDialogComponent } from './phone-dialog.component';

@NgModule({
  declarations: [PhoneDialogComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule
  ],
  exports: [PhoneDialogComponent]
})
export class PhoneDialogModule { }
