// src/app/shared/services/phone.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PhoneService {
  private readonly PHONE_KEY = 'user_phone_number';

  hasPhoneNumber(): boolean {
    return !!localStorage.getItem(this.PHONE_KEY);
  }

  savePhoneNumber(phone: string): void {
    localStorage.setItem(this.PHONE_KEY, phone);
  }

  getPhoneNumber(): string | null {
    return localStorage.getItem(this.PHONE_KEY);
  }

  clearPhoneNumber(): void {
    localStorage.removeItem(this.PHONE_KEY);
  }
}
