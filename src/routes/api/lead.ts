import { Router } from 'express';
import { submitLead } from '../../controllers/crm/leadController';

const lead = Router();

lead.post('/leads', submitLead);

export default lead;
