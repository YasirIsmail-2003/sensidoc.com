"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const doctorController_1 = require("../controllers/doctorController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/', doctorController_1.getDoctors);
router.get('/specializations', doctorController_1.getSpecializations);
router.get('/:doctorId', doctorController_1.getDoctorById);
router.put('/profile', auth_1.authenticateToken, auth_1.requireDoctor, doctorController_1.updateDoctorProfile);
router.get('/dashboard/stats', auth_1.authenticateToken, auth_1.requireDoctor, doctorController_1.getDoctorDashboardStats);
exports.default = router;
//# sourceMappingURL=doctors.js.map