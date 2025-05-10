import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserGuideComponent } from './user-guide.component';

describe('UserGuideComponent', () => {
  let component: UserGuideComponent;
  let fixture: ComponentFixture<UserGuideComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserGuideComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserGuideComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the UserGuide component', () => {
    expect(component).toBeTruthy();
  });

  it('should have multiple guide steps', () => {
    expect(component.steps.length).toBeGreaterThan(0);
  });
});
