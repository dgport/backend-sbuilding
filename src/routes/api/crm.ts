import { Router } from 'express';
import { getAllPropertyData } from '../../controllers/crm/crm-controller';

 

const getCrmData = Router();

getCrmData.get('/property', getAllPropertyData);

export default getCrmData;
