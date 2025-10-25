import React from 'react'
import { Link } from 'react-router-dom'
import { Lock, Shield, Eye, Database, User, Mail } from 'lucide-react'

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center mb-6">
            <Lock className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
          </div>
          <p className="text-gray-600">
            Last updated: January 15, 2024
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="prose prose-lg max-w-none">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-bold text-blue-900 mb-2">HIPAA Compliance Notice</h2>
              <p className="text-blue-800">
                SensiDoc is committed to protecting your health information in compliance with the Health Insurance Portability and Accountability Act (HIPAA) and other applicable privacy laws. Your health information is treated with the highest level of confidentiality and security.
              </p>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">1. Information We Collect</h2>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Personal Information</h3>
            <p className="text-gray-700 mb-4">We collect information you provide directly to us, including:</p>
            <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
              <li>Name, email address, and contact information</li>
              <li>Date of birth and gender</li>
              <li>Medical history and health information</li>
              <li>Insurance information</li>
              <li>Payment and billing information</li>
              <li>Communication preferences</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-800 mb-3">Health Information</h3>
            <p className="text-gray-700 mb-4">We may collect and store:</p>
            <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
              <li>Symptoms and health concerns</li>
              <li>Medical diagnoses and treatment plans</li>
              <li>Medication information and allergies</li>
              <li>Lab results and test reports</li>
              <li>Appointment history and notes</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-800 mb-3">Automatically Collected Information</h3>
            <p className="text-gray-700 mb-6">
              We automatically collect certain information when you use our Platform, including IP address, browser type, device information, usage patterns, and cookies.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">2. How We Use Your Information</h2>
            <p className="text-gray-700 mb-4">We use the information we collect to:</p>
            <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
              <li>Provide and maintain our healthcare services</li>
              <li>Process appointments and manage your care</li>
              <li>Communicate with you about your health</li>
              <li>Improve our services and develop new features</li>
              <li>Ensure platform security and prevent fraud</li>
              <li>Comply with legal and regulatory requirements</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">3. Information Sharing and Disclosure</h2>
            <p className="text-gray-700 mb-4">We may share your information in the following circumstances:</p>
            
            <h3 className="text-lg font-semibold text-gray-800 mb-3">With Your Consent</h3>
            <p className="text-gray-700 mb-4">
              We will only share your health information with third parties when you provide explicit consent, except as required by law.
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mb-3">Healthcare Providers</h3>
            <p className="text-gray-700 mb-4">
              We may share your information with healthcare providers involved in your care, including doctors, specialists, and other medical professionals.
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mb-3">Legal Requirements</h3>
            <p className="text-gray-700 mb-6">
              We may disclose your information if required by law, court order, or government regulation, including public health reporting requirements.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">4. Data Security</h2>
            <p className="text-gray-700 mb-4">We implement comprehensive security measures to protect your information:</p>
            <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
              <li>End-to-end encryption for all data transmission</li>
              <li>Secure data centers with physical and digital security</li>
              <li>Regular security audits and vulnerability assessments</li>
              <li>Access controls and authentication measures</li>
              <li>Employee training on privacy and security</li>
              <li>Incident response and breach notification procedures</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">5. Your Rights and Choices</h2>
            <p className="text-gray-700 mb-4">You have the following rights regarding your information:</p>
            <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
              <li><strong>Access:</strong> Request a copy of your health information</li>
              <li><strong>Correction:</strong> Request corrections to inaccurate information</li>
              <li><strong>Deletion:</strong> Request deletion of your information (subject to legal requirements)</li>
              <li><strong>Portability:</strong> Request transfer of your data to another provider</li>
              <li><strong>Restriction:</strong> Request limitations on how we use your information</li>
              <li><strong>Opt-out:</strong> Opt out of certain communications and data sharing</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">6. Cookies and Tracking Technologies</h2>
            <p className="text-gray-700 mb-4">
              We use cookies and similar technologies to enhance your experience, analyze usage patterns, and provide personalized content. You can control cookie settings through your browser preferences.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">7. Third-Party Services</h2>
            <p className="text-gray-700 mb-6">
              Our Platform may integrate with third-party services for payment processing, analytics, and other functions. These services have their own privacy policies, and we encourage you to review them.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">8. Children's Privacy</h2>
            <p className="text-gray-700 mb-6">
              Our Platform is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with information, please contact us.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">9. International Data Transfers</h2>
            <p className="text-gray-700 mb-6">
              Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your information in accordance with applicable laws.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">10. Changes to This Policy</h2>
            <p className="text-gray-700 mb-6">
              We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on our Platform and updating the "Last updated" date.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">11. Contact Us</h2>
            <p className="text-gray-700 mb-4">
              If you have questions about this Privacy Policy or our privacy practices, please contact us:
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-gray-700">
                <strong>Privacy Officer:</strong> privacy@sensidoc.com<br />
                <strong>General Support:</strong> support@sensidoc.com<br />
                <strong>Phone:</strong> +91 9967024134<br />
                <strong>Address:</strong> 502, Vibhuti Building, Saibaba Vihar Complex, Anand Nagar, Ghodbundar Road, Thane, Maharashtra
              </p>
            </div>

            <div className="border-t border-gray-200 pt-6 mt-8">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Your privacy is our priority. We are committed to protecting your health information.
                </p>
                <Link 
                  to="/legal/terms" 
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View Terms of Service →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PrivacyPolicy 