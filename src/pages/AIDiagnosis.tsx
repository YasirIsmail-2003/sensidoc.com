import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Brain, 
  Upload, 
  Camera, 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  Loader2,
  Stethoscope,
  Heart,
  Eye,
  Thermometer,
  Activity
} from 'lucide-react'

const AIDiagnosis = () => {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const [symptoms, setSymptoms] = useState('')
  const [uploadedImage, setUploadedImage] = useState<File | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [diagnosis, setDiagnosis] = useState<any>(null)
  const [searchCount, setSearchCount] = useState(0) // usage counter for free plan
  const isPremium = profile?.membership_type === 'premium'

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setUploadedImage(file)
    }
  }

  const handleAnalyze = async () => {
    if (!symptoms.trim() && !uploadedImage) {
      alert('Please enter symptoms or upload an image')
      return
    }

    setIsAnalyzing(true)
    
    try {
      const token = localStorage.getItem('jwtToken') || ''
      if (!token) {
        alert('Please login to use AI diagnosis')
        navigate('/login')
        return
      }
      // If an image is uploaded, convert it to base64 and call fracture/tablet detection first
      let input_image: string | undefined
      if (uploadedImage) {
        input_image = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(String(reader.result))
          reader.onerror = () => reject(new Error('Failed to read image'))
          reader.readAsDataURL(uploadedImage)
        })

        // Call fracture detection endpoint (Gemini-backed)
        try {
          const fragRes = await fetch(`${API_BASE}/ai/detect-fracture`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: token ? `Bearer ${token}` : ''
            },
            body: JSON.stringify({ input_image })
          })
          const fragJson = await fragRes.json()
          if (fragRes.ok && fragJson?.success) {
            const f = fragJson.data
            setDiagnosis({
              condition: f.fracture ? 'Possible Fracture Detected' : 'No fracture detected',
              confidence: f.confidence_level || (f.fracture ? 90 : 50),
              description: f.finding || (f.fracture ? 'Fracture suspected based on image analysis.' : 'No fracture detected in the provided image.'),
              symptoms: symptoms ? symptoms.split(',').map(s => s.trim()) : [],
              recommendations: f.fracture ? ['Seek immediate medical attention', 'Get orthopedics consult and follow-up X-rays'] : ['If pain persists get clinical evaluation'],
              severity: f.fracture ? 'Severe' : 'Mild',
              urgency: f.fracture ? 'High' : 'Low',
              followUp: f.finding || ''
            })
            if (!isPremium) setSearchCount((prev) => prev + 1)
            setIsAnalyzing(false)
            return
          }
        } catch (e) {
          console.warn('Fracture detection failed, falling back to text diagnosis', e)
        }
      }

      // Fallback / normal diagnosis (text + optional image)
      const res = await fetch(`${API_BASE}/ai/diagnose`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({ input_text: symptoms, input_image })
      })
      const json = await res.json()
      if (res.ok && json?.success) {
        const d = json.data.diagnosis
        setDiagnosis({
          condition: d.condition,
          confidence: d.confidence_level || d.confidence || 0,
          description: d.description,
          symptoms: d.symptoms || [],
          recommendations: d.recommendations || [],
          severity: d.severity || 'Mild',
          urgency: d.urgency || 'Low',
          followUp: d.when_to_consult || ''
        })
        if (!isPremium) setSearchCount((prev) => prev + 1)
      } else {
        alert(json?.message || 'Failed to get diagnosis')
      }
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleConsultDoctor = () => {
    // Navigate to doctors page
    window.location.href = '/doctors'
  }

  const commonSymptoms = [
    "Headache", "Fever", "Cough", "Sore throat", "Fatigue", 
    "Nausea", "Dizziness", "Chest pain", "Shortness of breath", "Back pain"
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Brain className="h-16 w-16 mx-auto mb-4" />
            <h1 className="text-4xl font-bold mb-4">AI Medical Diagnosis</h1>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Get instant medical insights powered by advanced AI technology
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Usage Counter */}
        <div className="mb-6">
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-blue-600" />
                  {isPremium ? (
                    <span className="text-sm font-medium text-blue-900">Premium plan: unlimited usage</span>
                  ) : (
                    <span className="text-sm font-medium text-blue-900">Free searches used: {searchCount}/3 this month</span>
                  )}
                </div>
                {!isPremium && searchCount >= 3 && (
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    Upgrade Plan
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Describe Your Symptoms
                </CardTitle>
                <CardDescription>
                  Provide detailed information about what you're experiencing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Describe your symptoms in detail... (e.g., I have a headache that started this morning, along with a runny nose and slight fever)"
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  rows={6}
                  className="resize-none"
                />

                {/* Common Symptoms */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Common Symptoms (click to add)</label>
                  <div className="flex flex-wrap gap-2">
                    {commonSymptoms.map((symptom) => (
                      <Badge
                        key={symptom}
                        variant="outline"
                        className="cursor-pointer hover:bg-blue-100 hover:border-blue-300"
                        onClick={() => {
                          if (!symptoms.includes(symptom)) {
                            setSymptoms(prev => prev ? `${prev}, ${symptom}` : symptom)
                          }
                        }}
                      >
                        {symptom}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Camera className="h-5 w-5 mr-2" />
                  Upload Medical Image (Optional)
                </CardTitle>
                <CardDescription>
                  Upload prescription, test results, or medical images for analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-sm text-gray-600 mb-2">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF up to 10MB
                    </p>
                  </label>
                </div>

                {uploadedImage && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium text-green-800">
                        {uploadedImage.name} uploaded successfully
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Button
              onClick={handleAnalyze}
              disabled={isAnalyzing || (!isPremium && searchCount >= 3)}
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="mr-2 h-5 w-5" />
                  Get AI Diagnosis
                </>
              )}
            </Button>

            {!isPremium && searchCount >= 3 && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-800">
                    You've reached your free limit. Upgrade to continue using AI diagnosis.
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {diagnosis ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center">
                      <Stethoscope className="h-5 w-5 mr-2" />
                      AI Diagnosis Results
                    </span>
                    <Badge 
                      variant={diagnosis.severity === 'Mild' ? 'success' : diagnosis.severity === 'Moderate' ? 'warning' : 'destructive'}
                    >
                      {diagnosis.severity}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Main Diagnosis */}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {diagnosis.condition}
                    </h3>
                    <div className="flex items-center space-x-2 mb-3">
                      <span className="text-sm text-gray-600">Confidence:</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${diagnosis.confidence}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{diagnosis.confidence}%</span>
                    </div>
                    <p className="text-gray-700">{diagnosis.description}</p>
                  </div>

                  {/* Symptoms */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Related Symptoms:</h4>
                    <div className="flex flex-wrap gap-2">
                      {diagnosis.symptoms.map((symptom: string, index: number) => (
                        <Badge key={index} variant="outline">
                          {symptom}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Recommendations:</h4>
                    <ul className="space-y-2">
                      {diagnosis.recommendations.map((rec: string, index: number) => (
                        <li key={index} className="flex items-start space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Follow-up */}
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-blue-900 mb-1">Follow-up Advice:</h4>
                        <p className="text-sm text-blue-800">{diagnosis.followUp}</p>
                      </div>
                    </div>
                  </div>

                  {/* Consult Doctor CTA */}
                  <div className="space-y-3">
                    <Button
                      onClick={handleConsultDoctor}
                      className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                    >
                      <Heart className="mr-2 h-4 w-4" />
                      Consult with a Doctor
                    </Button>
                    <p className="text-xs text-gray-500 text-center">
                      This AI diagnosis is for informational purposes only and should not replace professional medical advice.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Brain className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Ready for AI Analysis
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Enter your symptoms or upload a medical image to get started with AI-powered diagnosis.
                  </p>
                  
                  {/* Features */}
                  <div className="grid grid-cols-1 gap-4 text-left">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Brain className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="text-sm text-gray-700">Advanced AI analysis</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Thermometer className="h-4 w-4 text-green-600" />
                      </div>
                      <span className="text-sm text-gray-700">Instant results</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <Eye className="h-4 w-4 text-purple-600" />
                      </div>
                      <span className="text-sm text-gray-700">Image analysis support</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Disclaimer */}
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="p-4">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-yellow-900 mb-1">Important Disclaimer</h4>
                    <p className="text-sm text-yellow-800">
                      This AI diagnosis tool is for informational purposes only and should not be used as a substitute for professional medical advice, diagnosis, or treatment. Always consult with a qualified healthcare provider for medical concerns.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AIDiagnosis