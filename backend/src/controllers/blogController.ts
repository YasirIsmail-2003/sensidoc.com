import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/config/database';
import { ApiResponse } from '@/types';
import { AuthRequest } from '@/middleware/auth';

/**
 * @swagger
 * /api/blogs:
 *   get:
 *     summary: Get published blogs
 *     tags: [Blog]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Blogs retrieved successfully
 */
export const getBlogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, search, page = 1, limit = 10 } = req.query;

    const offset = (Number(page) - 1) * Number(limit);

    let query = supabase
      .from('blogs')
      .select(`
        id,
        title,
        excerpt,
        category,
        tags,
        featured_image,
        created_at,
        updated_at,
        author:users!blogs_author_id_fkey(full_name)
      `)
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + Number(limit) - 1);

    if (category) {
      query = query.eq('category', category);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,excerpt.ilike.%${search}%,content.ilike.%${search}%`);
    }

    const { data: blogs, error, count } = await query;

    if (error) {
      throw error;
    }

    const totalPages = Math.ceil((count || 0) / Number(limit));

    res.json({
      success: true,
      message: 'Blogs retrieved successfully',
      data: blogs,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count || 0,
        totalPages
      }
    } as ApiResponse);

  } catch (error) {
    console.error('Get blogs error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    } as ApiResponse);
  }
};

/**
 * @swagger
 * /api/blogs/{blogId}:
 *   get:
 *     summary: Get blog by ID
 *     tags: [Blog]
 *     parameters:
 *       - in: path
 *         name: blogId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Blog retrieved successfully
 *       404:
 *         description: Blog not found
 */
export const getBlogById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { blogId } = req.params;

    const { data: blog, error } = await supabase
      .from('blogs')
      .select(`
        *,
        author:users!blogs_author_id_fkey(full_name, email)
      `)
      .eq('id', blogId)
      .eq('is_published', true)
      .single();

    if (error || !blog) {
      res.status(404).json({
        success: false,
        message: 'Blog not found'
      } as ApiResponse);
      return;
    }

    res.json({
      success: true,
      message: 'Blog retrieved successfully',
      data: blog
    } as ApiResponse);

  } catch (error) {
    console.error('Get blog by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    } as ApiResponse);
  }
};

/**
 * Generate or return a live AI summary for a blog post
 * GET /api/blogs/:blogId/summary
 */
export const getBlogSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const { blogId } = req.params;

    const { data: blog, error } = await supabase
      .from('blogs')
      .select('id, content, excerpt')
      .eq('id', blogId)
      .single();

    if (error || !blog) {
      res.status(404).json({ success: false, message: 'Blog not found' } as ApiResponse);
      return;
    }

    const aiService = await import('@/services/aiService');
    const summary = await aiService.default.generateBlogSummary(blog.content || '');

    res.json({ success: true, data: { summary } } as ApiResponse);
  } catch (error) {
    console.error('Get blog summary error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate summary', error: error instanceof Error ? error.message : 'Unknown error' } as ApiResponse);
  }
}

/**
 * @swagger
 * /api/blogs:
 *   post:
 *     summary: Create a new blog (admin only)
 *     tags: [Blog]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *               - excerpt
 *               - category
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               excerpt:
 *                 type: string
 *               category:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               featured_image:
 *                 type: string
 *               is_published:
 *                 type: boolean
 *                 default: false
 *     responses:
 *       201:
 *         description: Blog created successfully
 *       403:
 *         description: Admin access required
 */
export const createBlog = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;

    if (userRole !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Only admins can create blogs'
      } as ApiResponse);
      return;
    }

    const {
      title,
      content,
      excerpt,
      category,
      tags = [],
      featured_image,
      is_published = false
    } = req.body;

    // If no excerpt provided, generate a short summary using AI service when available
    let finalExcerpt = excerpt
    if (!finalExcerpt || finalExcerpt.trim().length < 20) {
      try {
        // Try to generate via AIService (Gemini) if configured
        const aiSummary = await (await import('@/services/aiService')).default.generateBlogSummary(content)
        finalExcerpt = aiSummary || content.replace(/\s+/g, ' ').trim().slice(0, 200) + (content.length > 200 ? '...' : '')
      } catch (e) {
        finalExcerpt = content.replace(/\s+/g, ' ').trim().slice(0, 200) + (content.length > 200 ? '...' : '')
      }
    }

    const blogId = uuidv4();
    const { error } = await supabase
      .from('blogs')
      .insert([{
        id: blogId,
        title,
        content,
        excerpt: finalExcerpt,
        category,
        tags,
        featured_image,
        is_published,
        author_id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }]);

    if (error) {
      throw error;
    }

    res.status(201).json({
      success: true,
      message: 'Blog created successfully',
      data: { blogId }
    } as ApiResponse);

  } catch (error) {
    console.error('Create blog error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    } as ApiResponse);
  }
};

/**
 * @swagger
 * /api/blogs/{blogId}:
 *   put:
 *     summary: Update blog (admin only)
 *     tags: [Blog]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: blogId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               excerpt:
 *                 type: string
 *               category:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               featured_image:
 *                 type: string
 *               is_published:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Blog updated successfully
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Blog not found
 */
export const updateBlog = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { blogId } = req.params;
    const userRole = req.user!.role;

    if (userRole !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Only admins can update blogs'
      } as ApiResponse);
      return;
    }

    const {
      title,
      content,
      excerpt,
      category,
      tags,
      featured_image,
      is_published
    } = req.body;

    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (title) updateData.title = title;
    if (content) updateData.content = content;
    if (excerpt) updateData.excerpt = excerpt;
    if (category) updateData.category = category;
    if (tags) updateData.tags = tags;
    if (featured_image !== undefined) updateData.featured_image = featured_image;
    if (is_published !== undefined) updateData.is_published = is_published;

    const { error } = await supabase
      .from('blogs')
      .update(updateData)
      .eq('id', blogId);

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      message: 'Blog updated successfully'
    } as ApiResponse);

  } catch (error) {
    console.error('Update blog error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    } as ApiResponse);
  }
};

/**
 * @swagger
 * /api/blogs/{blogId}:
 *   delete:
 *     summary: Delete blog (admin only)
 *     tags: [Blog]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: blogId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Blog deleted successfully
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Blog not found
 */
export const deleteBlog = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { blogId } = req.params;
    const userRole = req.user!.role;

    if (userRole !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Only admins can delete blogs'
      } as ApiResponse);
      return;
    }

    const { error } = await supabase
      .from('blogs')
      .delete()
      .eq('id', blogId);

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      message: 'Blog deleted successfully'
    } as ApiResponse);

  } catch (error) {
    console.error('Delete blog error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    } as ApiResponse);
  }
};

/**
 * @swagger
 * /api/blogs/categories:
 *   get:
 *     summary: Get blog categories
 *     tags: [Blog]
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 */
export const getCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const { data: blogs, error } = await supabase
      .from('blogs')
      .select('category')
      .eq('is_published', true);

    if (error) {
      throw error;
    }

    // Get unique categories with counts
    const categoryCounts = blogs?.reduce((acc: any, blog: any) => {
      const category = blog.category;
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    const categories = Object.entries(categoryCounts || {})
      .map(([name, count]: [string, any]) => ({ name, count }))
      .sort((a: any, b: any) => (b.count as number) - (a.count as number));

    res.json({
      success: true,
      message: 'Categories retrieved successfully',
      data: categories
    } as ApiResponse);

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    } as ApiResponse);
  }
};