import { Router } from 'express';
import { 
  getBlogs, 
  getBlogById, 
  createBlog, 
  updateBlog, 
  deleteBlog, 
  getCategories, 
  getBlogSummary
} from '@/controllers/blogController';
import { authenticateToken, requireAdmin } from '@/middleware/auth';
import { validateRequest, blogSchema } from '@/middleware/validation';

const router = Router();

// Public routes
router.get('/', getBlogs);
router.get('/categories', getCategories);
router.get('/:blogId', getBlogById);
router.get('/:blogId/summary', getBlogSummary);

// Admin only routes
router.post('/', authenticateToken, requireAdmin, validateRequest(blogSchema), createBlog);
router.put('/:blogId', authenticateToken, requireAdmin, updateBlog);
router.delete('/:blogId', authenticateToken, requireAdmin, deleteBlog);

export default router;