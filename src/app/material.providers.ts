// src/app/material.providers.ts
import { Provider } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

export const materialProviders: Provider[] = [
  MatDialog,
  MatDialogModule
];
