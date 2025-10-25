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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsageStats = exports.getAIHistory = exports.analyzeDrug = exports.detectTablet = exports.detectFracture = exports.getDiagnosis = void 0;
const uuid_1 = require("uuid");
const database_1 = require("../config/database");
const aiService_1 = __importDefault(require("../services/aiService"));
const getDiagnosis = async (req, res) => {
    try {
        const userId = req.user.id;
        const { input_text, input_image } = req.body;
        const user = req.user;
        if (user.role !== 'admin' && user.membership_type === 'free') {
            const currentMonth = new Date().toISOString().slice(0, 7);
            const { count } = await database_1.supabase
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
                });
                return;
            }
        }
        let imageUrl = input_image;
        try {
            if (input_image && input_image.startsWith('data:')) {
                const base64 = input_image.split(',')[1];
                const buffer = Buffer.from(base64, 'base64');
                const fileName = `diagnosis-${userId}-${Date.now()}.jpg`;
                const { error: uploadError } = await database_1.supabase.storage
                    .from('diagnosis-images')
                    .upload(fileName, buffer, { contentType: 'image/jpeg', upsert: true });
                if (!uploadError) {
                    const { data } = database_1.supabase.storage.from('diagnosis-images').getPublicUrl(fileName);
                    imageUrl = data?.publicUrl || imageUrl;
                }
                else {
                    console.warn('Failed to upload diagnosis image:', uploadError.message || uploadError);
                }
            }
        }
        catch (uploadEx) {
            console.error('Image upload error:', uploadEx);
        }
        const aiResponse = await aiService_1.default.getDiagnosis(input_text, imageUrl);
        const diagnosisId = (0, uuid_1.v4)();
        const { error: saveError } = await database_1.supabase
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
        }
        const currentMonth = new Date().toISOString().slice(0, 7);
        const { count: updatedCount } = await database_1.supabase
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
        });
    }
    catch (error) {
        console.error('AI Diagnosis error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate diagnosis. Please try again later.',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.getDiagnosis = getDiagnosis;
const detectFracture = async (req, res) => {
    try {
        const { input_image } = req.body;
        if (!input_image) {
            res.status(400).json({ success: false, message: 'input_image is required' });
            return;
        }
        const result = await (await Promise.resolve().then(() => __importStar(require('../services/aiService')))).default.detectFracture(input_image);
        res.json({ success: true, data: result });
    }
    catch (error) {
        console.error('Detect fracture error:', error);
        res.status(500).json({ success: false, message: 'Failed to detect fracture', error: error instanceof Error ? error.message : 'Unknown error' });
    }
};
exports.detectFracture = detectFracture;
const detectTablet = async (req, res) => {
    try {
        const { input_image } = req.body;
        if (!input_image) {
            res.status(400).json({ success: false, message: 'input_image is required' });
            return;
        }
        const result = await (await Promise.resolve().then(() => __importStar(require('../services/aiService')))).default.analyzeDrug(undefined, input_image);
        res.json({ success: true, data: result });
    }
    catch (error) {
        console.error('Detect tablet error:', error);
        res.status(500).json({ success: false, message: 'Failed to analyze tablet', error: error instanceof Error ? error.message : 'Unknown error' });
    }
};
exports.detectTablet = detectTablet;
const analyzeDrug = async (req, res) => {
    try {
        const userId = req.user.id;
        const { drug_name, drug_image } = req.body;
        if (!drug_name && !drug_image) {
            res.status(400).json({
                success: false,
                message: 'Either drug name or drug image is required'
            });
            return;
        }
        const user = req.user;
        if (user.role !== 'admin' && user.membership_type === 'free') {
            const currentMonth = new Date().toISOString().slice(0, 7);
            const { count } = await database_1.supabase
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
                });
                return;
            }
        }
        let imageUrl = drug_image;
        try {
            if (drug_image && drug_image.startsWith('data:')) {
                const base64 = drug_image.split(',')[1];
                const buffer = Buffer.from(base64, 'base64');
                const fileName = `drug-${userId}-${Date.now()}.jpg`;
                const { error: uploadError } = await database_1.supabase.storage
                    .from('drug-images')
                    .upload(fileName, buffer, { contentType: 'image/jpeg', upsert: true });
                if (!uploadError) {
                    const { data } = database_1.supabase.storage.from('drug-images').getPublicUrl(fileName);
                    imageUrl = data?.publicUrl || imageUrl;
                }
                else {
                    console.warn('Failed to upload drug image:', uploadError.message || uploadError);
                }
            }
        }
        catch (uploadEx) {
            console.error('Drug image upload error:', uploadEx);
        }
        const aiResponse = await aiService_1.default.analyzeDrug(drug_name, imageUrl);
        const analysisId = (0, uuid_1.v4)();
        const { error: saveError } = await database_1.supabase
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
        }
        const currentMonth = new Date().toISOString().slice(0, 7);
        const { count: updatedCount } = await database_1.supabase
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
        });
    }
    catch (error) {
        console.error('Drug analysis error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to analyze drug. Please try again later.',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.analyzeDrug = analyzeDrug;
const getAIHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const { type, page = 1, limit = 10 } = req.query;
        const offset = (Number(page) - 1) * Number(limit);
        if (type === 'diagnosis') {
            const { data: diagnoses, error, count } = await database_1.supabase
                .from('diagnosis')
                .select('*')
                .eq('patient_id', userId)
                .order('created_at', { ascending: false })
                .range(offset, offset + Number(limit) - 1);
            if (error)
                throw error;
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
            });
        }
        else if (type === 'drug_analysis') {
            const { data: analyses, error, count } = await database_1.supabase
                .from('drug_analysis')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .range(offset, offset + Number(limit) - 1);
            if (error)
                throw error;
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
            });
        }
        else {
            const [diagnosisResult, drugAnalysisResult] = await Promise.all([
                database_1.supabase
                    .from('diagnosis')
                    .select('*, type:created_at')
                    .eq('patient_id', userId)
                    .order('created_at', { ascending: false })
                    .limit(Number(limit) / 2),
                database_1.supabase
                    .from('drug_analysis')
                    .select('*, type:created_at')
                    .eq('user_id', userId)
                    .order('created_at', { ascending: false })
                    .limit(Number(limit) / 2)
            ]);
            const combinedData = [
                ...(diagnosisResult.data || []).map(item => ({ ...item, type: 'diagnosis' })),
                ...(drugAnalysisResult.data || []).map(item => ({ ...item, type: 'drug_analysis' }))
            ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            res.json({
                success: true,
                message: 'AI service history retrieved successfully',
                data: combinedData
            });
        }
    }
    catch (error) {
        console.error('Get AI history error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.getAIHistory = getAIHistory;
const getUsageStats = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = req.user;
        const currentMonth = new Date().toISOString().slice(0, 7);
        const [diagnosisCount, drugAnalysisCount] = await Promise.all([
            database_1.supabase
                .from('diagnosis')
                .select('id', { count: 'exact' })
                .eq('patient_id', userId)
                .gte('created_at', `${currentMonth}-01`)
                .lt('created_at', `${currentMonth}-32`),
            database_1.supabase
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
        });
    }
    catch (error) {
        console.error('Get usage stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.getUsageStats = getUsageStats;
//# sourceMappingURL=aiController.js.map