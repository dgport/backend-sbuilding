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
const GetApartments_1 = require("../../controllers/apartments/GetApartments");
const upload_apartments_1 = require("../../middlewares/upload-apartments");
const AddApartments_1 = require("../../controllers/apartments/AddApartments");
const UpdateProperties_1 = require("../../controllers/apartments/UpdateProperties");
const UpdatePropertyStatus_1 = require("../../controllers/apartments/UpdatePropertyStatus");
const apartmentsRouter = (0, express_1.Router)();
apartmentsRouter.post("/add_apartments", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, AddApartments_1.AddApartments)(req, res);
}));
apartmentsRouter.get("/apartments/:building_id/:floor_plan_id?", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, GetApartments_1.getApartments)(req, res);
}));
apartmentsRouter.put("/update_apartment_status", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, UpdatePropertyStatus_1.updateApartmentStatus)(req, res);
}));
apartmentsRouter.put("/update_shared_properties", upload_apartments_1.apartmentUpload, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, UpdateProperties_1.updateSharedProperties)(req, res);
}));
exports.default = apartmentsRouter;
