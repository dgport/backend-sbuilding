import { Router } from 'express';
import { getExchangeRate } from '../../controllers/currency/currencyController';

const currency = Router();

currency.get('/currency/rate', getExchangeRate);

export default currency;
