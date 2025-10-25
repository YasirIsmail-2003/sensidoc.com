"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const blogController_1 = require("../controllers/blogController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
router.get('/', blogController_1.getBlogs);
router.get('/categories', blogController_1.getCategories);
router.get('/:blogId', blogController_1.getBlogById);
router.get('/:blogId/summary', blogController_1.getBlogSummary);
router.post('/', auth_1.authenticateToken, auth_1.requireAdmin, (0, validation_1.validateRequest)(validation_1.blogSchema), blogController_1.createBlog);
router.put('/:blogId', auth_1.authenticateToken, auth_1.requireAdmin, blogController_1.updateBlog);
router.delete('/:blogId', auth_1.authenticateToken, auth_1.requireAdmin, blogController_1.deleteBlog);
exports.default = router;
//# sourceMappingURL=blogs.js.map