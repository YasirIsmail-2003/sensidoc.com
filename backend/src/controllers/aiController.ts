import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/config/database';
import { ApiResponse } from '@/types';
import { AuthRequest } from '@/middleware/auth';
import aiService from '@/services/aiService';

/**
 * @swagger
 * /api/ai/diagnose:
 *   post:
 *     summary: Get AI diagnosis from symptoms
 *     tags: [AI Services]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - input_text
 *             properties:
 *               input_text:
 *                 type: string
 *                 description: Patient's symptoms description
 *               input_image:
 *                 type: string
 *                 description: Optional image URL
 *     responses:
 *       200:
 *         description: Diagnosis generated successfully
 *       429:
 *         description: Rate limit exceeded
 */
export const getDiagnosis = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { input_text, input_image } = req.body;

    // Check user's membership and usage limits (admins exempt)
    const user = req.user!;
    if (user.role !== 'admin' && user.membership_type === 'free') {
      // Check usage count for free users (limit: 3 per month)
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
      
      const { count } = await supabase
        .from('diagnosis')
        .select('id', { count: 'exact' })
        .eq('patient_id', userId)
        .gte('created_at', `${currentMonth}-01`)
        .lt('created_at', `${currentMonth}-32`);

      if ((count || 0) >= 3) {
        res.status(429).json({
          success: false,
          message: 'Free usage limit exceeded. Please upgrade to premium for unlimited access.',
          data: { usageCount: count, limit: 3 }
        } as ApiResponse);
        return;
      }
    }

    // If an image is provided as a base64 data URL, upload it to Supabase storage and obtain a public URL
    let imageUrl: string | undefined = input_image;
    try {
      if (input_image && input_image.startsWith('data:')) {
        const base64 = input_image.split(',')[1];
        const buffer = Buffer.from(base64, 'base64');
        const fileName = `diagnosis-${userId}-${Date.now()}.jpg`;
        const { error: uploadError } = await supabase.storage
          .from('diagnosis-images')
          .upload(fileName, buffer, { contentType: 'image/jpeg', upsert: true });

        if (!uploadError) {
          const { data } = supabase.storage.from('diagnosis-images').getPublicUrl(fileName);
          imageUrl = data?.publicUrl || imageUrl;
        } else {
          console.warn('Failed to upload diagnosis image:', uploadError.message || uploadError);
        }
      }
    } catch (uploadEx) {
      console.error('Image upload error:', uploadEx);
      // proceed without imageUrl
    }

    // Get AI diagnosis
    const aiResponse = await aiService.getDiagnosis(input_text, imageUrl);

    // Save diagnosis to database
    const diagnosisId = uuidv4();
    const { error: saveError } = await supabase
      .from('diagnosis')
      .insert([{
        id: diagnosisId,
        patient_id: userId,
        input_text,
        input_image,
        ai_response: JSON.stringify(aiResponse),
        condition: aiResponse.condition,
        confidence_level: aiResponse.confidence_level,
        recommendations: aiResponse.recommendations,
        created_at: new Date().toISOString()
      }]);

    if (saveError) {
      console.error('Error saving diagnosis:', saveError);
      // Continue even if saving fails
    }

    // Get updated usage count
    const currentMonth = new Date().toISOString().slice(0, 7);
    const { count: updatedCount } = await supabase
      .from('diagnosis')
      .select('id', { count: 'exact' })
      .eq('patient_id', userId)
      .gte('created_at', `${currentMonth}-01`)
      .lt('created_at', `${currentMonth}-32`);

    res.json({
      success: true,
      message: 'Diagnosis generated successfully',
      data: {
        diagnosis: aiResponse,
        diagnosisId,
        usageCount: updatedCount || 0,
        limit: user.membership_type === 'free' ? 3 : null
      }
    } as ApiResponse);

  } catch (error) {
    console.error('AI Diagnosis error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate diagnosis. Please try again later.',
      error: error instanceof Error ? error.message : 'Unknown error'
    } as ApiResponse);
  }
};

