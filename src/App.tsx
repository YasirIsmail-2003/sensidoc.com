// ...existing code...
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from '@/components/ProtectedRoute'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

// Pages
import Home from '@/pages/Home'
import Login from '@/pages/auth/Login'
import Signup from '@/pages/auth/Signup'
import Doctors from '@/pages/Doctors'
import AIDiagnosis from '@/pages/AIDiagnosis'
import Drugs from '@/pages/Drugs'
import Blog from '@/pages/Blog'
import Contact from '@/pages/Contact'
import TermsOfService from '@/pages/legal/TermsOfService'
import PrivacyPolicy from '@/pages/legal/PrivacyPolicy'
import Disclaimer from '@/pages/legal/Disclaimer'
import Grievance from '@/pages/legal/Grievance'
import Refund from '@/pages/legal/Refund'
import AdminDashboard from '@/pages/admin/AdminDashboard'
import AdminLogin from '@/pages/admin/Login'
import DoctorLogin from '@/pages/doctor/Login'
import DoctorDashboard from '@/pages/doctor/DoctorDashboard'
import Subscriptions from '@/pages/Subscriptions'
import PatientDashboard from '@/pages/patient/PatientDashboard'
import Chat from '@/pages/Chat'
import AuthProvider from '@/components/AuthProvider'

function App() {
  return (
    <Router>
      <AuthProvider> 
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              {/* Redirect old admin login path to workstation */}
              <Route path="/admin/login" element={<Navigate to="/workstation/login" replace />} />
              <Route path="/doctor/login" element={<DoctorLogin />} />
              <Route path="/ai-diagnosis" element={<AIDiagnosis />} />
              <Route path="/doctors" element={<Doctors />} />
              <Route path="/drugs" element={<Drugs />} />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <PatientDashboard />
                </ProtectedRoute>
              } />
              <Route path="/subscriptions" element={
                <ProtectedRoute>
                  <Subscriptions />
                </ProtectedRoute>
              } />
              {/* Workstation admin area */}
              <Route path="/workstation/dashboard" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              {/* Redirect old admin dashboard path to workstation dashboard */}
              <Route path="/admin/dashboard" element={<Navigate to="/workstation/dashboard" replace />} />
              <Route path="/doctor/dashboard" element={
                <ProtectedRoute requiredRole="doctor">
                  <DoctorDashboard />
                </ProtectedRoute>
              } />
              <Route path="/workstation/login" element={<Login role="admin" />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/legal/terms" element={<TermsOfService />} />
              <Route path="/legal/privacy" element={<PrivacyPolicy />} />
              <Route path="/legal/disclaimer" element={<Disclaimer />} />
              <Route path="/legal/grievance" element={<Grievance />} />
              <Route path="/legal/refund" element={<Refund />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  )
}

export default App