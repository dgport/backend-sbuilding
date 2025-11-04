import { Router } from 'express';

import getCrmData from './api/crm';
import lead from './api/lead';

const router = Router();

router.use(getCrmData);
router.use(lead);

export default router;