export const detectFracture = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { input_image } = req.body
    if (!input_image) {
      res.status(400).json({ success: false, message: 'input_image is required' } as ApiResponse)
      return
    }
    const result = await (await import('@/services/aiService')).default.detectFracture(input_image)
    res.json({ success: true, data: result } as ApiResponse)
  } catch (error) {
    console.error('Detect fracture error:', error)
    res.status(500).json({ success: false, message: 'Failed to detect fracture', error: error instanceof Error ? error.message : 'Unknown error' } as ApiResponse)
  }
}

export const detectTablet = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { input_image } = req.body
    if (!input_image) {
      res.status(400).json({ success: false, message: 'input_image is required' } as ApiResponse)
      return
    }
    const result = await (await import('@/services/aiService')).default.analyzeDrug(undefined, input_image)
    res.json({ success: true, data: result } as ApiResponse)
  } catch (error) {
    console.error('Detect tablet error:', error)
    res.status(500).json({ success: false, message: 'Failed to analyze tablet', error: error instanceof Error ? error.message : 'Unknown error' } as ApiResponse)
  }
}

/**
 * @swagger
 * /api/ai/drug-analyze:
 *   post:
 *     summary: Analyze drug information
 *     tags: [AI Services]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               drug_name:
 *                 type: string
 *                 description: Name of the drug
 *               drug_image:
 *                 type: string
 *                 description: Image URL of the drug
 *     responses:
 *       200:
 *         description: Drug analysis completed successfully
 *       429:
 *         description: Rate limit exceeded
 */
export const analyzeDrug = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { drug_name, drug_image } = req.body;

    if (!drug_name && !drug_image) {
      res.status(400).json({
        success: false,
        message: 'Either drug name or drug image is required'
      } as ApiResponse);
      return;
    }

    // Check user's membership and usage limits (admins exempt)
    const user = req.user!;
    if (user.role !== 'admin' && user.membership_type === 'free') {
      // Check usage count for free users (limit: 3 per month)
      const currentMonth = new Date().toISOString().slice(0, 7);
      
      const { count } = await supabase
        .from('drug_analysis')
        .select('id', { count: 'exact' })
        .eq('user_id', userId)
        .gte('created_at', `${currentMonth}-01`)
        .lt('created_at', `${currentMonth}-32`);

      if ((count || 0) >= 3) {
        res.status(429).json({
          success: false,
          message: 'Free usage limit exceeded. Please upgrade to premium for unlimited access.',
          data: { usageCount: count, limit: 3 }
        } as ApiResponse);
        return;
      }
    }

    // If drug_image is a base64 data URL, upload to storage
    let imageUrl: string | undefined = drug_image;
    try {
      if (drug_image && drug_image.startsWith('data:')) {
        const base64 = drug_image.split(',')[1];
        const buffer = Buffer.from(base64, 'base64');
        const fileName = `drug-${userId}-${Date.now()}.jpg`;
        const { error: uploadError } = await supabase.storage
          .from('drug-images')
          .upload(fileName, buffer, { contentType: 'image/jpeg', upsert: true });

        if (!uploadError) {
          const { data } = supabase.storage.from('drug-images').getPublicUrl(fileName);
          imageUrl = data?.publicUrl || imageUrl;
        } else {
          console.warn('Failed to upload drug image:', uploadError.message || uploadError);
        }
      }
    } catch (uploadEx) {
      console.error('Drug image upload error:', uploadEx);
    }

    // Get AI drug analysis
    const aiResponse = await aiService.analyzeDrug(drug_name, imageUrl);

    // Save analysis to database
    const analysisId = uuidv4();
    const { error: saveError } = await supabase
      .from('drug_analysis')
      .insert([{
        id: analysisId,
        user_id: userId,
        drug_name: drug_name || aiResponse.drug_name,
        drug_image,
        analysis_result: JSON.stringify(aiResponse),
        uses: aiResponse.uses,
        side_effects: aiResponse.side_effects,
        dosage: aiResponse.dosage,
        warnings: aiResponse.warnings,
        created_at: new Date().toISOString()
      }]);

    if (saveError) {
      console.error('Error saving drug analysis:', saveError);
      // Continue even if saving fails
    }

    // Get updated usage count
    const currentMonth = new Date().toISOString().slice(0, 7);
    const { count: updatedCount } = await supabase
      .from('drug_analysis')
      .select('id', { count: 'exact' })
      .eq('user_id', userId)
      .gte('created_at', `${currentMonth}-01`)
      .lt('created_at', `${currentMonth}-32`);

    res.json({
      success: true,
      message: 'Drug analysis completed successfully',
      data: {
        analysis: aiResponse,
        analysisId,
        usageCount: updatedCount || 0,
        limit: user.membership_type === 'free' ? 3 : null
      }
    } as ApiResponse);

  } catch (error) {
    console.error('Drug analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze drug. Please try again later.',
      error: error instanceof Error ? error.message : 'Unknown error'
    } as ApiResponse);
  }
};

