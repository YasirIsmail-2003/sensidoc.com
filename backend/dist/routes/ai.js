"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const aiController_1 = require("../controllers/aiController");
const middleware_1 = require("../middleware");
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
router.use(middleware_1.authenticateToken);
router.use(middleware_1.requireDoctorOrPatient);
router.post('/diagnose', middleware_1.aiLimiter, (0, validation_1.validateRequest)(validation_1.diagnosisSchema), aiController_1.getDiagnosis);
router.post('/drug-analyze', middleware_1.aiLimiter, (0, validation_1.validateRequest)(validation_1.drugAnalysisSchema), aiController_1.analyzeDrug);
router.post('/detect-fracture', middleware_1.aiLimiter, async (req, res, next) => {
    try {
        const { input_image } = req.body;
        const result = await (await Promise.resolve().then(() => __importStar(require('../services/aiService')))).default.detectFracture(input_image);
        res.json({ success: true, data: result });
    }
    catch (e) {
        next(e);
    }
});
router.post('/detect-tablet', middleware_1.aiLimiter, async (req, res, next) => {
    try {
        const { input_image } = req.body;
        const result = await (await Promise.resolve().then(() => __importStar(require('../services/aiService')))).default.analyzeDrug(undefined, input_image);
        res.json({ success: true, data: result });
    }
    catch (e) {
        next(e);
    }
});
router.get('/history', aiController_1.getAIHistory);
router.get('/usage-stats', aiController_1.getUsageStats);
exports.default = router;
//# sourceMappingURL=ai.js.map