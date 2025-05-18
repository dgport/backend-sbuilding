"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../../middlewares/auth");
const AddFloorPlan_1 = require("../../controllers/floorPlans/AddFloorPlan");
const upload_floor_plan_1 = require("../../middlewares/upload-floor-plan");
const BuildingFloorPlan_1 = require("../../controllers/floorPlans/BuildingFloorPlan");
const DeleteFloorPlan_1 = require("../../controllers/floorPlans/DeleteFloorPlan");
const floorPlanRouter = (0, express_1.Router)();
floorPlanRouter.post("/add_floor_plan", auth_1.authenticateToken, upload_floor_plan_1.upload, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, AddFloorPlan_1.AddFloorPlan)(req, res);
}));
floorPlanRouter.get("/floor_plans/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, BuildingFloorPlan_1.BuildingFloorPlan)(req, res);
}));
floorPlanRouter.delete("/delete_plan/:id", auth_1.authenticateToken, upload_floor_plan_1.upload, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, DeleteFloorPlan_1.DeleteFloorPlan)(req, res);
}));
exports.default = floorPlanRouter;
