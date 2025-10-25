"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminController_1 = require("../controllers/adminController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticateToken);
router.use(auth_1.requireAdmin);
router.get('/stats', adminController_1.getDashboardStats);
router.get('/login-logs', adminController_1.getLoginLogs);
router.get('/users', adminController_1.getUsers);
router.put('/users/:userId/membership', adminController_1.updateUserMembership);
router.get('/doctors', adminController_1.getDoctors);
router.put('/doctors/:doctorId/verify', adminController_1.verifyDoctor);
router.get('/appointments', adminController_1.getAppointments);
exports.default = router;
//# sourceMappingURL=admin.js.map