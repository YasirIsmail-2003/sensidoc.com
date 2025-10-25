import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'

const banners = [
  {
    id: 1,
    title: "Get 50% OFF on Premium Membership",
    subtitle: "Unlimited AI diagnosis & priority doctor consultations",
    image: "https://images.pexels.com/photos/4386467/pexels-photo-4386467.jpeg?auto=compress&cs=tinysrgb&w=800",
    cta: "Upgrade Now",
    link: "/membership",
    gradient: "from-blue-600 to-purple-600"
  },
  {
    id: 2,
    title: "24/7 Emergency Consultation",
    subtitle: "Connect with emergency doctors instantly",
    image: "https://images.pexels.com/photos/4386476/pexels-photo-4386476.jpeg?auto=compress&cs=tinysrgb&w=800",
    cta: "Get Help Now",
    link: "/doctors?emergency=true",
    gradient: "from-red-500 to-pink-600"
  },
  {
    id: 3,
    title: "Free Health Checkup",
    subtitle: "Complete AI-powered health assessment",
    image: "https://images.pexels.com/photos/4386431/pexels-photo-4386431.jpeg?auto=compress&cs=tinysrgb&w=800",
    cta: "Start Assessment",
    link: "/ai-diagnosis",
    gradient: "from-green-500 to-teal-600"
  }
]

const AdBanner = () => {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length)
    }, 5000)

    return () => clearInterval(timer)
  }, [])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length)
  }

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl shadow-2xl">
          <div 
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {banners.map((banner) => (
              <div key={banner.id} className="w-full flex-shrink-0 relative">
                <div className={`bg-gradient-to-r ${banner.gradient} relative overflow-hidden`}>
                  <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[400px]">
                    {/* Content */}
                    <div className="flex items-center p-8 lg:p-12">
                      <div className="space-y-6 text-white">
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                          {banner.title}
                        </h2>
                        <p className="text-lg md:text-xl opacity-90 leading-relaxed">
                          {banner.subtitle}
                        </p>
                        <Button 
                          size="lg" 
                          className="bg-white text-gray-900 hover:bg-gray-100 font-semibold"
                          asChild
                        >
                          <a href={banner.link}>
                            {banner.cta}
                            <ArrowRight className="ml-2 h-5 w-5" />
                          </a>
                        </Button>
                      </div>
                    </div>

                    {/* Image */}
                    <div className="relative">
                      <img
                        src={banner.image}
                        alt={banner.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-full transition-all"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-full transition-all"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentSlide 
                    ? 'bg-white' 
                    : 'bg-white bg-opacity-50'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default AdBanner