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
exports.getCategories = exports.deleteBlog = exports.updateBlog = exports.createBlog = exports.getBlogSummary = exports.getBlogById = exports.getBlogs = void 0;
const uuid_1 = require("uuid");
const database_1 = require("../config/database");
const getBlogs = async (req, res) => {
    try {
        const { category, search, page = 1, limit = 10 } = req.query;
        const offset = (Number(page) - 1) * Number(limit);
        let query = database_1.supabase
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
        });
    }
    catch (error) {
        console.error('Get blogs error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.getBlogs = getBlogs;
const getBlogById = async (req, res) => {
    try {
        const { blogId } = req.params;
        const { data: blog, error } = await database_1.supabase
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
            });
            return;
        }
        res.json({
            success: true,
            message: 'Blog retrieved successfully',
            data: blog
        });
    }
    catch (error) {
        console.error('Get blog by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.getBlogById = getBlogById;
const getBlogSummary = async (req, res) => {
    try {
        const { blogId } = req.params;
        const { data: blog, error } = await database_1.supabase
            .from('blogs')
            .select('id, content, excerpt')
            .eq('id', blogId)
            .single();
        if (error || !blog) {
            res.status(404).json({ success: false, message: 'Blog not found' });
            return;
        }
        const aiService = await Promise.resolve().then(() => __importStar(require('../services/aiService')));
        const summary = await aiService.default.generateBlogSummary(blog.content || '');
        res.json({ success: true, data: { summary } });
    }
    catch (error) {
        console.error('Get blog summary error:', error);
        res.status(500).json({ success: false, message: 'Failed to generate summary', error: error instanceof Error ? error.message : 'Unknown error' });
    }
};
exports.getBlogSummary = getBlogSummary;
const createBlog = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        if (userRole !== 'admin') {
            res.status(403).json({
                success: false,
                message: 'Only admins can create blogs'
            });
            return;
        }
        const { title, content, excerpt, category, tags = [], featured_image, is_published = false } = req.body;
        let finalExcerpt = excerpt;
        if (!finalExcerpt || finalExcerpt.trim().length < 20) {
            try {
                const aiSummary = await (await Promise.resolve().then(() => __importStar(require('../services/aiService')))).default.generateBlogSummary(content);
                finalExcerpt = aiSummary || content.replace(/\s+/g, ' ').trim().slice(0, 200) + (content.length > 200 ? '...' : '');
            }
            catch (e) {
                finalExcerpt = content.replace(/\s+/g, ' ').trim().slice(0, 200) + (content.length > 200 ? '...' : '');
            }
        }
        const blogId = (0, uuid_1.v4)();
        const { error } = await database_1.supabase
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
        });
    }
    catch (error) {
        console.error('Create blog error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.createBlog = createBlog;
const updateBlog = async (req, res) => {
    try {
        const { blogId } = req.params;
        const userRole = req.user.role;
        if (userRole !== 'admin') {
            res.status(403).json({
                success: false,
                message: 'Only admins can update blogs'
            });
            return;
        }
        const { title, content, excerpt, category, tags, featured_image, is_published } = req.body;
        const updateData = {
            updated_at: new Date().toISOString()
        };
        if (title)
            updateData.title = title;
        if (content)
            updateData.content = content;
        if (excerpt)
            updateData.excerpt = excerpt;
        if (category)
            updateData.category = category;
        if (tags)
            updateData.tags = tags;
        if (featured_image !== undefined)
            updateData.featured_image = featured_image;
        if (is_published !== undefined)
            updateData.is_published = is_published;
        const { error } = await database_1.supabase
            .from('blogs')
            .update(updateData)
            .eq('id', blogId);
        if (error) {
            throw error;
        }
        res.json({
            success: true,
            message: 'Blog updated successfully'
        });
    }
    catch (error) {
        console.error('Update blog error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.updateBlog = updateBlog;
const deleteBlog = async (req, res) => {
    try {
        const { blogId } = req.params;
        const userRole = req.user.role;
        if (userRole !== 'admin') {
            res.status(403).json({
                success: false,
                message: 'Only admins can delete blogs'
            });
            return;
        }
        const { error } = await database_1.supabase
            .from('blogs')
            .delete()
            .eq('id', blogId);
        if (error) {
            throw error;
        }
        res.json({
            success: true,
            message: 'Blog deleted successfully'
        });
    }
    catch (error) {
        console.error('Delete blog error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.deleteBlog = deleteBlog;
const getCategories = async (req, res) => {
    try {
        const { data: blogs, error } = await database_1.supabase
            .from('blogs')
            .select('category')
            .eq('is_published', true);
        if (error) {
            throw error;
        }
        const categoryCounts = blogs?.reduce((acc, blog) => {
            const category = blog.category;
            acc[category] = (acc[category] || 0) + 1;
            return acc;
        }, {});
        const categories = Object.entries(categoryCounts || {})
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count);
        res.json({
            success: true,
            message: 'Categories retrieved successfully',
            data: categories
        });
    }
    catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.getCategories = getCategories;
//# sourceMappingURL=blogController.js.map