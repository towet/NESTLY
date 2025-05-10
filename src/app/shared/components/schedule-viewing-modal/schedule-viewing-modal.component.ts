import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DocumentReference } from '@angular/fire/firestore';

@Component({
  selector: 'app-schedule-viewing-modal',
  templateUrl: './schedule-viewing-modal.component.html',
  styleUrls: ['./schedule-viewing-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class ScheduleViewingModalComponent {
  @Input() propertyId!: string;
  @Input() agentId!: DocumentReference;

  scheduleForm: FormGroup;

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder
  ) {
    this.scheduleForm = this.fb.group({
      visitorName: ['', [Validators.required, Validators.minLength(2)]],
      visitorPhone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      scheduledDateTime: ['', [Validators.required]]
    });
  }

  // Method to close modal
  close(): void {
    this.activeModal.dismiss('cancel');
  }

  // Method to check if form field is invalid
  isFieldInvalid(fieldName: string): boolean {
    const field = this.scheduleForm.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }

  // Method to get error message
  getErrorMessage(fieldName: string): string {
    const control = this.scheduleForm.get(fieldName);
    if (control?.errors) {
      if (control.errors['required']) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
      }
      if (control.errors['minlength']) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least ${control.errors['minlength'].requiredLength} characters`;
      }
      if (control.errors['pattern']) {
        return 'Please enter a valid phone number';
      }
    }
    return '';
  }

  // Method to submit form
  submitForm(): void {
    if (this.scheduleForm.valid) {
      const formData = {
        ...this.scheduleForm.value,
        propertyId: this.propertyId,
        agentId: this.agentId,
        status: 'pending',
        createdAt: new Date()
      };
      
      this.activeModal.close(formData);
    } else {
      // Mark all fields as touched to trigger validation display
      Object.keys(this.scheduleForm.controls).forEach(key => {
        const control = this.scheduleForm.get(key);
        control?.markAsTouched();
      });
    }
  }

  // Method to check if date is in the past
  isPastDate(date: string): boolean {
    return new Date(date) < new Date();
  }

  // Lifecycle hook to set minimum date
  ngOnInit(): void {
    // Set minimum date to today
    const today = new Date();
    const minDate = today.toISOString().split('T')[0];
    
    const dateTimeInput = document.getElementById('scheduledDateTime') as HTMLInputElement;
    if (dateTimeInput) {
      dateTimeInput.min = `${minDate}T00:00`;
    }
  }
}
