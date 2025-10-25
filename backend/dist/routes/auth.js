"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const middleware_1 = require("../middleware");
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
router.post('/register', middleware_1.authLimiter, (0, validation_1.validateRequest)(validation_1.registerSchema), authController_1.register);
router.post('/login', middleware_1.authLimiter, (0, validation_1.validateRequest)(validation_1.loginSchema), authController_1.login);
router.get('/profile', middleware_1.authenticateToken, authController_1.getProfile);
router.post('/logout', middleware_1.authenticateToken, authController_1.logout);
exports.default = router;
//# sourceMappingURL=auth.js.map