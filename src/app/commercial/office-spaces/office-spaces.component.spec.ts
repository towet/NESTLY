import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OfficeSpacesComponent } from './office-spaces.component';

describe('OfficeSpacesComponent', () => {
  let component: OfficeSpacesComponent;
  let fixture: ComponentFixture<OfficeSpacesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [OfficeSpacesComponent]
    });
    fixture = TestBed.createComponent(OfficeSpacesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
