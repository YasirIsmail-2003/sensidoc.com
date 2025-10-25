import React from 'react'
import { Link } from 'react-router-dom'
import { 
  Brain, 
  MessageCircle, 
  MapPin, 
  Pill, 
  FileText, 
  Crown,
  ArrowRight
} from 'lucide-react'

const services = [
  {
    icon: Brain,
    title: "AI Diagnosis",
    description: "Get instant medical diagnosis powered by advanced AI technology",
    link: "/ai-diagnosis",
    color: "bg-blue-50 border-blue-200 hover:bg-blue-100",
    iconColor: "text-blue-600"
  },
  {
    icon: MessageCircle,
    title: "Talk with Doctor",
    description: "Chat or video call with verified doctors anytime, anywhere",
    link: "/doctors",
    color: "bg-green-50 border-green-200 hover:bg-green-100",
    iconColor: "text-green-600"
  },
  {
    icon: MapPin,
    title: "Visit Doctor",
    description: "Find and book appointments with doctors near your location",
    link: "/find-doctors",
    color: "bg-purple-50 border-purple-200 hover:bg-purple-100",
    iconColor: "text-purple-600"
  },
  {
    icon: Pill,
    title: "Drug Information",
    description: "Search for drug information, interactions, and side effects",
    link: "/drugs",
    color: "bg-orange-50 border-orange-200 hover:bg-orange-100",
    iconColor: "text-orange-600"
  },
  {
    icon: FileText,
    title: "Health Records",
    description: "Securely store and manage all your medical records",
    link: "/health-records",
    color: "bg-teal-50 border-teal-200 hover:bg-teal-100",
    iconColor: "text-teal-600"
  },
  {
    icon: Crown,
    title: "Membership",
    description: "Unlock premium features with our membership plans",
    link: "/membership",
    color: "bg-yellow-50 border-yellow-200 hover:bg-yellow-100",
    iconColor: "text-yellow-600"
  }
]

const Services = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Our Services
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive healthcare services designed to meet all your medical needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <Link
              key={index}
              to={service.link}
              className={`group p-6 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${service.color}`}
            >
              <div className="flex items-start space-x-4">
                <div className={`flex-shrink-0 p-3 rounded-lg bg-white shadow-sm ${service.iconColor}`}>
                  <service.icon className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-gray-700">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-3">
                    {service.description}
                  </p>
                  <div className="flex items-center text-sm font-medium text-gray-500 group-hover:text-gray-700">
                    Learn more
                    <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Services