import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DateRange } from '../booking-calendar/booking-calendar.component';

export interface AvailabilityRequest {
  startDate: Date;
  endDate: Date;
  guests: {
    adults: number;
    children: number;
    infants: number;
  };
}

export interface AvailabilityResponse {
  available: boolean;
  pricing?: {
    basePrice: number;
    cleaningFee: number;
    serviceFee: number;
    total: number;
    perNight: number;
  };
  restrictions?: {
    minimumStay: number;
    maximumStay: number;
    maximumGuests: number;
  };
}

@Component({
  selector: 'app-availability-checker',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './availability-checker.component.html',
  styleUrls: ['./availability-checker.component.scss']
})
export class AvailabilityCheckerComponent implements OnInit {
  @Input() propertyId!: string;
  @Input() maxGuests: number = 10;
  @Input() allowChildren: boolean = true;
  @Input() allowInfants: boolean = true;

  @Output() checkAvailability = new EventEmitter<AvailabilityRequest>();
  @Output() dateRangeSelected = new EventEmitter<DateRange>();

  form: FormGroup;
  isChecking: boolean = false;
  availabilityResult: AvailabilityResponse | null = null;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      dates: this.fb.group({
        startDate: ['', Validators.required],
        endDate: ['', Validators.required]
      }),
      guests: this.fb.group({
        adults: [1, [Validators.required, Validators.min(1), Validators.max(this.maxGuests)]],
        children: [0, [Validators.min(0), Validators.max(this.maxGuests)]],
        infants: [0, [Validators.min(0), Validators.max(4)]]
      })
    });
  }

  ngOnInit() {}

  onDateRangeChange(range: DateRange) {
    this.form.patchValue({
      dates: {
        startDate: range.startDate,
        endDate: range.endDate
      }
    });
    this.dateRangeSelected.emit(range);
  }

  updateGuests(type: 'adults' | 'children' | 'infants', increment: boolean) {
    const control = this.form.get(`guests.${type}`);
    if (control) {
      const currentValue = control.value;
      const newValue = increment ? currentValue + 1 : currentValue - 1;
      
      if (this.isValidGuestCount(type, newValue)) {
        control.setValue(newValue);
      }
    }
  }

  private isValidGuestCount(type: string, value: number): boolean {
    if (value < 0) return false;
    
    if (type === 'adults') {
      return value >= 1 && value <= this.maxGuests;
    } else if (type === 'children') {
      return value >= 0 && value <= this.maxGuests;
    } else if (type === 'infants') {
      return value >= 0 && value <= 4;
    }
    
    return false;
  }

  getTotalGuests(): number {
    const guests = this.form.get('guests')?.value;
    return (guests.adults || 0) + (guests.children || 0);
  }

  onSubmit() {
    if (this.form.valid) {
      this.isChecking = true;
      const request: AvailabilityRequest = this.form.value;
      this.checkAvailability.emit(request);
    }
  }

  resetForm() {
    this.form.reset({
      guests: {
        adults: 1,
        children: 0,
        infants: 0
      }
    });
    this.availabilityResult = null;
  }
}
