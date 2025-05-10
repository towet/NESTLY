import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface BookingDate {
  date: Date;
  isBooked: boolean;
  isBlocked?: boolean;
  price?: number;
  minimumStay?: number;
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

@Component({
  selector: 'app-booking-calendar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './booking-calendar.component.html',
  styleUrls: ['./booking-calendar.component.scss']
})
export class BookingCalendarComponent implements OnInit {
  @Input() availableDates: BookingDate[] = [];
  @Input() selectedRange: DateRange | null = null;
  @Input() minDate: Date = new Date();
  @Input() maxDate: Date | null = null;
  @Input() disabledDates: Date[] = [];
  @Input() showPrices: boolean = true;

  @Output() dateRangeSelected = new EventEmitter<DateRange>();
  @Output() monthChanged = new EventEmitter<Date>();

  currentMonth: Date = new Date();
  weeks: Date[][] = [];
  monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  selectionStart: Date | null = null;
  hoverDate: Date | null = null;

  constructor() {}

  ngOnInit() {
    this.generateCalendar();
  }

  generateCalendar() {
    const firstDay = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth(), 1);
    const lastDay = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 0);
    
    let currentDate = new Date(firstDay);
    currentDate.setDate(currentDate.getDate() - currentDate.getDay());

    this.weeks = [];
    let currentWeek: Date[] = [];

    while (currentDate <= lastDay || currentWeek.length > 0) {
      if (currentWeek.length === 7) {
        this.weeks.push(currentWeek);
        currentWeek = [];
      }

      currentWeek.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);

      if (currentDate > lastDay && currentWeek.length < 7) {
        while (currentWeek.length < 7) {
          currentWeek.push(new Date(currentDate));
          currentDate.setDate(currentDate.getDate() + 1);
        }
        this.weeks.push(currentWeek);
        break;
      }
    }
  }

  isDateAvailable(date: Date): boolean {
    return this.availableDates.some(d => 
      d.date.getTime() === date.getTime() && !d.isBooked && !d.isBlocked
    );
  }

  isDateSelected(date: Date): boolean {
    if (!this.selectedRange) return false;
    return date >= this.selectedRange.startDate && date <= this.selectedRange.endDate;
  }

  isDateInHoverRange(date: Date): boolean {
    if (!this.selectionStart || !this.hoverDate) return false;
    return date >= this.selectionStart && date <= this.hoverDate;
  }

  getDatePrice(date: Date): number | undefined {
    const bookingDate = this.availableDates.find(d => 
      d.date.getTime() === date.getTime()
    );
    return bookingDate?.price;
  }

  onDateClick(date: Date) {
    if (!this.isDateAvailable(date)) return;

    if (!this.selectionStart) {
      this.selectionStart = date;
    } else {
      const startDate = new Date(Math.min(this.selectionStart.getTime(), date.getTime()));
      const endDate = new Date(Math.max(this.selectionStart.getTime(), date.getTime()));

      // Check if all dates in range are available
      const allDatesAvailable = this.areDatesInRangeAvailable(startDate, endDate);

      if (allDatesAvailable) {
        this.dateRangeSelected.emit({ startDate, endDate });
      }

      this.selectionStart = null;
    }
  }

  onDateHover(date: Date) {
    if (this.selectionStart) {
      this.hoverDate = date;
    }
  }

  private areDatesInRangeAvailable(startDate: Date, endDate: Date): boolean {
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      if (!this.isDateAvailable(currentDate)) {
        return false;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return true;
  }

  nextMonth() {
    this.currentMonth.setMonth(this.currentMonth.getMonth() + 1);
    this.generateCalendar();
    this.monthChanged.emit(this.currentMonth);
  }

  previousMonth() {
    this.currentMonth.setMonth(this.currentMonth.getMonth() - 1);
    this.generateCalendar();
    this.monthChanged.emit(this.currentMonth);
  }

  canNavigatePrevious(): boolean {
    const firstDayOfMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth(), 1);
    return firstDayOfMonth >= this.minDate;
  }

  canNavigateNext(): boolean {
    if (!this.maxDate) return true;
    const lastDayOfMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 0);
    return lastDayOfMonth <= this.maxDate;
  }
}
