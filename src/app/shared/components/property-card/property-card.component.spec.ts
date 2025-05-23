import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PropertyCardComponent } from './property-card.component';

describe('PropertyCardComponent', () => {
  let component: PropertyCardComponent;
  let fixture: ComponentFixture<PropertyCardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [PropertyCardComponent]
    });
    fixture = TestBed.createComponent(PropertyCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
