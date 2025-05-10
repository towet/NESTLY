// functions/src/middleware/rateLimiter.ts

import * as functions from 'firebase-functions';
import { getFirestore } from 'firebase-admin/firestore';

export const rateLimiter = async (ip: string, limit: number, windowMs: number) => {
  const db = getFirestore();
  const now = Date.now();
  const windowStart = now - windowMs;
  
  const doc = db.collection('rateLimits').doc(ip);
  
  try {
    const result = await db.runTransaction(async (transaction) => {
      const docSnap = await transaction.get(doc);
      const data = docSnap.data() || { requests: [], lastReset: now };
      
      // Clean old requests
      data.requests = data.requests.filter((timestamp: number) => timestamp > windowStart);
      
      if (data.requests.length >= limit) {
        throw new functions.https.HttpsError(
          'resource-exhausted',
          'Too many requests, please try again later.'
        );
      }
      
      data.requests.push(now);
      transaction.set(doc, data);
      
      return data;
    });
    
    return result;
  } catch (error) {
    throw error;
  }
};
