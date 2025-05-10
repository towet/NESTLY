// src/app/guards/phone-number.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PhoneService } from '../shared/services/phone.service';
import { ModalService } from '../shared/services/modal.service';
import { PhoneDialogComponent } from '../shared/services/phone-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class PhoneNumberGuard implements CanActivate {
  constructor(
    private modalService: ModalService,
    private phoneService: PhoneService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> | boolean {
    if (this.phoneService.hasPhoneNumber()) {
      return true;
    }

    return this.modalService.open(PhoneDialogComponent).pipe(
      map(result => {
        if (result) {
          this.phoneService.savePhoneNumber(result);
          return true;
        }
        this.router.navigate(['/']);
        return false;
      })
    );
  }
}
