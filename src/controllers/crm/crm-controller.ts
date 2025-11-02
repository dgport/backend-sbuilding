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
    
    // ✨ USE EXACT SAME HEADERS AS THUNDER CLIENT ✨
    const headersList: Record<string, string> = {
      'Accept': '*/*',
      'User-Agent': 'Thunder Client (https://www.thunderclient.com)',
      'authtoken': process.env.CRM_API_TOKEN || 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiIiwibmFtZSI6IiIsIkFQSV9USU1FIjoxNzYwNjg1NjgyfQ.swqoWN2XKnrVdEEqd0pX-ZArktmwUYTH8B5YhH5zF8Y'
    };

    // Add stored cookies if they exist
    const storedCookies = cookieStore.get(cookieKey);
    if (storedCookies) {
      headersList['Cookie'] = storedCookies;
    }

    console.log('🔍 Request URL:', apiUrl);
    console.log('🔑 Auth Token:', headersList.authtoken ? 'Set' : 'Not Set');
    console.log('🍪 Stored Cookies:', storedCookies ? 'Yes' : 'No');

    // Use exact same request options as Thunder Client
    let reqOptions = {
      url: apiUrl,
      method: 'GET' as const,
      headers: headersList,
      validateStatus: () => true,
      timeout: 10000,
    };

    let response = await axios.request(reqOptions);

    console.log('📊 Response Status (first attempt):', response.status);
    console.log('🍪 Response Cookies:', response.headers['set-cookie'] || 'None');
    
    // If 403 on first try, extract cookies and retry
    if (response.status === 403 && response.headers['set-cookie']) {
      console.log('🔄 Got 403 but received cookies, retrying with cookies...');
      
      const setCookieHeaders = response.headers['set-cookie'];
      if (setCookieHeaders && Array.isArray(setCookieHeaders)) {
        const cookies = setCookieHeaders
          .map((cookie: string) => cookie.split(';')[0].trim())
          .join('; ');
        
        cookieStore.set(cookieKey, cookies);
        headersList['Cookie'] = cookies;
        
        // Retry with cookies
        reqOptions = {
          url: apiUrl,
          method: 'GET' as const,
          headers: headersList,
          validateStatus: () => true,
          timeout: 10000,
        };
        
        response = await axios.request(reqOptions);
        console.log('📊 Response Status (second attempt with cookies):', response.status);
      }
    }

    // Extract and store cookies from successful response
    const setCookieHeaders = response.headers['set-cookie'];
    if (setCookieHeaders && Array.isArray(setCookieHeaders)) {
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