import React from 'react'
import { Link } from 'react-router-dom'

const Disclaimer = () => (
  <div className="min-h-screen bg-gray-50">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-lg shadow-sm p-8">
        <h1 className="text-3xl font-bold mb-4">Medical Disclaimer</h1>
        <p className="text-gray-700">The information provided on SensiDoc is for informational purposes only and does not constitute medical advice. Always consult a qualified healthcare professional for diagnosis and treatment.</p>
        <div className="mt-6">
          <Link to="/legal/terms" className="text-blue-600">View Terms of Service</Link>
        </div>
      </div>
    </div>
  </div>
)

export default Disclaimer



