import { Request, Response } from 'express';
import axios from 'axios';

// IMPORTANT: Remove the global cookieStore map entirely:
// const cookieStore = new Map<string, string>();

export const getPropertyData = async (req: Request, res: Response): Promise<void> => {
  let { buildingId, floorId } = req.params;

  // ... (Input validation logic remains the same) ...

  try {
    // 1. Determine IDs (Logic remains the same)
    if (!floorId && buildingId) {
      floorId = buildingId;
      buildingId = 'undefined';
    }

    if (!floorId || isNaN(Number(floorId))) {
      res.status(400).json({ success: false, message: 'Invalid floor ID' });
      return;
    }

    const apiUrl = `https://sbuilding.bo.ge/api/property/${buildingId}/${floorId}`;

    // 2. Prepare Headers
    const headers: Record<string, string> = {
      authtoken: process.env.CRM_API_TOKEN || 'token',
      Accept: '*/*',
      'User-Agent': 'Thunder Client',
    };

    // 3. 🍪 CRITICAL: Pass the cookies the client sent to your Express server
    //    The browser must first receive a Set-Cookie and send it back on follow-up calls.
    const clientCookies = req.headers.cookie;
    if (clientCookies) {
      // Pass client's cookies to the external API call
      headers['Cookie'] = clientCookies;
      console.log('🍪 Forwarding Client Cookies to External API');
    }

    // 4. Axios Call
    const response = await axios.get(apiUrl, {
      headers,
      validateStatus: () => true,
      timeout: 10000,
      // Setting a generic 'Accept-Encoding' can sometimes help with Cloudflare
      // but decompress: true might be enough. Let's rely on the Thunder Client UA.
    });

    // 5. 🍪 CRITICAL: Forward the 'set-cookie' header back to the client
    const setCookieHeaders = response.headers['set-cookie'];
    if (setCookieHeaders && Array.isArray(setCookieHeaders)) {
      // The client (browser) will now store these cookies for future requests
      res.setHeader('set-cookie', setCookieHeaders);
      console.log('✅ Forwarding Set-Cookie headers to Client');
    }

    if (response.status !== 200) {
      console.error('❌ API Error Response:', response.data);
      // Ensure the client gets the non-200 status
      res.status(response.status).json({
        success: false,
        message: `External API returned status: ${response.status}`,
        data: response.data, // Optionally pass the error data back
      });
      return;
    }

    // 6. Data Processing and Sorting (Logic remains the same)
    const data = response.data;
    let apartments = data.apartments || data;
    // ... (rest of data normalization and sorting logic) ...

    // 7. Return Formatted Response
    res.status(200).json({
      success: true,
      data: {
        apartments,
        paths: data.paths || [],
      },
    });
  } catch (error) {
    // ... (Error handling remains the same) ...
  }
};
