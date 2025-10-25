import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/hooks/useAuth'
import { 
  Search, 
  Filter, 
  Star, 
  Clock, 
  MapPin, 
  Video, 
  MessageCircle,
  Phone,
  Calendar,
  Stethoscope,
  Heart,
  Brain,
  Eye,
  Bone,
  Baby
} from 'lucide-react'
import { getDoctors, getSpecializations, createAppointment } from '@/lib/supabase'

const Doctors = () => {
  const { profile } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSpecialty, setSelectedSpecialty] = useState('')
  const [showOnlineOnly, setShowOnlineOnly] = useState(false)
  const [doctors, setDoctors] = useState<any[]>([])
  const [specializations, setSpecializations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null)
  const [showQuotaModal, setShowQuotaModal] = useState(false)
  const [bookingData, setBookingData] = useState({
    appointment_date: '',
    appointment_time: '',
    consultation_type: 'chat' as 'chat' | 'video' | 'visit', 
    symptoms: ''
  })

  useEffect(() => {
    loadDoctors()
    loadSpecializations()
  }, [])

  useEffect(() => {
    loadDoctors()
  }, [searchTerm, selectedSpecialty, showOnlineOnly])

  const loadDoctors = async () => {
    try {
      const filters: any = {}
      if (selectedSpecialty) filters.specialization = selectedSpecialty
      if (showOnlineOnly) filters.is_online = true
      
      const { data } = await getDoctors(filters)
      let filteredData = data || []
       
      if (searchTerm) {
        filteredData = filteredData.filter((doctor: any) =>
          doctor.profile?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doctor.city.toLowerCase().includes(searchTerm.toLowerCase())
        )
      }
      
      setDoctors(filteredData)
    } catch (error) {
      console.error('Error loading doctors:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadSpecializations = async () => {
    try {
      const { data } = await getSpecializations()
      setSpecializations(data || []) 
    } catch (error) {
      console.error('Error loading specializations:', error)
    }
  }

  const handleBookConsultation = (doctor: any, type: 'chat' | 'video' | 'visit') => {
    if (!profile) {
      alert('Please login to book an appointment') 
      return
    }
    setSelectedDoctor(doctor)
    setBookingData({ ...bookingData, consultation_type: type })
  }

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile || !selectedDoctor) return

    try {
      const appointmentData = {
        patient_id: profile.id,
        doctor_id: selectedDoctor.id,
        appointment_date: bookingData.appointment_date,
        appointment_time: bookingData.appointment_time,
        consultation_type: bookingData.consultation_type,
        symptoms: bookingData.symptoms,
        status: 'pending'
      }
      const res = await createAppointment(appointmentData)
      if (res?.error) {
        if (res.error.message && res.error.message.toLowerCase().includes('quota')) {
          // Show subscription modal
          setShowQuotaModal(true)
          return
        }
        throw res.error
      }

      alert('Appointment booked successfully!')
      setSelectedDoctor(null)
      setBookingData({
        appointment_date: '',
        appointment_time: '',
        consultation_type: 'chat',
        symptoms: ''
      })
    } catch (error) {
      console.error('Error booking appointment:', error)
      alert('Failed to book appointment. Please try again.') 
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Find & Consult Doctors</h1>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Connect with verified doctors for instant consultations via chat, video, or phone
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Filters */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Filter className="h-5 w-5 mr-2" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Search */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search doctors, specialties..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Online Only Toggle */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="online-only"
                    checked={showOnlineOnly} 
                    onChange={(e) => setShowOnlineOnly(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="online-only" className="text-sm font-medium">
                    Show online doctors only
                  </label>
                </div>

                {/* Specializations */}
                <div>
                  <label className="text-sm font-medium mb-3 block">Specializations</label>
                  <div className="space-y-2">
                    <button
                      onClick={() => setSelectedSpecialty('')}
                      className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors ${ 
                        selectedSpecialty === ''
                          ? 'bg-blue-100 text-blue-700 border border-blue-200'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center">
                        <Stethoscope className="h-4 w-4 mr-2" />
                        <span className="text-sm">All Specialties</span> 
                      </div>
                      <span className="text-xs bg-gray-200 px-2 py-1 rounded-full">
                        {doctors.length}
                      </span>
                    </button>
                    {specializations.map((specialty) => (
                      <button
                        key={specialty.id}
                        onClick={() => setSelectedSpecialty(specialty.name)}
                        className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors ${ 
                          selectedSpecialty === specialty.name
                            ? 'bg-blue-100 text-blue-700 border border-blue-200'
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center">
                          <span className="text-lg mr-2">🩺</span>
                          <span className="text-sm">{specialty.name}</span> 
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content - Doctors List */}
          <div className="lg:col-span-3">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Available Doctors ({doctors.length}) 
                </h2>
                <p className="text-gray-600">
                  {showOnlineOnly ? 'Online doctors ready for consultation' : 'All verified doctors'}
                </p>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="space-y-6">
                {doctors.map((doctor) => (
                  <Card key={doctor.id} className="hover:shadow-lg transition-shadow"> 
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row gap-6">
                        {/* Doctor Info */}
                        <div className="flex items-start space-x-4 flex-1">
                          <div className="relative">
                            <Avatar className="h-20 w-20">
                              <AvatarImage src={doctor.profile_image} alt={doctor.profile?.full_name} />
                              <AvatarFallback>{doctor.profile?.full_name?.charAt(0) || 'D'}</AvatarFallback>
                            </Avatar>
                            {doctor.is_online && (
                              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-2 border-white rounded-full flex items-center justify-center">
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="text-xl font-semibold text-gray-900">Dr. {doctor.profile?.full_name}</h3>
                              {doctor.is_verified && ( 
                                <Badge variant="success" className="text-xs">Verified</Badge>
                              )}
                              {doctor.is_online && (
                                <Badge className="text-xs bg-green-100 text-green-700">Online</Badge>
                              )}
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center text-gray-600">
                                <Stethoscope className="h-4 w-4 mr-2" /> 
                                <span>{doctor.specialization} • {doctor.experience_years} years exp.</span>
                              </div>

                              <div className="flex items-center text-gray-600">
                                <MapPin className="h-4 w-4 mr-2" />
                                <span>{doctor.city || 'Location not specified'}</span>
                              </div>

                              <div className="flex items-center text-gray-600">
                                <Star className="h-4 w-4 mr-2 text-yellow-500" /> 
                                <span>{doctor.rating}/5 ({doctor.total_consultations} consultations)</span>
                              </div>

                              <div className="flex items-center text-gray-600">
                                <Clock className="h-4 w-4 mr-2" />
                                <span>Available for consultation</span>
                              </div>
                            </div>

                            <p className="text-gray-600 mt-3 text-sm">{doctor.bio || 'Experienced healthcare professional'}</p>

                            <div className="flex flex-wrap gap-1 mt-3">
                              {['English', 'Hindi'].map((lang: string) => (
                                <Badge key={lang} variant="outline" className="text-xs">
                                  {lang}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Consultation Options */}
                        <div className="md:w-64 space-y-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900">₹{doctor.consultation_fee || 500}</div>
                            <div className="text-sm text-gray-600">per consultation</div>
                          </div>

                          <div className="space-y-2">
                            <Button
                              onClick={() => handleBookConsultation(doctor, 'chat')}
                              className="w-full"
                              variant="outline"
                            >
                              <MessageCircle className="h-4 w-4 mr-2" />
                              Chat Now
                            </Button>

                            <Button
                              onClick={() => handleBookConsultation(doctor, 'video')}
                              className="w-full"
                              variant="outline"
                            >
                              <Video className="h-4 w-4 mr-2" />
                              Video Call
                            </Button>

                            <Button
                              onClick={() => handleBookConsultation(doctor, 'visit')}
                              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                            >
                              <Phone className="h-4 w-4 mr-2" />
                              Book Consultation
                            </Button>
                          </div>

                          <div>
                            <Button
                              variant="ghost"
                              className="w-full text-blue-600 hover:text-blue-700"
                            >
                              <Calendar className="h-4 w-4 mr-2" />
                              View Profile
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* No Results */}
            {!loading && doctors.length === 0 && (
              <div className="text-center py-12">
                <Stethoscope className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No doctors found</h3>
                <p className="text-gray-600 mb-4"> 
                  Try adjusting your filters or search terms
                </p>
                <Button
                  onClick={() => {
                    setSearchTerm('')
                    setSelectedSpecialty('')
                    setShowOnlineOnly(false)
                  }}
                  variant="outline"
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {selectedDoctor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md"> 
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Book Appointment</h2>
              <Button variant="ghost" onClick={() => setSelectedDoctor(null)}>
                ×
              </Button>
            </div>

            <div className="mb-4">
              <div className="flex items-center space-x-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={selectedDoctor.profile_image} />
                  <AvatarFallback>{selectedDoctor.profile?.full_name?.charAt(0) || 'D'}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">Dr. {selectedDoctor.profile?.full_name}</h3>
                  <p className="text-sm text-gray-600">{selectedDoctor.specialization || 'General Medicine'}</p>
                  <p className="text-sm font-medium text-green-600">₹{selectedDoctor.consultation_fee || 500}</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleBookAppointment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <Input
                  type="date"
                  value={bookingData.appointment_date} 
                  onChange={(e) => setBookingData({...bookingData, appointment_date: e.target.value})}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                <Input
                  type="time"
                  value={bookingData.appointment_time} 
                  onChange={(e) => setBookingData({...bookingData, appointment_time: e.target.value})}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Consultation Type</label>
                <select
                  value={bookingData.consultation_type}
                  onChange={(e) => setBookingData({...bookingData, consultation_type: e.target.value as any})} 
                  className="w-full border rounded-md px-3 py-2"
                >
                  <option value="chat">Chat Consultation</option>
                  <option value="video">Video Call</option>
                  <option value="visit">In-Person Visit</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Symptoms (Optional)</label>
                <textarea
                  value={bookingData.symptoms}
                  onChange={(e) => setBookingData({...bookingData, symptoms: e.target.value})} 
                  className="w-full border rounded-md px-3 py-2 h-20"
                  placeholder="Describe your symptoms..."
                />
              </div>

              <div className="flex space-x-4">
                <Button type="button" variant="outline" onClick={() => setSelectedDoctor(null)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  Book Appointment
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quota Modal */}
      {showQuotaModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Quota exceeded</h3>
              <Button variant="ghost" onClick={() => setShowQuotaModal(false)}>Close</Button>
            </div>
            <p className="mb-4">You've reached your monthly appointment quota. Upgrade your subscription to book more appointments.</p>
            <div className="flex justify-end">
              <Button onClick={() => window.location.href = '/subscriptions'}>Upgrade</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Doctors 