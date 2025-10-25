import React from 'react'
import { Shield, Clock, Award, Users } from 'lucide-react'

const features = [
  {
    icon: Shield,
    title: "100% Secure & Private",
    description: "Your health data is encrypted and protected with bank-level security",
    stats: "256-bit SSL encryption"
  },
  {
    icon: Clock,
    title: "24/7 Availability",
    description: "Access healthcare services anytime, anywhere, even on holidays",
    stats: "Round-the-clock support"
  },
  {
    icon: Award,
    title: "Verified Doctors",
    description: "All our doctors are licensed, verified, and have years of experience",
    stats: "500+ certified doctors"
  },
  {
    icon: Users,
    title: "Trusted by Thousands",
    description: "Join over 10,000 satisfied patients who trust us with their health",
    stats: "10,000+ happy patients"
  }
]

const WhyChooseUs = () => {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Why Choose SensiDoc?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're committed to providing the best healthcare experience with cutting-edge technology and compassionate care
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center group">
              <div className="relative mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl text-white shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110">
                  <feature.icon className="h-8 w-8" />
                </div>
                {/* Decorative ring */}
                <div className="absolute inset-0 rounded-2xl border-2 border-blue-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"></div>
              </div>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 mb-4 leading-relaxed">
                {feature.description}
              </p>
              <div className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full inline-block">
                {feature.stats}
              </div>
            </div>
          ))}
        </div>

        {/* Trust badges */}
        <div className="mt-16 pt-8 border-t border-gray-200">
          <div className="text-center mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Trusted & Certified
            </h3>
            <p className="text-gray-600">
              We meet the highest standards of healthcare and data security
            </p>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            <div className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-green-600" />
              <span className="font-medium">HIPAA Compliant</span>
            </div>
            <div className="flex items-center space-x-2">
              <Award className="h-6 w-6 text-blue-600" />
              <span className="font-medium">ISO 27001 Certified</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-purple-600" />
              <span className="font-medium">SOC 2 Type II</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default WhyChooseUs