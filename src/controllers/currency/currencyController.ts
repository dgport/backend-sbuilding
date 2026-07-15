import { Request, Response } from 'express';
import axios from 'axios';

const NBG_RATE_URL =
  'https://nbg.gov.ge/gw/api/ct/monetarypolicy/currencies/en/json?currencies=USD';
const CACHE_TTL_MS = 60 * 60 * 1000;
const FALLBACK_RATE = 2.7;

let cachedRate: { rate: number; date: string | null } | null = null;
let cachedAt = 0;

export const getExchangeRate = async (req: Request, res: Response): Promise<void> => {
  const now = Date.now();

  if (cachedRate && now - cachedAt < CACHE_TTL_MS) {
    res.status(200).json({
      success: true,
      base: 'USD',
      quote: 'GEL',
      rate: cachedRate.rate,
      date: cachedRate.date,
      cached: true,
    });
    return;
  }

  try {
    const response = await axios.get(NBG_RATE_URL, { timeout: 8000 });
    const entry = response.data?.[0]?.currencies?.[0];
    const rate = Number(entry?.rate);

    if (!rate || Number.isNaN(rate)) {
      throw new Error('Invalid rate payload from NBG');
    }

    cachedRate = { rate, date: entry.validFromDate || entry.date || null };
    cachedAt = now;

    res.status(200).json({
      success: true,
      base: 'USD',
      quote: 'GEL',
      rate,
      date: cachedRate.date,
      cached: false,
    });
  } catch (error) {
    console.error('❌ Error fetching NBG exchange rate:', error);

    if (cachedRate) {
      res.status(200).json({
        success: true,
        base: 'USD',
        quote: 'GEL',
        rate: cachedRate.rate,
        date: cachedRate.date,
        cached: true,
        stale: true,
      });
      return;
    }

    res.status(200).json({
      success: true,
      base: 'USD',
      quote: 'GEL',
      rate: FALLBACK_RATE,
      date: null,
      cached: false,
      fallback: true,
    });
  }
};
