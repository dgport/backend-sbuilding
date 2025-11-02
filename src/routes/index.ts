import { Router } from 'express';

import getCrmData from './api/crm';

const router = Router();

router.use(getCrmData);

export default router;
