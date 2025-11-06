import { Request, Response } from 'express';
import axios from 'axios';

export const getAllPropertyData = async (req: Request, res: Response): Promise<void> => {
  try {
    const apiUrl = `https://sbuilding.bo.ge/api/property`; // Fetch all data at once

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

    // Sort all apartments by name
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
