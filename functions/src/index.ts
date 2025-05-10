// functions/src/index.ts

import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { locationSuggestions, placeDetails } from './location';
import { onRequest } from 'firebase-functions/v2/https';
import corsModule from 'cors'; 
import fetch from 'node-fetch';
import * as nodemailer from 'nodemailer';

interface GooglePlacesResponse {
  status: string;
  results: GooglePlace[];
  next_page_token?: string;
}

interface GooglePlace {
  place_id: string;
  name: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  vicinity: string;
  rating?: number;
  user_ratings_total?: number;
  types: string[];
  opening_hours?: {
    open_now: boolean;
  };
  photos?: Array<{
    photo_reference: string;
    width: number;
    height: number;
  }>;
}


const corsHandler = corsModule({ origin: true });

// Initialize Firebase Admin
admin.initializeApp();

// Export the functions
export {
  locationSuggestions,
  placeDetails
};

interface SearchNotificationData {
  searcherPhone: string;
  searchQuery: any;
  propertyIds: string[];
}

interface PropertyInfo {
  id: string;
  title: string;
  agentId: string;
}

export const sendSearchNotifications = functions.https.onCall(
  async (request, context) => {
    try {
      /* ------------------------------------------------------------------ */
      /* 1. unpack request                                                  */
      /* ------------------------------------------------------------------ */
      const data = request.data as SearchNotificationData;
      const { searcherPhone, searchQuery, propertyIds } = data;

      /* ------------------------------------------------------------------ */
      /* 2. look up the matching listings and bucket them by agent          */
      /* ------------------------------------------------------------------ */
      const listingsSnap = await admin
        .firestore()
        .collection('listings')
        .where(admin.firestore.FieldPath.documentId(), 'in', propertyIds)
        .get();

      // agentId  -> array of {id,title}
      const agentMap = new Map<string, PropertyInfo[]>();

      listingsSnap.forEach(doc => {
        const d = doc.data();
        const agentRef = d.agentId as admin.firestore.DocumentReference | undefined;
        if (!agentRef) return;

        const agentId = agentRef.id;          // <-- keep as reference id
        if (!agentMap.has(agentId)) agentMap.set(agentId, []);
        agentMap.get(agentId)!.push({
          id: doc.id,
          title: d.title || 'Untitled Property',
          agentId
        });
      });

      /* ------------------------------------------------------------------ */
      /* 3. resolve agentId -> userId and FCM token                         */
      /* ------------------------------------------------------------------ */
      const agentIds = Array.from(agentMap.keys());
      const agentsSnap = await admin
        .firestore()
        .collection('agents')
        .where(admin.firestore.FieldPath.documentId(), 'in', agentIds)
        .get();

      const agentUserMap = new Map<string, string>(); // agentId -> userId
      agentsSnap.forEach(a => {
        const userId = a.data().userId;
        if (userId) agentUserMap.set(a.id, userId);
      });

      const userIds = Array.from(agentUserMap.values());
      const usersSnap = await admin
        .firestore()
        .collection('users')
        .where(admin.firestore.FieldPath.documentId(), 'in', userIds)
        .get();

      /* ------------------------------------------------------------------ */
      /* 4. send FCM + write one Firestore doc **per agent**                */
      /* ------------------------------------------------------------------ */
      const messaging = admin.messaging();
      const notifColl = admin.firestore().collection('searchNotifications');

      let successCount = 0, failureCount = 0;

      for (const [agentId, props] of agentMap) {
        const userId   = agentUserMap.get(agentId);
        const userDoc  = usersSnap.docs.find(d => d.id === userId);
        const fcmToken = userDoc?.data().fcmToken;

        // ─── Create / send FCM only if we have a token ───────────────────
        if (fcmToken) {
          const titleStr  = props.map(p => p.title).join(', ');
          const bodyLines = [
            'Someone is interested in your properties:',
            '',
            ...props.map(p => `• ${p.title}`),
            '',
            `Contact: ${searcherPhone}`
          ];

          const msg: admin.messaging.Message = {
            token: fcmToken,
            notification: {
              title: 'New Property Search',
              body : `Someone is interested in your property: ${titleStr}`
            },
            data: {
              type          : 'PROPERTY_SEARCH',
              searchQuery   : JSON.stringify(searchQuery),
              searcherPhone : searcherPhone,
              propertyIds   : JSON.stringify(props.map(p => p.id)),
              propertyTitles: JSON.stringify(props.map(p => p.title)),
              timestamp     : new Date().toISOString()
            },
            android: {
              priority: 'high',
              notification: {
                channelId: 'property_searches',
                title    : 'New Property Search',
                body     : bodyLines.join('\n')
              }
            }
          };

          try {
            await messaging.send(msg);
            successCount++;
          } catch (err) {
            console.error('FCM error', err);
            failureCount++;
          }
        }

        // ─── Write ONE notification document for this agent ──────────────
        await notifColl.add({
          agentId      : agentId,                     // <─── new field!
          propertyIds  : props.map(p => p.id),        // still nice to keep
          propertyTitles: props.map(p => p.title),
          searchQuery,
          searcherPhone,
          timestamp    : admin.firestore.FieldValue.serverTimestamp(),
          read         : false                        // easy “badge” feature
        });
      }

      /* ------------------------------------------------------------------ */
      return { success: true, successCount, failureCount };
    } catch (err) {
      console.error(err);
      throw new functions.https.HttpsError('internal', 'Failed to notify');
    }
  }
);

