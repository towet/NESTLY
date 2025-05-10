import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ContactSupportComponent } from './contact-support.component';

describe('ContactSupportComponent', () => {
  let component: ContactSupportComponent;
  let fixture: ComponentFixture<ContactSupportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactSupportComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ContactSupportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should reset form after submission', () => {
    component.name = 'Test';
    component.email = 'test@example.com';
    component.message = 'Need help!';
    component.onSubmit();
    expect(component.name).toEqual('');
    expect(component.email).toEqual('');
    expect(component.message).toEqual('');
  });
});
