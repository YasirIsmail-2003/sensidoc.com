import React from 'react'

const partners = [
  {
    name: "HealthTech Solutions",
    logo: "https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=200&h=100&fit=crop"
  },
  {
    name: "MedCare Plus",
    logo: "https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=200&h=100&fit=crop"
  },
  {
    name: "Digital Health Co",
    logo: "https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=200&h=100&fit=crop"
  },
  {
    name: "WellCare Systems",
    logo: "https://images.pexels.com/photos/3184341/pexels-photo-3184341.jpeg?auto=compress&cs=tinysrgb&w=200&h=100&fit=crop"
  },
  {
    name: "Smart Medicine",
    logo: "https://images.pexels.com/photos/3184357/pexels-photo-3184357.jpeg?auto=compress&cs=tinysrgb&w=200&h=100&fit=crop"
  },
  {
    name: "TeleHealth Pro",
    logo: "https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=200&h=100&fit=crop"
  }
]

const Partners = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Trusted Partners
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We collaborate with leading healthcare organizations to provide you with the best care
          </p>
        </div>

        {/* Desktop Grid */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-8">
          {partners.map((partner, index) => (
            <div
              key={index}
              className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-300 flex items-center justify-center"
            >
              <div className="text-center">
                <img
                  src={partner.logo}
                  alt={partner.name}
                  className="h-16 w-auto mx-auto mb-3 object-contain filter grayscale hover:grayscale-0 transition-all duration-300"
                />
                <h3 className="text-sm font-medium text-gray-700">
                  {partner.name}
                </h3>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Horizontal Scroll */}
        <div className="md:hidden">
          <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
            {partners.map((partner, index) => (
              <div
                key={index}
                className="flex-shrink-0 bg-white rounded-lg p-4 shadow-sm w-40 text-center"
              >
                <img
                  src={partner.logo}
                  alt={partner.name}
                  className="h-12 w-auto mx-auto mb-2 object-contain filter grayscale"
                />
                <h3 className="text-xs font-medium text-gray-700">
                  {partner.name}
                </h3>
              </div>
            ))}
          </div>
        </div>

        {/* Partnership CTA */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">
            Interested in partnering with us?
          </p>
          <a
            href="/legal/advertise"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Become a Partner
          </a>
        </div>
      </div>
    </section>
  )
}

export default Partners