import { Router } from 'express';

import getCrmData from './api/crm';
import lead from './api/lead';
import currency from './api/currency';

const router = Router();

router.use(getCrmData);
router.use(lead);
router.use(currency);

export default router;
