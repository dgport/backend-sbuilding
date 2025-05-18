"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const building_1 = __importDefault(require("./api/building"));
const auth_1 = __importDefault(require("./api/auth"));
const floorPlan_1 = __importDefault(require("./api/floorPlan"));
const apartments_1 = __importDefault(require("./api/apartments"));
const router = (0, express_1.Router)();
router.use(building_1.default);
router.use(auth_1.default);
router.use(floorPlan_1.default);
router.use(apartments_1.default);
exports.default = router;
