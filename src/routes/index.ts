import { Router } from "express";
import buildingRouter from "./api/building";
import authRouter from "./api/auth";
import floorPlanRouter from "./api/floorPlan";
import apartmentsRouter from "./api/apartments";

const router = Router();
router.use(buildingRouter);
router.use(authRouter);
router.use(floorPlanRouter);
router.use(apartmentsRouter)

export default router;