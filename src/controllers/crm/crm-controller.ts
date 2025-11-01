import { Request, Response } from 'express';

export const getPropertyData = async (req: Request, res: Response): Promise<void> => {
  let { buildingId, floorId } = req.params; // Logic to handle optional floorId in URL structure

  if (!floorId && buildingId) {
    floorId = buildingId;
    buildingId = 'undefined';
  }

  try {
    // Validation for floor ID
    if (!floorId || isNaN(Number(floorId))) {
      res.status(400).json({
        success: false,
        message: 'Invalid floor ID',
      });
      return;
    }

    const apiUrl = `https://sbuilding.bo.ge/api/property/${buildingId}/${floorId}`;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }; // MODIFIED: Using the custom 'authtoken' header with the raw token value, as required by the API.

    if (process.env.CRM_API_TOKEN) {
      headers.authtoken = process.env.CRM_API_TOKEN;
    }

    const response = await fetch(apiUrl, { headers });

    if (!response.ok) {
      // Throw an error with the status and URL for improved debugging
      throw new Error(`External API returned status: ${response.status} for URL: ${apiUrl}`);
    }

    const data = await response.json();

    let apartments = data.apartments || data; // Logic to normalize apartment data structure

    if (!Array.isArray(apartments)) {
      apartments = Object.values(apartments).filter(
        (item): item is any => typeof item === 'object' && item !== null
      );

      if (!Array.isArray(apartments) || apartments.length === 0) {
        apartments = [];
      }
    } // Sorting apartments numerically by name

    if (apartments.length > 0) {
      apartments.sort((a: any, b: any) => {
        const numA = parseInt(a.name?.replace(/[^\d]/g, '') || '0', 10);
        const numB = parseInt(b.name?.replace(/[^\d]/g, '') || '0', 10);
        return numA - numB;
      });
    }

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
