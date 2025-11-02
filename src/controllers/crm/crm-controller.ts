import { Request, Response } from 'express';
import axios from 'axios';

// Store cookies for each session
const cookieStore = new Map<string, string>();

export const getPropertyData = async (req: Request, res: Response): Promise<void> => {
  let { buildingId, floorId } = req.params;

  // If only one param is provided, treat it as floorId
  if (!floorId && buildingId) {
    floorId = buildingId;
    buildingId = 'undefined';
  }

  try {
    // Validate floorId
    if (!floorId || isNaN(Number(floorId))) {
      res.status(400).json({
        success: false,
        message: 'Invalid floor ID',
      });
      return;
    }

    // Call external API with proper format: /property/{buildingId}/{floorId}
    const apiUrl = `https://sbuilding.bo.ge/api/property/${buildingId}/${floorId}`;

    // Create a unique key for this API
    const cookieKey = `sbuilding_${buildingId}`;

    // Prepare headers
    const headers: Record<string, string> = {
      authtoken:
        process.env.CRM_API_TOKEN ||
        'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiIiwibmFtZSI6IiIsIkFQSV9USU1FIjoxNzYwNjg1NjgyfQ.swqoWN2XKnrVdEEqd0pX-ZArktmwUYTH8B5YhH5zF8Y',
      Accept: '*/*',
      'User-Agent': 'Thunder Client',
    };

    // Add stored cookies if they exist
    const storedCookies = cookieStore.get(cookieKey);
    if (storedCookies) {
      headers['Cookie'] = storedCookies;
    }

    console.log('🔍 Request URL:', apiUrl);
    console.log('🔑 Auth Token:', process.env.CRM_API_TOKEN ? 'Set' : 'Not Set');
    console.log('🍪 Stored Cookies:', storedCookies ? 'Yes' : 'No');

    const response = await axios.get(apiUrl, {
      headers,
      validateStatus: () => true,
      timeout: 10000,
      maxRedirects: 5,
      // Disable compression to avoid Cloudflare detection
      decompress: true,
    });

    console.log('📊 Response Status:', response.status);
    console.log('🍪 Response Cookies:', response.headers['set-cookie'] || 'None');

    // Extract and store cookies from response
    const setCookieHeaders = response.headers['set-cookie'];
    if (setCookieHeaders && Array.isArray(setCookieHeaders)) {
      // Parse and store cookies (extract only the cookie value, not the metadata)
      const cookies = setCookieHeaders
        .map((cookie: string) => cookie.split(';')[0].trim())
        .join('; ');

      cookieStore.set(cookieKey, cookies);
      console.log('✅ Cookies stored for future requests');
    }

    if (response.status !== 200) {
      console.error('❌ API Error Response:', response.data);
      throw new Error(`External API returned status: ${response.status}`);
    }

    const data = response.data;

    // Ensure apartments is an array
    let apartments = data.apartments || data;

    // Add type check and convert to array if needed
    if (!Array.isArray(apartments)) {
      // If it's an object, try to extract array from it or wrap it
      apartments = Object.values(apartments).filter(
        (item): item is any => typeof item === 'object' && item !== null
      );

      // If still not an array or empty, return empty array
      if (!Array.isArray(apartments) || apartments.length === 0) {
        apartments = [];
      }
    }

    // Sort apartments by numeric value in name (only if array is not empty)
    if (apartments.length > 0) {
      apartments.sort((a: any, b: any) => {
        const numA = parseInt(a.name?.replace(/[^\d]/g, '') || '0', 10);
        const numB = parseInt(b.name?.replace(/[^\d]/g, '') || '0', 10);
        return numA - numB;
      });
    }

    // Return formatted response
    res.status(200).json({
      success: true,
      data: {
        apartments,
        paths: data.paths || [],
      },
    });
  } catch (error) {
    console.error('Error fetching property data:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch property data',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
