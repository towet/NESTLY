import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AreaMapComponent } from './area-map.component';

describe('AreaMapComponent', () => {
  let component: AreaMapComponent;
  let fixture: ComponentFixture<AreaMapComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AreaMapComponent]
    });
    fixture = TestBed.createComponent(AreaMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
