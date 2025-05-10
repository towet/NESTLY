import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduleViewingModalComponent } from './schedule-viewing-modal.component';

describe('ScheduleViewingModalComponent', () => {
  let component: ScheduleViewingModalComponent;
  let fixture: ComponentFixture<ScheduleViewingModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ScheduleViewingModalComponent]
    });
    fixture = TestBed.createComponent(ScheduleViewingModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
