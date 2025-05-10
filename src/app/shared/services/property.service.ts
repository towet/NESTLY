// services/property.service.ts
import { Injectable } from '@angular/core';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class PropertyService {
  constructor(private firestore: Firestore) {}

  async getPropertyById(id: string) {
    const propertyRef = doc(this.firestore, 'properties', id);
    const propertySnap = await getDoc(propertyRef);
    
    if (propertySnap.exists()) {
      return {
        id: propertySnap.id,
        ...propertySnap.data()
      };
    }
    
    return null;
  }
}
