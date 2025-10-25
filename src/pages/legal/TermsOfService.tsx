import React from 'react'
import { Link } from 'react-router-dom'
import { Shield, FileText, Calendar, User, Lock } from 'lucide-react'

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center mb-6">
            <Shield className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Terms of Service</h1>
          </div>
          <p className="text-gray-600">
            Last updated: January 15, 2024
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">1. Acceptance of Terms</h2>
            <p className="text-gray-700 mb-6">
              By accessing and using SensiDoc ("the Platform"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">2. Description of Service</h2>
            <p className="text-gray-700 mb-6">
              SensiDoc is a comprehensive healthcare platform that provides:
            </p>
            <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
              <li>AI-powered preliminary health assessments</li>
              <li>Doctor appointment booking and management</li>
              <li>Drug information and interactions</li>
              <li>Health record management</li>
              <li>Educational health content and resources</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">3. User Accounts and Registration</h2>
            <p className="text-gray-700 mb-4">
              To access certain features of the Platform, you must register for an account. You agree to:
            </p>
            <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain and update your account information</li>
              <li>Keep your password secure and confidential</li>
              <li>Accept responsibility for all activities under your account</li>
              <li>Notify us immediately of any unauthorized use</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">4. Medical Disclaimer</h2>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
              <p className="text-yellow-800 font-medium mb-2">Important Medical Notice:</p>
              <p className="text-yellow-700">
                The information provided on SensiDoc is for educational and informational purposes only. It is not intended as a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
              </p>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">5. Privacy and Data Protection</h2>
            <p className="text-gray-700 mb-4">
              Your privacy is important to us. Our collection and use of personal information is governed by our Privacy Policy, which is incorporated into these Terms by reference.
            </p>
            <p className="text-gray-700 mb-6">
              We are committed to protecting your health information in compliance with applicable laws and regulations, including HIPAA where applicable.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">6. Acceptable Use</h2>
            <p className="text-gray-700 mb-4">You agree not to use the Platform to:</p>
            <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe upon the rights of others</li>
              <li>Transmit harmful, offensive, or inappropriate content</li>
              <li>Attempt to gain unauthorized access to the Platform</li>
              <li>Interfere with the proper functioning of the Platform</li>
              <li>Use the Platform for commercial purposes without authorization</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">7. Intellectual Property</h2>
            <p className="text-gray-700 mb-6">
              The Platform and its original content, features, and functionality are owned by SensiDoc and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">8. Limitation of Liability</h2>
            <p className="text-gray-700 mb-6">
              To the maximum extent permitted by law, SensiDoc shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of the Platform.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">9. Termination</h2>
            <p className="text-gray-700 mb-6">
              We may terminate or suspend your account and bar access to the Platform immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever, including without limitation if you breach the Terms.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">10. Changes to Terms</h2>
            <p className="text-gray-700 mb-6">
              We reserve the right to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">11. Contact Information</h2>
            <p className="text-gray-700 mb-6">
              If you have any questions about these Terms of Service, please contact us at:
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-gray-700">
                <strong>Email:</strong> legal@sensidoc.com<br />
                <strong>Phone:</strong> +91 9967024134<br />
                <strong>Address:</strong> 502, Vibhuti Building, Saibaba Vihar Complex, Anand Nagar, Ghodbundar Road, Thane, Maharashtra
              </p>
            </div>

            <div className="border-t border-gray-200 pt-6 mt-8">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  By using SensiDoc, you acknowledge that you have read and understood these Terms of Service.
                </p>
                <Link 
                  to="/legal/privacy" 
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View Privacy Policy →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TermsOfService 