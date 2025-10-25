import React from 'react'
import Hero from '@/components/home/Hero'
import AdBanner from '@/components/home/AdBanner'
import HowToStart from '@/components/home/HowToStart'
import Services from '@/components/home/Services'
import WhyChooseUs from '@/components/home/WhyChooseUs'
import Partners from '@/components/home/Partners'
import FAQ from '@/components/home/FAQ'

const Home = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <AdBanner />
      <HowToStart />
      <Services />
      <WhyChooseUs />
      <Partners />
      <FAQ />
    </div>
  )
}

export default Home