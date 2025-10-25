import React from 'react'
import { UserPlus, Search, MessageCircle } from 'lucide-react'

const steps = [
  {
    icon: UserPlus,
    title: "Sign Up",
    description: "Create your account in seconds and join thousands of satisfied patients",
    color: "bg-blue-100 text-blue-600"
  },
  {
    icon: Search,
    title: "Describe Symptoms",
    description: "Tell our AI about your symptoms or upload a prescription image",
    color: "bg-purple-100 text-purple-600"
  },
  {
    icon: MessageCircle,
    title: "Get Diagnosis",
    description: "Receive instant AI diagnosis and connect with verified doctors",
    color: "bg-green-100 text-green-600"
  }
]

const HowToStart = () => {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            How to Get Started
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Getting healthcare has never been easier. Follow these simple steps to start your journey to better health.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connection Line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-16 left-full w-full h-0.5 bg-gray-200 z-0">
                  <div className="absolute right-0 top-1/2 transform translate-x-1 -translate-y-1/2 w-0 h-0 border-l-4 border-l-gray-400 border-t-2 border-b-2 border-t-transparent border-b-transparent"></div>
                </div>
              )}

              <div className="relative z-10 text-center">
                {/* Step Number */}
                <div className="inline-flex items-center justify-center w-8 h-8 bg-gray-900 text-white rounded-full text-sm font-bold mb-4">
                  {index + 1}
                </div>

                {/* Icon */}
                <div className={`inline-flex items-center justify-center w-16 h-16 ${step.color} rounded-2xl mb-6`}>
                  <step.icon className="h-8 w-8" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <a
            href="/signup"
            className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105"
          >
            Get Started Today
          </a>
        </div>
      </div>
    </section>
  )
}

export default HowToStart