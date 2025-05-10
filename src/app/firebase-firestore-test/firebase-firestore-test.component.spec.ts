import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FirebaseFirestoreTestComponent } from './firebase-firestore-test.component';

describe('FirebaseFirestoreTestComponent', () => {
  let component: FirebaseFirestoreTestComponent;
  let fixture: ComponentFixture<FirebaseFirestoreTestComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FirebaseFirestoreTestComponent]
    });
    fixture = TestBed.createComponent(FirebaseFirestoreTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