/**
 * @swagger
 * /api/ai/history:
 *   get:
 *     summary: Get user's AI service history
 *     tags: [AI Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [diagnosis, drug_analysis]
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
 *         description: History retrieved successfully
 */
export const getAIHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { type, page = 1, limit = 10 } = req.query;

    const offset = (Number(page) - 1) * Number(limit);

    if (type === 'diagnosis') {
      const { data: diagnoses, error, count } = await supabase
        .from('diagnosis')
        .select('*')
        .eq('patient_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + Number(limit) - 1);

      if (error) throw error;

      res.json({
        success: true,
        message: 'Diagnosis history retrieved successfully',
        data: diagnoses,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: count || 0,
          totalPages: Math.ceil((count || 0) / Number(limit))
        }
      } as ApiResponse);

    } else if (type === 'drug_analysis') {
      const { data: analyses, error, count } = await supabase
        .from('drug_analysis')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + Number(limit) - 1);

      if (error) throw error;

      res.json({
        success: true,
        message: 'Drug analysis history retrieved successfully',
        data: analyses,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: count || 0,
          totalPages: Math.ceil((count || 0) / Number(limit))
        }
      } as ApiResponse);

    } else {
      // Get both types
      const [diagnosisResult, drugAnalysisResult] = await Promise.all([
        supabase
          .from('diagnosis')
          .select('*, type:created_at')
          .eq('patient_id', userId)
          .order('created_at', { ascending: false })
          .limit(Number(limit) / 2),
        supabase
          .from('drug_analysis')
          .select('*, type:created_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(Number(limit) / 2)
      ]);

      const combinedData = [
        ...(diagnosisResult.data || []).map((item: any) => ({ ...item, type: 'diagnosis' })),
        ...(drugAnalysisResult.data || []).map((item: any) => ({ ...item, type: 'drug_analysis' }))
      ].sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      res.json({
        success: true,
        message: 'AI service history retrieved successfully',
        data: combinedData
      } as ApiResponse);
    }

  } catch (error) {
    console.error('Get AI history error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    } as ApiResponse);
  }
};

/**
 * @swagger
 * /api/ai/usage-stats:
 *   get:
 *     summary: Get user's AI service usage statistics
 *     tags: [AI Services]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Usage statistics retrieved successfully
 */
export const getUsageStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const user = req.user!;
    const currentMonth = new Date().toISOString().slice(0, 7);

    // Get current month usage
    const [diagnosisCount, drugAnalysisCount] = await Promise.all([
      supabase
        .from('diagnosis')
        .select('id', { count: 'exact' })
        .eq('patient_id', userId)
        .gte('created_at', `${currentMonth}-01`)
        .lt('created_at', `${currentMonth}-32`),
      supabase
        .from('drug_analysis')
        .select('id', { count: 'exact' })
        .eq('user_id', userId)
        .gte('created_at', `${currentMonth}-01`)
        .lt('created_at', `${currentMonth}-32`)
    ]);

    const limits = user.membership_type === 'free' ? { diagnosis: 3, drug_analysis: 3 } : null;

    res.json({
      success: true,
      message: 'Usage statistics retrieved successfully',
      data: {
        membership_type: user.membership_type,
        current_month: currentMonth,
        usage: {
          diagnosis: diagnosisCount.count || 0,
          drug_analysis: drugAnalysisCount.count || 0
        },
        limits,
        remaining: limits ? {
          diagnosis: Math.max(0, limits.diagnosis - (diagnosisCount.count || 0)),
          drug_analysis: Math.max(0, limits.drug_analysis - (drugAnalysisCount.count || 0))
        } : null
      }
    } as ApiResponse);

  } catch (error) {
    console.error('Get usage stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    } as ApiResponse);
  }
};