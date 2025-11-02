import { Request, Response } from 'express';
import axios from 'axios';

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

    // 2. ✨ REFINED HEADERS FOR BOT EVASION AND AUTHENTICATION ✨
    const headers: Record<string, string> = {
      // Use the authtoken from your environment variable (or a fallback)
      authtoken: (req.headers.authtoken as string) || process.env.CRM_API_TOKEN || 'token',

      // Use a specific Thunder Client UA or a highly realistic Chrome UA
      // We'll use a realistic Chrome UA to minimize Cloudflare's bot-list blocking:
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',

      // Required headers from your working example:
      Accept: '*/*',
      // Note: Sending Content-Type for a GET request is unusual,
      // but since Thunder Client sends it and works, let's include it.
      'Content-Type': 'application/json',

      // Additional browser-like headers to fool Cloudflare:
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      Connection: 'keep-alive',
    };

    // 3. 🍪 CRITICAL: Pass the cookies the client sent to your Express server
    const clientCookies = req.headers.cookie;
    if (clientCookies) {
      headers['Cookie'] = clientCookies;
      console.log('🍪 Forwarding Client Cookies to External API');
    }

    // 4. Axios Call
    // Note: For a GET request, Axios will ignore the 'body' property.
    // We do NOT include the bodyContent here as the working request was GET.
    const response = await axios.get(apiUrl, {
      headers,
      validateStatus: () => true,
      timeout: 10000,
    });

    // ... (The rest of the cookie forwarding and response handling logic remains the same) ...

    // 5. 🍪 CRITICAL: Forward the 'set-cookie' header back to the client
    const setCookieHeaders = response.headers['set-cookie'];
    if (setCookieHeaders && Array.isArray(setCookieHeaders)) {
      res.setHeader('set-cookie', setCookieHeaders);
      console.log('✅ Forwarding Set-Cookie headers to Client');
    }

    if (response.status !== 200) {
      console.error('❌ API Error Response:', response.data);
      res.status(response.status).json({
        success: false,
        message: `External API returned status: ${response.status}`,
        data: response.data,
      });
      return;
    }

    // 6. Data Processing and Sorting (Logic remains the same)
    const data = response.data;
    let apartments = data.apartments || data;
    // ... (data normalization and sorting logic) ...

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
