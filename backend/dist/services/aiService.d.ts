interface DiagnosisResponse {
    condition: string;
    confidence_level: number;
    description: string;
    symptoms: string[];
    recommendations: string[];
    severity: string;
    when_to_consult: string;
}
interface DrugAnalysisResponse {
    drug_name: string;
    generic_name: string;
    uses: string[];
    dosage: string;
    side_effects: string[];
    warnings: string[];
    interactions: string[];
    contraindications: string[];
}
declare class AIService {
    private geminiApiKey;
    constructor();
    getDiagnosis(symptoms: string, imageUrl?: string): Promise<DiagnosisResponse>;
    analyzeDrug(drugName?: string, imageUrl?: string): Promise<DrugAnalysisResponse>;
    detectFracture(imageUrl: string): Promise<{
        fracture: boolean;
        finding: string;
    }>;
    generateBlogSummary(content: string): Promise<string>;
    private heuristicCondition;
    private heuristicRecommendations;
    private localDrugAnalysis;
}
declare const _default: AIService;
export default _default;
//# sourceMappingURL=aiService.d.ts.map