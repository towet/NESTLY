import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VacationHomesComponent } from './vacation-homes.component';

describe('VacationHomesComponent', () => {
  let component: VacationHomesComponent;
  let fixture: ComponentFixture<VacationHomesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VacationHomesComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VacationHomesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the VacationHomes component', () => {
    expect(component).toBeTruthy();
  });
});
