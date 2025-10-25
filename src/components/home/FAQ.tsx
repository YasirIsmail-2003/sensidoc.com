import React, { useState } from 'react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'

const faqs = [
  {
    question: "How accurate is the AI diagnosis?",
    answer: "Our AI diagnosis system has been trained on millions of medical cases and achieves over 90% accuracy for common conditions. However, it should be used as a preliminary assessment and not replace professional medical advice."
  },
  {
    question: "Are the doctors on your platform verified?",
    answer: "Yes, all doctors on our platform are licensed medical professionals. We verify their credentials, licenses, and experience before allowing them to practice on our platform."
  },
  {
    question: "Is my health data secure?",
    answer: "Absolutely. We use bank-level encryption (256-bit SSL) and are HIPAA compliant. Your health data is stored securely and never shared without your explicit consent."
  },
  {
    question: "How much does a consultation cost?",
    answer: "Consultation fees vary by doctor and type of consultation. Chat consultations start from $25, video calls from $40, and in-person visits vary by location. Premium members get discounted rates."
  },
  {
    question: "Can I get a prescription through the platform?",
    answer: "Yes, licensed doctors can prescribe medications through our platform. Digital prescriptions are sent directly to your preferred pharmacy or can be downloaded."
  },
  {
    question: "What if I need emergency medical care?",
    answer: "For life-threatening emergencies, please call 911 immediately. Our platform is designed for non-emergency consultations and routine healthcare needs."
  },
  {
    question: "How do I cancel or reschedule an appointment?",
    answer: "You can cancel or reschedule appointments up to 2 hours before the scheduled time through your dashboard. Cancellations made less than 2 hours in advance may incur a fee."
  },
  {
    question: "Do you accept insurance?",
    answer: "We're working on insurance integration. Currently, we provide detailed receipts that you can submit to your insurance provider for potential reimbursement."
  },
  {
    question: "Can I access my health records anytime?",
    answer: "Yes, all your consultations, prescriptions, and health records are stored securely in your dashboard and can be accessed 24/7 from any device."
  },
  {
    question: "What happens if I'm not satisfied with a consultation?",
    answer: "We offer a satisfaction guarantee. If you're not satisfied with your consultation, please contact our support team within 24 hours for a full refund or free follow-up consultation."
  }
]

const FAQ = () => {
  const [showAll, setShowAll] = useState(false)
  const displayedFAQs = showAll ? faqs : faqs.slice(0, 5)

  return (
    <section className="py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600">
            Find answers to common questions about our healthcare platform
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {displayedFAQs.map((faq, index) => (
            <AccordionItem 
              key={index} 
              value={`item-${index}`}
              className="bg-gray-50 rounded-lg px-6 border-0"
            >
              <AccordionTrigger className="text-left font-semibold text-gray-900 hover:text-blue-600">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {/* Show More/Less Button - Only on mobile */}
        <div className="mt-8 text-center md:hidden">
          <Button
            variant="outline"
            onClick={() => setShowAll(!showAll)}
            className="w-full"
          >
            {showAll ? 'Show Less' : `View ${faqs.length - 5} More Questions`}
          </Button>
        </div>

        {/* Contact Support */}
        <div className="mt-12 text-center p-6 bg-blue-50 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Still have questions?
          </h3>
          <p className="text-gray-600 mb-4">
            Our support team is here to help you 24/7
          </p>
          <Button asChild>
            <a href="/contact">Contact Support</a>
          </Button>
        </div>
      </div>
    </section>
  )
}

export default FAQ