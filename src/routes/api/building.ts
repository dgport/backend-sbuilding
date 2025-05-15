import { Router } from "express";
import { authenticateToken } from "../../middlewares/auth";
import { AddBuilding } from "../../controllers/buildings/AddBuilding";
import { DeleteBuildingById } from "../../controllers/buildings/DeleteBuilding";
import { GetBuildings } from "../../controllers/buildings/AllBuildings";
import { GetBuildingById } from "../../controllers/buildings/BuildingById";


const buildingRouter = Router();


buildingRouter.post("/add_building", authenticateToken, AddBuilding);
buildingRouter.delete("/delete_building/:id", authenticateToken, DeleteBuildingById);
buildingRouter.get("/buildings", GetBuildings);
buildingRouter.get("/building/:id", GetBuildingById);

export default buildingRouter;