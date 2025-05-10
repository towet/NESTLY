import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ServicedApartmentsComponent } from './serviced-apartments.component';

describe('ServicedApartmentsComponent', () => {
  let component: ServicedApartmentsComponent;
  let fixture: ComponentFixture<ServicedApartmentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServicedApartmentsComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ServicedApartmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the ServicedApartments component', () => {
    expect(component).toBeTruthy();
  });
});
