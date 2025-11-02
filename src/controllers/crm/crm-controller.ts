import { Request, Response } from 'express';

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

    const response = await fetch(apiUrl, {
      headers: {
        authtoken: process.env.CRM_API_TOKEN || 'token',
        'Content-Type': 'application/json',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        Referer: 'https://sbuilding.ge/',
        Origin: 'https://sbuilding.ge',
      },
    });

    if (!response.ok) {
      throw new Error(`External API returned status: ${response.status}`);
    }

    const data = await response.json();

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
