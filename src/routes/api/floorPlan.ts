import { Request, Response, Router } from "express";
import { authenticateToken } from "../../middlewares/auth";
import { AddFloorPlan } from "../../controllers/floorPlans/AddFloorPlan";
import { upload } from "../../middlewares/upload-floor-plan";
import { BuildingFloorPlan } from "../../controllers/floorPlans/BuildingFloorPlan";
import { DeleteFloorPlan } from "../../controllers/floorPlans/DeleteFloorPlan";

const floorPlanRouter = Router();

floorPlanRouter.post(
  "/add_floor_plan", 
  authenticateToken, 
  upload, 
  async (req: any, res: Response) => {
    await AddFloorPlan(req, res);
  }
)


floorPlanRouter.get(
  "/floor_plans/:id", 
 
  
  async (req: Request, res: Response) => {
    await BuildingFloorPlan(req, res);
  }
);



floorPlanRouter.delete(
  "/delete_plan/:id", 
  authenticateToken, 
  upload, 
  async (req: Request, res: Response) => {
    await DeleteFloorPlan(req, res);
  }
);



 

export default floorPlanRouter;