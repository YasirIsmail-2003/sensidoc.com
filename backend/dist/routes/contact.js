"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const contactController_1 = require("../controllers/contactController");
const middleware_1 = require("../middleware");
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
router.post('/', middleware_1.contactLimiter, (0, validation_1.validateRequest)(validation_1.contactSchema), contactController_1.submitContactForm);
router.get('/submissions', middleware_1.authenticateToken, middleware_1.requireAdmin, contactController_1.getContactSubmissions);
router.put('/submissions/:submissionId/status', middleware_1.authenticateToken, middleware_1.requireAdmin, contactController_1.updateSubmissionStatus);
exports.default = router;
//# sourceMappingURL=contact.js.map