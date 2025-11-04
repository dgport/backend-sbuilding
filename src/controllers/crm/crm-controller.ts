import { Request, Response } from 'express';
import axios from 'axios';

export const getPropertyData = async (req: Request, res: Response): Promise<void> => {
  let { buildingId, floorId } = req.params;

  if (!floorId && buildingId) {
    floorId = buildingId;
    buildingId = 'undefined';
  }

  try {
    if (!floorId || isNaN(Number(floorId))) {
      res.status(400).json({
        success: false,
        message: 'Invalid floor ID',
      });
      return;
    }

    const apiUrl = `https://sbuilding.bo.ge/api/property/${buildingId}/${floorId}`;

    const response = await axios.get(apiUrl, {
      headers: {
        authtoken: process.env.CRM_API_TOKEN || ' ',
      },
      timeout: 10000,
    });

    const data = response.data;

    let apartments = data.apartments || data;

    if (!Array.isArray(apartments)) {
      apartments = Object.values(apartments).filter(
        (item): item is any => typeof item === 'object' && item !== null
      );

      if (!Array.isArray(apartments) || apartments.length === 0) {
        apartments = [];
      }
    }

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
