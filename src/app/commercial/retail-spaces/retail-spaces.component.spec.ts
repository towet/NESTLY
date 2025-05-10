import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RetailSpacesComponent } from './retail-spaces.component';

describe('RetailSpacesComponent', () => {
  let component: RetailSpacesComponent;
  let fixture: ComponentFixture<RetailSpacesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RetailSpacesComponent]
    });
    fixture = TestBed.createComponent(RetailSpacesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
