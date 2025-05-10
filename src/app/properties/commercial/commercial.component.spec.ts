import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommercialComponent } from './commercial.component';

describe('CommercialComponent', () => {
  let component: CommercialComponent;
  let fixture: ComponentFixture<CommercialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommercialComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CommercialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the Commercial component', () => {
    expect(component).toBeTruthy();
  });

  it('should load listings', () => {
    expect(component.listings.length).toBe(0);
    component.ngOnInit();
    // after 1s, listings should fill
  });
});
