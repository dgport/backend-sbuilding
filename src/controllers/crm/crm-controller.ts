import { Request, Response } from 'express';
import cloudscraper from 'cloudscraper';

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

    const token = process.env.CRM_API_TOKEN;
    if (!token) {
      console.error('❌ CRM_API_TOKEN is not set!');
      res.status(500).json({
        success: false,
        message: 'API token not configured',
      });
      return;
    }

    // Call external API with proper format: /property/{buildingId}/{floorId}
    const apiUrl = `https://sbuilding.bo.ge/api/property/${buildingId}/${floorId}`;
    console.log('Calling external API:', apiUrl);

    // Use cloudscraper to bypass Cloudflare protection
    const data = await cloudscraper({
      uri: apiUrl,
      method: 'GET',
      headers: {
        authtoken: process.env.CRM_API_TOKEN || 'token',
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      json: true, // Automatically parse JSON response
    });

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
