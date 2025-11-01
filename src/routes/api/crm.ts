import { Router } from 'express';

import { getPropertyData } from '../../controllers/crm/crm-controller';

const getCrmData = Router();

getCrmData.get('/property/:buildingId?/:floorId?', getPropertyData);

export default getCrmData;