export const nearbySearch = functions.https.onRequest((request, response) => {
  // Handle CORS
  corsHandler(request, response, async () => {
    try {
      // Check request method
      if (request.method === 'OPTIONS') {
        response.status(204).send('');
        return;
      }

      if (request.method !== 'GET' && request.method !== 'POST') {
        response.status(405).json({
          error: 'Method not allowed. Use GET or POST.'
        });
        return;
      }

      // Extract parameters
      const params = request.method === 'GET' ? request.query : request.body;
      
      const { lat, lng, amenityType } = params;

      // Validate required parameters
      if (!lat || !lng || !amenityType) {
        response.status(400).json({
          error: 'Missing required parameters. Please provide lat, lng, and amenityType.'
        });
        return;
      }

      // Configure search parameters
      const radius = 5000; // 5km radius
      const apiKey = functions.config().google.places_api_key;

      // Construct Google Places API URL
      const googleApiUrl = new URL('https://maps.googleapis.com/maps/api/place/nearbysearch/json');
      googleApiUrl.searchParams.append('location', `${lat},${lng}`);
      googleApiUrl.searchParams.append('radius', radius.toString());
      googleApiUrl.searchParams.append('type', amenityType);
      googleApiUrl.searchParams.append('key', apiKey);

      // Make request to Google Places API
      const googleResponse = await fetch(googleApiUrl.toString());
      const data = await googleResponse.json() as GooglePlacesResponse;

      // Check if the API request was successful
      if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
        throw new Error(`Google Places API Error: ${data.status}`);
      }

      // Process and format the response
      const formattedResults = data.results.map((place) => ({
        id: place.place_id,
        name: place.name,
        location: {
          lat: place.geometry.location.lat,
          lng: place.geometry.location.lng
        },
        address: place.vicinity,
        rating: place.rating,
        userRatingsTotal: place.user_ratings_total,
        types: place.types,
        openNow: place.opening_hours?.open_now,
        photos: place.photos?.map((photo) => ({
          reference: photo.photo_reference,
          width: photo.width,
          height: photo.height
        }))
      }));

      // Send successful response
      response.json({
        status: 'success',
        results: formattedResults,
        pagination: {
          nextPageToken: data.next_page_token || null
        }
      });

    } catch (error) {
      console.error('Error in nearbySearch function:', error);
      response.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  });
});

interface SupportRequest {
  name: string;
  email: string;
  message: string;
}


export const sendSupportEmail = onRequest(
  { 
    cors: true,
    maxInstances: 10,
    timeoutSeconds: 30,
    memory: '256MiB'
  }, 
  async (req, res) => {
    if (req.method !== 'POST') {
      res.status(405).send('Method Not Allowed');
      return;
    }

    try {
      const { name, email, message }: SupportRequest = req.body;

      // Input validation
      if (!name?.trim() || !email?.trim() || !message?.trim()) {
        res.status(400).json({ 
          error: 'Missing required fields',
          details: 'Name, email, and message are required' 
        });
        return;
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        res.status(400).json({ 
          error: 'Invalid email format' 
        });
        return;
      }

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_APP_PASSWORD
        }
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.SUPPORT_EMAIL,
        subject: `New Support Request from ${name}`,
        text: `
Name: ${name}
Email: ${email}
Message: ${message}
        `,
        html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #333;">New Support Request</h2>
  <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px;">
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Message:</strong></p>
    <p style="white-space: pre-wrap;">${message}</p>
  </div>
</div>
        `
      };

      await transporter.sendMail(mailOptions);
      
      res.status(200).json({ 
        message: 'Email sent successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error sending email:', error);
      res.status(500).json({ 
        error: 'Failed to send email',
        message: 'An internal error occurred while processing your request'
      });
    }
});