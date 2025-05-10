import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FaqComponent } from './faq.component';

describe('FaqComponent', () => {
  let component: FaqComponent;
  let fixture: ComponentFixture<FaqComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FaqComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FaqComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the FAQ component', () => {
    expect(component).toBeTruthy();
  });

  it('should display FAQs', () => {
    expect(component.faqs.length).toBeGreaterThan(0);
  });
});
