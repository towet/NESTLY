// functions/src/location/placeDetails.ts

import { onRequest } from 'firebase-functions/v2/https';
import type { Request, Response } from 'express';
import { 
  Client, 
  PlaceDetailsRequest 
} from '@googlemaps/google-maps-services-js';

// Define error interface
interface GoogleApiError {
  response?: {
    status: number;
    data?: any;
  };
  code?: string;
  message: string;
  stack?: string;
}

const client = new Client({});

export const placeDetails = onRequest(
  { 
    timeoutSeconds: 30,
    memory: '256MiB',
    minInstances: 0
  }, 
  async (request: Request, response: Response) => {
    // Enable CORS
    response.set('Access-Control-Allow-Origin', '*');
    response.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    response.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Handle OPTIONS request for CORS
    if (request.method === 'OPTIONS') {
      response.status(204).send('');
      return;
    }

    // Ensure it's a GET request
    if (request.method !== 'GET') {
      response.status(405).json({
        error: 'Method Not Allowed',
        message: 'Only GET requests are allowed'
      });
      return;
    }

    try {
      // Get API key from environment
      const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

      // Check if API key is configured
      if (!GOOGLE_MAPS_API_KEY) {
        console.error('Google Maps API key is not configured');
        response.status(500).json({
          error: 'Server configuration error',
          message: 'API key not configured'
        });
        return;
      }

      const { placeId } = request.query;

      if (!placeId || typeof placeId !== 'string') {
        response.status(400).json({
          error: 'Invalid request',
          message: 'Place ID parameter is required and must be a string'
        });
        return;
      }

      const placeDetailsRequest: PlaceDetailsRequest = {
        params: {
          place_id: placeId,
          key: GOOGLE_MAPS_API_KEY,
          fields: ['geometry', 'formatted_address', 'name', 'address_components']
        }
      };

      const result = await client.placeDetails(placeDetailsRequest);
    
      // Handle different Google Places API status codes
      switch (result.data.status) {
        case 'OK':
          const details = {
            geometry: result.data.result.geometry,
            formattedAddress: result.data.result.formatted_address,
            name: result.data.result.name,
            addressComponents: result.data.result.address_components
          };
          response.json(details);
          break;

        case 'ZERO_RESULTS':
        case 'NOT_FOUND':
          response.status(404).json({
            error: 'Not Found',
            message: 'Place not found'
          });
          break;

        case 'REQUEST_DENIED':
          console.error('Google Maps API request denied:', result.data.error_message);
          response.status(401).json({
            error: 'API Error',
            message: 'Invalid API key or API key not authorized'
          });
          break;

        case 'INVALID_REQUEST':
          console.error('Invalid Google Maps API request:', result.data.error_message);
          response.status(400).json({
            error: 'Invalid Request',
            message: 'The request was malformed'
          });
          break;

        case 'OVER_QUERY_LIMIT':
          console.error('Google Maps API query limit exceeded');
          response.status(429).json({
            error: 'Rate Limit Exceeded',
            message: 'Please try again later'
          });
          break;

        default:
          throw new Error(`Unexpected Places API Error: ${result.data.status}`);
      }

    } catch (err: unknown) {
      const error = err as GoogleApiError;
      console.error('Place details error:', error);

      // Handle different types of errors
      if (error.response) {
        // Google Maps API returned an error response
        const status = error.response.status;
        switch (status) {
          case 401:
            response.status(401).json({
              error: 'Authentication Error',
              message: 'Invalid API key'
            });
            break;
          case 403:
            response.status(403).json({
              error: 'Authorization Error',
              message: 'API key not authorized for Places API'
            });
            break;
          case 429:
            response.status(429).json({
              error: 'Quota Exceeded',
              message: 'API quota exceeded, please try again later'
            });
            break;
          default:
            response.status(500).json({
              error: 'API Error',
              message: 'Error communicating with Google Places API'
            });
        }
      } else if (error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT') {
        // Network error
        response.status(503).json({
          error: 'Service Unavailable',
          message: 'Unable to reach Google Places API'
        });
      } else if (error.message && error.message.includes('API key')) {
        // API key configuration issues
        response.status(500).json({
          error: 'Configuration Error',
          message: 'API key configuration issue'
        });
      } else {
        // Unknown error
        response.status(500).json({
          error: 'Internal Server Error',
          message: 'An unexpected error occurred'
        });
      }

      // Log detailed error information (but don't send to client)
      console.error('Detailed error:', {
        message: error.message,
        stack: error.stack,
        code: error.code,
        response: error.response?.data
      });
    } finally {
      // Ensure the function terminates properly
      if (!response.headersSent) {
        response.status(500).json({
          error: 'Internal Server Error',
          message: 'An unexpected error occurred'
        });
      }
    }
});
