import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-firebase-test',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="firebase-test-container">
      <h2>Firebase Users Collection Test</h2>
      <ng-container *ngIf="users; else loading">
        <pre>{{ users | json }}</pre>
      </ng-container>
      <ng-template #loading>
        <p>Loading data from Firebase...</p>
      </ng-template>
    </div>
  `,
  styles: [`
    .firebase-test-container {
      padding: 2rem;
      background-color: #f8f8f8;
      border-radius: 8px;
      max-width: 600px;
      margin: 2rem auto;
    }
    pre {
      background: #fff;
      padding: 1rem;
      border: 1px solid #ccc;
      border-radius: 4px;
    }
  `]
})
export class FirebaseTestComponent implements OnInit, OnDestroy {
  users: any[] = [];  // Holds the fetched data
  private subscription!: Subscription;

  constructor(private firestore: Firestore) {}

  ngOnInit() {
    // Create a reference to the 'users' collection.
    // (Make sure your Firestore rules allow reading this collection.)
    const usersCollection = collection(this.firestore, 'users');
    
    // Subscribe to the collection data without additional query constraints.
    this.subscription = collectionData(usersCollection, { idField: 'id' }).subscribe(data => {
      console.log('Users data:', data);
      this.users = data;
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
