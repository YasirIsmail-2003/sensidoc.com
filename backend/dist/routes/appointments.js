"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const appointmentController_1 = require("../controllers/appointmentController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
router.use(auth_1.authenticateToken);
router.post('/', auth_1.requireDoctorOrPatient, (0, validation_1.validateRequest)(validation_1.appointmentSchema), appointmentController_1.bookAppointment);
router.get('/my-appointments', auth_1.requireDoctorOrPatient, appointmentController_1.getMyAppointments);
router.get('/:appointmentId', auth_1.requireDoctorOrPatient, appointmentController_1.getAppointmentDetails);
router.put('/:appointmentId/status', auth_1.requireDoctor, appointmentController_1.updateAppointmentStatus);
exports.default = router;
//# sourceMappingURL=appointments.js.map