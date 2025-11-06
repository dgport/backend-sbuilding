import { Request, Response } from 'express';
import axios from 'axios';

export const submitLead = async (req: Request, res: Response): Promise<void> => {
  try {
    const leadData = req.body;

    if (!leadData.name) {
      res.status(400).json({
        success: false,
        message: 'Name is required',
      });
      return;
    }

    const apiUrl = 'https://sbuilding.bo.ge/api/leads';

    const payload: any = {
      name: leadData.name,
      email: leadData.email || ' ',
      phonenumber: leadData.phone,
      source: '3',
      status: '19',
      assigned: '1',
    };

    if (leadData.apartment_name) {
      payload.custom_fields = [
        {
          field: 'ბინის ნომერი',
          value: leadData.apartment_name,
        },
      ];
    }

    const response = await axios.post(apiUrl, payload, {
      headers: {
        authtoken: process.env.CRM_API_TOKEN || '',
      },
      timeout: 10000,
    });

    res.status(200).json({
      success: true,
      message: 'Lead submitted successfully',
      data: response.data,
    });
  } catch (error) {
    console.error('❌ Error submitting lead:', error);

    if (axios.isAxiosError(error)) {
      const errorData = error.response?.data;
      res.status(error.response?.status || 500).json({
        success: false,
        message: errorData?.message || 'Failed to submit lead',
        error: errorData?.error || error.message,
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to submit lead',
        error: (error as Error).message || 'Unknown error',
      });
    }
  }
};

export const getAllApartments = async (req: Request, res: Response): Promise<void> => {
  try {
    const apiUrl = 'https://sbuilding.bo.ge/api/apartments'; // or whatever the endpoint is

    const response = await axios.get(apiUrl, {
      headers: {
        authtoken: process.env.CRM_API_TOKEN || '',
      },
      timeout: 15000, // Increased timeout for larger dataset
    });

    // Filter and validate apartments
    const apartments = (response.data.apartments || response.data || []).filter(
      (item: any) =>
        item &&
        typeof item === 'object' &&
        !Array.isArray(item) &&
        item.id &&
        item.name &&
        item.floor // Make sure floor exists
    );

    res.status(200).json({
      success: true,
      message: 'Apartments fetched successfully',
      data: {
        apartments,
        total: apartments.length,
      },
    });
  } catch (error) {
    console.error('❌ Error fetching apartments:', error);

    if (axios.isAxiosError(error)) {
      const errorData = error.response?.data;
      res.status(error.response?.status || 500).json({
        success: false,
        message: errorData?.message || 'Failed to fetch apartments',
        error: errorData?.error || error.message,
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch apartments',
        error: (error as Error).message || 'Unknown error',
      });
    }
  }
};
