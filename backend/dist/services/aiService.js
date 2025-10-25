"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
class AIService {
    constructor() {
        this.geminiApiKey = process.env.GEMINI_API_KEY || '';
    }
    async getDiagnosis(symptoms, imageUrl) {
        try {
            if (!this.geminiApiKey) {
                return {
                    condition: this.heuristicCondition(symptoms),
                    confidence_level: 70,
                    description: 'Preliminary, non‑AI fallback based on provided symptoms. Configure GEMINI_API_KEY for live AI.',
                    symptoms: symptoms.split(',').map(s => s.trim()).filter(Boolean),
                    recommendations: this.heuristicRecommendations(symptoms),
                    severity: 'mild',
                    when_to_consult: 'Consult a doctor if symptoms worsen or persist beyond 48 hours.'
                };
            }
            const prompt = `
        As a medical AI assistant, analyze the following symptoms and provide a preliminary diagnosis.
        
        Symptoms: ${symptoms}
        ${imageUrl ? `Image provided: ${imageUrl}` : ''}
        
        Please provide a response in the following JSON format:
        {
          "condition": "Most likely condition name",
          "confidence_level": 85,
          "description": "Detailed description of the condition",
          "symptoms": ["symptom1", "symptom2", "symptom3"],
          "recommendations": ["recommendation1", "recommendation2"],
          "severity": "mild/moderate/severe",
          "when_to_consult": "When to see a doctor"
        }
        
        Important: This is for informational purposes only and should not replace professional medical advice.
      `;
            const response = await axios_1.default.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`, {
                contents: [{
                        parts: [{
                                text: prompt
                            }]
                    }]
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'x-goog-api-key': this.geminiApiKey
                }
            });
            const aiResponse = response.data.candidates[0].content.parts[0].text;
            try {
                const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    return JSON.parse(jsonMatch[0]);
                }
            }
            catch (parseError) {
                return {
                    condition: "General Health Concern",
                    confidence_level: 70,
                    description: aiResponse,
                    symptoms: symptoms.split(',').map(s => s.trim()),
                    recommendations: [
                        "Monitor symptoms closely",
                        "Stay hydrated and get adequate rest",
                        "Consult a healthcare provider if symptoms persist"
                    ],
                    severity: "moderate",
                    when_to_consult: "If symptoms worsen or persist for more than 48 hours"
                };
            }
            throw new Error('Failed to parse AI response');
        }
        catch (error) {
            console.error('AI Diagnosis Error:', error);
            return {
                condition: this.heuristicCondition(symptoms),
                confidence_level: 60,
                description: 'Temporary fallback due to AI service error. Configure or verify GEMINI_API_KEY.',
                symptoms: symptoms.split(',').map(s => s.trim()).filter(Boolean),
                recommendations: this.heuristicRecommendations(symptoms),
                severity: 'moderate',
                when_to_consult: 'If symptoms worsen or persist, consult a doctor.'
            };
        }
    }
    async analyzeDrug(drugName, imageUrl) {
        try {
            if (!this.geminiApiKey) {
                return this.localDrugAnalysis(drugName);
            }
            let prompt = '';
            if (drugName) {
                prompt = `
          Provide detailed information about the medication: ${drugName}
          
          Please provide a response in the following JSON format:
          {
            "drug_name": "Brand name",
            "generic_name": "Generic name",
            "uses": ["use1", "use2", "use3"],
            "dosage": "Typical dosage information",
            "side_effects": ["side_effect1", "side_effect2"],
            "warnings": ["warning1", "warning2"],
            "interactions": ["interaction1", "interaction2"],
            "contraindications": ["contraindication1", "contraindication2"]
          }
        `;
            }
            else if (imageUrl) {
                prompt = `
          Analyze the medication in this image: ${imageUrl}
          
          Identify the medication and provide detailed information in the following JSON format:
          {
            "drug_name": "Identified brand name",
            "generic_name": "Generic name",
            "uses": ["use1", "use2", "use3"],
            "dosage": "Typical dosage information",
            "side_effects": ["side_effect1", "side_effect2"],
            "warnings": ["warning1", "warning2"],
            "interactions": ["interaction1", "interaction2"],
            "contraindications": ["contraindication1", "contraindication2"]
          }
          
          If you cannot clearly identify the medication, please indicate so in the response.
        `;
            }
            const response = await axios_1.default.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`, {
                contents: [{
                        parts: [{
                                text: prompt
                            }]
                    }]
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'x-goog-api-key': this.geminiApiKey
                }
            });
            const aiResponse = response.data.candidates[0].content.parts[0].text;
            try {
                const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    return JSON.parse(jsonMatch[0]);
                }
            }
            catch (parseError) {
                return {
                    drug_name: drugName || "Unknown Medication",
                    generic_name: "Not identified",
                    uses: ["Information not available"],
                    dosage: "Consult healthcare provider",
                    side_effects: ["Consult healthcare provider for side effects"],
                    warnings: ["Always consult healthcare provider before taking any medication"],
                    interactions: ["Check with pharmacist for drug interactions"],
                    contraindications: ["Consult healthcare provider"]
                };
            }
            throw new Error('Failed to parse AI response');
        }
        catch (error) {
            console.error('Drug Analysis Error:', error);
            return this.localDrugAnalysis(drugName);
        }
    }
    async detectFracture(imageUrl) {
        try {
            if (!this.geminiApiKey) {
                return { fracture: false, finding: 'Fracture detection unavailable (GEMINI_API_KEY not configured).' };
            }
            const prompt = `Analyze the following medical X-ray image and determine if there is a bone fracture. Reply only with a JSON object exactly in this format:\n{ "fracture": true|false, "finding": "short description" }\nImage URL: ${imageUrl}\nIf uncertain, set \"fracture\" to false and explain uncertainty in \"finding\".`;
            const response = await axios_1.default.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`, {
                contents: [{ parts: [{ text: prompt }] }]
            }, {
                headers: { 'Content-Type': 'application/json', 'x-goog-api-key': this.geminiApiKey }
            });
            const aiText = response.data.candidates?.[0]?.content?.parts?.[0]?.text || '';
            try {
                const jsonMatch = aiText.match(/\{[\s\S]*\}/);
                if (jsonMatch)
                    return JSON.parse(jsonMatch[0]);
            }
            catch (e) {
            }
            return { fracture: false, finding: aiText };
        }
        catch (error) {
            console.error('Fracture detection error:', error);
            return { fracture: false, finding: 'Fracture detection failed due to AI error.' };
        }
    }
    async generateBlogSummary(content) {
        try {
            if (!this.geminiApiKey) {
                return content.replace(/\s+/g, ' ').trim().slice(0, 200) + (content.length > 200 ? '...' : '');
            }
            const prompt = `Write a concise 2-3 sentence summary for the following blog content. Output only the summary.\n\nContent:\n${content}`;
            const response = await axios_1.default.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`, { contents: [{ parts: [{ text: prompt }] }] }, { headers: { 'Content-Type': 'application/json', 'x-goog-api-key': this.geminiApiKey } });
            const aiText = response.data.candidates?.[0]?.content?.parts?.[0]?.text || '';
            return aiText.trim().slice(0, 300);
        }
        catch (error) {
            console.error('Generate blog summary error:', error);
            return content.replace(/\s+/g, ' ').trim().slice(0, 200) + (content.length > 200 ? '...' : '');
        }
    }
    heuristicCondition(symptoms) {
        const s = symptoms.toLowerCase();
        if (s.includes('fever') && s.includes('cough'))
            return 'Viral Upper Respiratory Infection';
        if (s.includes('chest') && s.includes('pain'))
            return 'Possible Costochondritis';
        if (s.includes('headache'))
            return 'Tension Headache';
        if (s.includes('rash'))
            return 'Dermatitis';
        return 'General Health Concern';
    }
    heuristicRecommendations(symptoms) {
        const recs = [
            'Hydrate adequately and rest',
            'Monitor symptoms for 24–48 hours',
            'Use OTC analgesics if appropriate'
        ];
        if (symptoms.toLowerCase().includes('fever'))
            recs.push('Use antipyretics such as paracetamol');
        if (symptoms.toLowerCase().includes('cough'))
            recs.push('Use warm fluids and throat lozenges');
        return recs;
    }
    localDrugAnalysis(drugName) {
        const name = (drugName || 'Unknown Medication').trim();
        return {
            drug_name: name,
            generic_name: name,
            uses: ['Information for reference only'],
            dosage: 'Consult a healthcare professional for personalized dosage',
            side_effects: ['Nausea', 'Headache'],
            warnings: ['Read the label carefully', 'Avoid overdose'],
            interactions: ['May interact with blood thinners and NSAIDs'],
            contraindications: ['Known allergy to components']
        };
    }
}
exports.default = new AIService();
//# sourceMappingURL=aiService.js.map