import React from 'react'
import { Link } from 'react-router-dom'
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              <img src="/logo.png" alt="SensiDoc Logo" className="h-10 w-10" />
              <span className="text-2xl font-bold">
                <span className="text-blue-400">Sensi</span>
                <span className="text-purple-400">Doc</span>
              </span>
            </Link>
            <p className="text-gray-300 text-sm">
              Your trusted healthcare companion. Get AI-powered diagnosis, consult with verified doctors, 
              and manage your health records all in one place.
            </p>
            <div className="flex space-x-4">
              <Facebook className="h-5 w-5 text-gray-400 hover:text-blue-400 cursor-pointer transition-colors" />
              <Twitter className="h-5 w-5 text-gray-400 hover:text-blue-400 cursor-pointer transition-colors" />
              <Instagram className="h-5 w-5 text-gray-400 hover:text-purple-400 cursor-pointer transition-colors" />
              <Linkedin className="h-5 w-5 text-gray-400 hover:text-blue-400 cursor-pointer transition-colors" />
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/ai-diagnosis" className="text-gray-300 hover:text-white transition-colors">AI Diagnosis</Link></li>
              <li><Link to="/doctors" className="text-gray-300 hover:text-white transition-colors">Find Doctors</Link></li>
              <li><Link to="/drugs" className="text-gray-300 hover:text-white transition-colors">Drug Information</Link></li>
              <li><Link to="/health-records" className="text-gray-300 hover:text-white transition-colors">Health Records</Link></li>
              <li><Link to="/membership" className="text-gray-300 hover:text-white transition-colors">Membership</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/legal/terms" className="text-gray-300 hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link to="/legal/privacy" className="text-gray-300 hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/legal/disclaimer" className="text-gray-300 hover:text-white transition-colors">Medical Disclaimer</Link></li>
              <li><Link to="/legal/grievance" className="text-gray-300 hover:text-white transition-colors">Grievance Policy</Link></li>
              <li><Link to="/legal/refund" className="text-gray-300 hover:text-white transition-colors">Refund Policy</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Us</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-blue-400" />
                <span className="text-gray-300">contact@sensidoc.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-blue-400" />
                <span className="text-gray-300">+91 9967024134</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-blue-400" />
                <span className="text-gray-300">502, Vibhuti Building, Saibaba Vihar Complex, Anand Nagar, Ghodbundar Road, Thane, Maharashtra</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 SensiDoc. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link to="/legal" className="text-gray-400 hover:text-white text-sm transition-colors">
                Legal Center
              </Link>
              <Link to="/legal/advertise" className="text-gray-400 hover:text-white text-sm transition-colors">
                Advertise
              </Link>
              <Link to="/legal/press" className="text-gray-400 hover:text-white text-sm transition-colors">
                Press
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer