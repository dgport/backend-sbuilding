"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const yamljs_1 = __importDefault(require("yamljs"));
const options = {
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "AISI GROUP",
};
const swaggerDocument = yamljs_1.default.load("./src/config/swagger.yaml");
exports.default = [swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerDocument, options)];
