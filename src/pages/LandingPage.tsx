import Nav from '../components/landing/Nav'
import Hero from '../components/landing/Hero'
import FeaturedStays from '../components/landing/FeaturedStays'
import Destinations from '../components/landing/Destinations'
import GuestExperience from '../components/landing/GuestExperience'
import HowItWorks from '../components/landing/HowItWorks'
import TrustSection from '../components/landing/TrustSection'
import HostCTA from '../components/landing/HostCTA'
import Stats from '../components/landing/Stats'
import FinalCTA from '../components/landing/FinalCTA'
import Footer from '../components/landing/Footer'

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#FDFCFA', overflowX: 'hidden' }}>
      <Nav />
      <Hero />
      <FeaturedStays />
      <Destinations />
      <GuestExperience />
      <HowItWorks />
      <TrustSection />
      <HostCTA />
      <Stats />
      <FinalCTA />
      <Footer />
    </div>
  )
}
