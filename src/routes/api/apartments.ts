import { Request, Response, Router } from "express";
import {   getApartments  } from "../../controllers/apartments/GetApartments";
import { apartmentUpload } from "../../middlewares/upload-apartments";
import { AddApartments } from "../../controllers/apartments/AddApartments";
import { updateSharedProperties } from "../../controllers/apartments/UpdateProperties";
import { updateApartmentStatus } from "../../controllers/apartments/UpdatePropertyStatus";
 
 

const apartmentsRouter = Router();
 
apartmentsRouter.post(
    "/add_apartments",
    async (req: Request, res: Response) => {
      await AddApartments(req, res);
    }
  );


  apartmentsRouter.get(
    "/apartments/:building_id/:floor_plan_id?",
    async (req: Request, res: Response) => {
      await getApartments(req, res);
    }
  );

  apartmentsRouter.put(
    "/update_apartment_status",
  
    async (req: Request, res: Response) => {
      await updateApartmentStatus(req, res);
    }
  );
  


  apartmentsRouter.put(
    "/update_shared_properties",
    apartmentUpload, 
  
    async (req: Request, res: Response) => {
      await updateSharedProperties(req, res);
    }
  );
  
  
   
  
export default apartmentsRouter;
