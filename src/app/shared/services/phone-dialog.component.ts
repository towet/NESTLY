import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-phone-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
  <div class="modal-overlay">
  <div class="modal-content">
    <h2 class="modal-title">Verify Your Phone Number</h2>
    <div class="info-message">
      <div class="info-icon">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="icon">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <p class="info-text">
        For security reasons, we only display listings to verified users. 
        Please enter your phone number to verify your account.
      </p>
    </div>
    <form [formGroup]="phoneForm" (ngSubmit)="onSubmit()">
      <div class="form-group">
        <label for="phoneNumber" class="form-label">Phone Number</label>
        <div class="phone-input-container">
          <div class="country-code">
            <span class="country-flag">🇰🇪</span>
            <span class="code">+254</span>
          </div>
          <input
            id="phoneNumber"
            type="tel"
            formControlName="phoneNumber"
            placeholder="712345678"
            class="form-input phone-input"
            [class.error]="isFieldInvalid('phoneNumber')"
          >
        </div>
        <div class="error-messages" *ngIf="phoneForm.get('phoneNumber')?.touched">
          <div *ngIf="phoneForm.get('phoneNumber')?.errors?.['required']" class="error-text">
            Phone number is required
          </div>
          <div *ngIf="phoneForm.get('phoneNumber')?.errors?.['pattern']" class="error-text">
            Please enter a valid Kenyan phone number (e.g., 712345678)
          </div>
        </div>
      </div>
      <div class="button-group">
        <button type="button" class="btn-cancel" (click)="onCancel()">Cancel</button>
        <button type="submit" class="btn-submit" [disabled]="!phoneForm.valid || isSubmitting">
          {{ isSubmitting ? 'Verifying...' : 'Verify' }}
        </button>
      </div>
    </form>
  </div>
</div>
`,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }

    .modal-content {
      background-color: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      width: 90%;
      max-width: 400px;
      animation: slideIn 0.3s ease-out;
    }

    .info-message {
      background-color: #EBF5FF;
      border: 1px solid #BEE3F8;
      border-radius: 6px;
      padding: 1rem;
      margin-bottom: 1.5rem;
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
    }

    .info-icon {
      flex-shrink: 0;
      color: #3182CE;
    }

    .icon {
      width: 24px;
      height: 24px;
    }

    .info-text {
      color: #2C5282;
      font-size: 0.875rem;
      line-height: 1.5;
      margin: 0;
    }

    @keyframes slideIn {
      from {
        transform: translateY(-20px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    .modal-title {
      color: #2c3e50;
      font-size: 1.5rem;
      font-weight: 600;
      margin-bottom: 1rem;
      text-align: center;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-label {
      display: block;
      margin-bottom: 0.5rem;
      color: #4a5568;
      font-weight: 500;
    }

    .form-input {
      width: 100%;
      padding: 0.75rem;
      border: 2px solid #e2e8f0;
      border-radius: 6px;
      font-size: 1rem;
      transition: all 0.3s ease;
    }

    .form-input:focus {
      outline: none;
      border-color: #4299e1;
      box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
    }

    .form-input.error {
      border-color: #fc8181;
    }

    .error-messages {
      margin-top: 0.5rem;
    }

    .error-text {
      color: #e53e3e;
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }

    .button-group {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      margin-top: 2rem;
    }

    .btn-cancel, .btn-submit {
      padding: 0.75rem 1.5rem;
      border-radius: 6px;
      font-weight: 500;
      transition: all 0.3s ease;
      cursor: pointer;
    }

    .btn-cancel {
      background-color: #edf2f7;
      color: #4a5568;
      border: none;
    }

    .btn-cancel:hover {
      background-color: #e2e8f0;
    }

    .btn-submit {
      background-color: #4299e1;
      color: white;
      border: none;
    }

    .btn-submit:hover:not(:disabled) {
      background-color: #3182ce;
    }

    .btn-submit:disabled {
      background-color: #a0aec0;
      cursor: not-allowed;
    }
    .phone-input-container {
      display: flex;
      align-items: center;
      gap: 0;
      border: 2px solid #e2e8f0;
      border-radius: 6px;
      overflow: hidden;
    }

    .country-code {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 0.75rem;
      background-color: #f7fafc;
      border-right: 2px solid #e2e8f0;
      font-weight: 500;
      color: #4a5568;
    }

    .country-flag {
      font-size: 1.2rem;
    }

    .code {
      font-size: 0.9rem;
    }

    .phone-input {
      border: none !important;
      border-radius: 0 !important;
    }

    .phone-input:focus {
      box-shadow: none !important;
    }

    .phone-input-container:focus-within {
      border-color: #4299e1;
      box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
    }

    .phone-input-container.error {
      border-color: #fc8181;
    }
  `]
})

export class PhoneDialogComponent {
  phoneForm: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<PhoneDialogComponent>
  ) {
    this.phoneForm = this.fb.group({
      phoneNumber: ['', [
        Validators.required,
        Validators.pattern('^[7][0-9]{8}$')
      ]]
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.phoneForm.get(fieldName);
    return field ? (field.invalid && field.touched) : false;
  }

  onSubmit() {
    if (this.phoneForm.valid) {
      this.isSubmitting = true;
      const fullPhoneNumber = `+254${this.phoneForm.value.phoneNumber}`;
      // Simulate API call delay
      setTimeout(() => {
        this.dialogRef.close(fullPhoneNumber);
      }, 1000);
    } else {
      this.phoneForm.markAllAsTouched();
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
  formatPhoneNumber(event: any) {
    let phoneNumber = event.target.value.replace(/\D/g, '');
    if (phoneNumber.startsWith('254')) {
      phoneNumber = phoneNumber.substring(3);
    }
    if (phoneNumber.startsWith('0')) {
      phoneNumber = phoneNumber.substring(1);
    }
    this.phoneForm.patchValue({ phoneNumber }, { emitEvent: false });
  }
}
