import React, { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth' 
import { Navigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { 
  Calendar, 
  Clock, 
  User, 
  CheckCircle, 
  XCircle, 
  Star,
  TrendingUp,
  DollarSign,
  Users,
  Activity,
  Phone,
  Video,
  MessageCircle,
  FileText,
  Stethoscope,
  Award,
  Eye,
  Edit
} from 'lucide-react'
import { 
  getAppointments, 
  updateAppointmentStatus, 
  getAllDoctors,
  updateDoctor
} from '@/lib/supabase'

const DoctorDashboard = () => {
  const { profile, loading } = useAuth()
  const [appointments, setAppointments] = useState<any[]>([])
  const [doctorProfile, setDoctorProfile] = useState<any>(null) 
  const [stats, setStats] = useState({
    totalAppointments: 0,
    pendingAppointments: 0,
    completedAppointments: 0,
    todayAppointments: 0,
    totalEarnings: 0,
    rating: 0,
    totalReviews: 0
  })
  const [activeTab, setActiveTab] = useState('overview')
  const [isLoading, setIsLoading] = useState(true) 
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null)
  const [appointmentNotes, setAppointmentNotes] = useState('')
  const [prescription, setPrescription] = useState('')
  const [diagnosis, setDiagnosis] = useState('')

  useEffect(() => {
    if (profile?.role === 'doctor') {
      loadDoctorData() 
    }
  }, [profile])

  const loadDoctorData = async () => {
    if (!profile) return
    
    setIsLoading(true)
    try {
      // Load appointments
      const appointmentsData = await getAppointments(profile.id, 'doctor') 
      setAppointments(appointmentsData.data || [])

      // Load doctor profile
      const { data: doctors } = await getAllDoctors()
      const doctorData = doctors?.find((d: any) => d.user_id === profile.id)
      if (doctorData) {
        setDoctorProfile(doctorData)
      }

      // Calculate stats
      const appointments = appointmentsData.data || [] 
      const today = new Date().toDateString()
      
      const todayAppointments = appointments.filter(a => 
        new Date(a.appointment_date).toDateString() === today
      )
      
      const completedAppointments = appointments.filter(a => a.status === 'completed')
      const totalEarnings = completedAppointments.reduce((sum, a) =>  
        sum + (a.consultation_fee || doctorData?.consultation_fee || 0), 0
      )

      setStats({
        totalAppointments: appointments.length,
        pendingAppointments: appointments.filter(a => a.status === 'pending').length,
        completedAppointments: completedAppointments.length,
        todayAppointments: todayAppointments.length,
        totalEarnings,
        rating: doctorData?.rating || 0, 
        totalReviews: doctorData?.total_reviews || 0
      })
    } catch (error) {
      console.error('Error loading doctor data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAppointmentAction = async (appointmentId: string, status: string, notes?: string) => {
    try { 
      const updates: any = { status }
      if (notes) updates.doctor_notes = notes
      if (prescription) updates.prescription = prescription
      if (diagnosis) updates.diagnosis = diagnosis

      await updateAppointmentStatus(appointmentId, status as any, updates)
      loadDoctorData() // Refresh data
      setSelectedAppointment(null)
      setAppointmentNotes('')
      setPrescription('')
      setDiagnosis('')
      alert(`Appointment ${status} successfully!`)
    } catch (error) {
      console.error('Error updating appointment:', error)
      alert('Failed to update appointment. Please try again.')
    }
  }

  const handleUpdateOnlineStatus = async (isOnline: boolean) => {
    if (!doctorProfile) return 
    
    try {
      await updateDoctor(doctorProfile.id, { is_online: isOnline })
      setDoctorProfile({ ...doctorProfile, is_online: isOnline })
      alert(`You are now ${isOnline ? 'online' : 'offline'}`)
    } catch (error) {
      console.error('Error updating online status:', error)
      alert('Failed to update status. Please try again.')
    }
  }

  if (loading) {
    return ( 
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!profile || profile.role !== 'doctor') {
    return <Navigate to="/login" replace /> 
  }

  const todayAppointments = appointments.filter(a => 
    new Date(a.appointment_date).toDateString() === new Date().toDateString()
  )

  const upcomingAppointments = appointments.filter(a => 
    new Date(a.appointment_date) >= new Date() && a.status !== 'completed' && a.status !== 'cancelled' 
  ).sort((a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime())

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-12 w-12"> 
                <AvatarImage src={doctorProfile?.profile_image} />
                <AvatarFallback>{profile.full_name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dr. {profile.full_name}</h1>
                <p className="text-gray-600">{doctorProfile?.specialization}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant={doctorProfile?.is_online ? "destructive" : "default"} 
                onClick={() => handleUpdateOnlineStatus(!doctorProfile?.is_online)}
              >
                {doctorProfile?.is_online ? 'Go Offline' : 'Go Online'}
              </Button>
              <Badge variant={doctorProfile?.is_online ? 'success' : 'secondary'}>
                {doctorProfile?.is_online ? 'Online' : 'Offline'}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger> 
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="patients">Patients</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white"> 
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100">Today's Appointments</p>
                      <p className="text-3xl font-bold">{stats.todayAppointments}</p>
                    </div>
                    <Calendar className="h-12 w-12 text-blue-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white"> 
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100">Total Patients</p>
                      <p className="text-3xl font-bold">{stats.completedAppointments}</p>
                    </div>
                    <Users className="h-12 w-12 text-green-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white"> 
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100">Total Earnings</p>
                      <p className="text-3xl font-bold">₹{stats.totalEarnings.toLocaleString()}</p>
                    </div>
                    <DollarSign className="h-12 w-12 text-purple-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white"> 
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100">Rating</p>
                      <p className="text-3xl font-bold">{stats.rating}/5</p>
                    </div>
                    <Star className="h-12 w-12 text-orange-200" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Today's Schedule */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6"> 
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    Today's Schedule
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {todayAppointments.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No appointments today</p> 
                  ) : (
                    <div className="space-y-4">
                      {todayAppointments.slice(0, 5).map((appointment) => (
                        <div key={appointment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>{appointment.patient?.full_name?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">{appointment.patient?.full_name}</p>
                              <p className="text-xs text-gray-500">{appointment.appointment_time}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={
                              appointment.consultation_type === 'video' ? 'default' : 
                              appointment.consultation_type === 'chat' ? 'secondary' : 'outline'
                            }>
                              {appointment.consultation_type}
                            </Badge>
                            <Badge variant={
                              appointment.status === 'confirmed' ? 'success' :
                              appointment.status === 'pending' ? 'warning' : 'secondary'
                            }>
                              {appointment.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card> 
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="h-5 w-5 mr-2" />
                    Quick Stats
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between"> 
                      <span className="text-sm text-gray-600">Pending Appointments</span>
                      <span className="font-semibold">{stats.pendingAppointments}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Completed This Month</span>
                      <span className="font-semibold">{stats.completedAppointments}</span>
                    </div>
                    <div className="flex items-center justify-between"> 
                      <span className="text-sm text-gray-600">Average Rating</span>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="font-semibold">{stats.rating}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Reviews</span> 
                      <span className="font-semibold">{stats.totalReviews}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Appointments Tab */}
          <TabsContent value="appointments" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Appointment Management</h2> 
              <div className="flex items-center space-x-4">
                <Badge variant="outline">{appointments.length} Total</Badge>
                <Badge variant="warning">{stats.pendingAppointments} Pending</Badge>
                <Badge variant="success">{stats.completedAppointments} Completed</Badge>
              </div>
            </div>

            {/* Pending Appointments */}
            <Card>
              <CardHeader>
                <CardTitle>Pending Appointments</CardTitle> 
                <CardDescription>Appointments waiting for your response</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-end mb-4">
                  <Button variant="outline" onClick={() => {
                    const rows = [['Patient','Email','Date','Time','Type'], ...appointments.filter(a=>a.status==='pending').map(a=>[a.patient?.full_name||'',a.patient?.email||'',new Date(a.appointment_date).toISOString(),a.appointment_time,a.consultation_type])] 
                    const csv = rows.map(r=>r.join(',')).join('\n')
                    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = 'pending-appointments.csv'
                    a.click()
                    URL.revokeObjectURL(url)
                  }}>Export CSV</Button>
                </div>
                {appointments.filter(a => a.status === 'pending').length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No pending appointments</p>
                ) : (
                  <div className="space-y-4">
                    {appointments.filter(a => a.status === 'pending').map((appointment) => (
                      <div key={appointment.id} className="border rounded-lg p-4"> 
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4">
                            <Avatar className="h-12 w-12">
                              <AvatarFallback>{appointment.patient?.full_name?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <h3 className="font-semibold">{appointment.patient?.full_name}</h3>
                              <p className="text-sm text-gray-600">{appointment.patient?.email}</p>
                              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                                <span className="flex items-center">
                                  <Calendar className="h-4 w-4 mr-1" /> 
                                  {new Date(appointment.appointment_date).toLocaleDateString()}
                                </span>
                                <span className="flex items-center">
                                  <Clock className="h-4 w-4 mr-1" />
                                  {appointment.appointment_time}
                                </span>
                                <Badge variant="outline">{appointment.consultation_type}</Badge>
                              </div>
                              {appointment.symptoms && (
                                <div className="mt-3">
                                  <p className="text-sm font-medium text-gray-700">Symptoms:</p> 
                                  <p className="text-sm text-gray-600">{appointment.symptoms}</p>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm" 
                              variant="outline"
                              onClick={() => handleAppointmentAction(appointment.id, 'rejected')}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleAppointmentAction(appointment.id, 'confirmed')}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Accept
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Upcoming Appointments */}
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Appointments</CardTitle> 
                <CardDescription>Confirmed appointments scheduled</CardDescription>
              </CardHeader>
              <CardContent>
                {upcomingAppointments.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No upcoming appointments</p>
                ) : (
                  <div className="space-y-4">
                    {upcomingAppointments.map((appointment) => (
                      <div key={appointment.id} className="border rounded-lg p-4"> 
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4">
                            <Avatar className="h-12 w-12">
                              <AvatarFallback>{appointment.patient?.full_name?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <h3 className="font-semibold">{appointment.patient?.full_name}</h3>
                              <p className="text-sm text-gray-600">{appointment.patient?.email}</p>
                              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                                <span className="flex items-center">
                                  <Calendar className="h-4 w-4 mr-1" /> 
                                  {new Date(appointment.appointment_date).toLocaleDateString()}
                                </span>
                                <span className="flex items-center">
                                  <Clock className="h-4 w-4 mr-1" />
                                  {appointment.appointment_time}
                                </span>
                                <Badge variant="outline">{appointment.consultation_type}</Badge>
                                <Badge variant="success">{appointment.status}</Badge>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {appointment.consultation_type === 'video' && (
                              <Button size="sm" variant="outline"> 
                                <Video className="h-4 w-4 mr-1" />
                                Join Call
                              </Button>
                            )}
                            {appointment.consultation_type === 'chat' && (
                              <Button size="sm" variant="outline">
                                <MessageCircle className="h-4 w-4 mr-1" />
                                Chat
                              </Button>
                            )}
                            <Button
                              size="sm" 
                              onClick={() => setSelectedAppointment(appointment)}
                            >
                              <FileText className="h-4 w-4 mr-1" />
                              Complete
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Patients Tab */}
          <TabsContent value="patients" className="space-y-6">
            <h2 className="text-xl font-semibold">Patient History</h2>
             
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Visit</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diagnosis</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {appointments.filter(a => a.status === 'completed').map((appointment) => (
                        <tr key={appointment.id} className="hover:bg-gray-50"> 
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>{appointment.patient?.full_name?.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900">{appointment.patient?.full_name}</div>
                                <div className="text-sm text-gray-500">{appointment.patient?.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{new Date(appointment.appointment_date).toLocaleDateString()}</div>
                            <div className="text-sm text-gray-500">{appointment.appointment_time}</div> 
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{appointment.diagnosis || 'Not specified'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant="success">Completed</Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <Button size="sm" variant="outline"> 
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <FileText className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <h2 className="text-xl font-semibold">Doctor Profile</h2>
             
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Professional Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Specialization</label> 
                    <p className="text-sm text-gray-900">{doctorProfile?.specialization}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Qualification</label>
                    <p className="text-sm text-gray-900">{doctorProfile?.qualification}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Experience</label>
                    <p className="text-sm text-gray-900">{doctorProfile?.experience_years} years</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">License Number</label> 
                    <p className="text-sm text-gray-900">{doctorProfile?.license_number}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Consultation Fee</label>
                    <p className="text-sm text-gray-900">₹{doctorProfile?.consultation_fee}</p>
                  </div>
                </CardContent>
              </Card>

              <Card> 
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Email</label>
                    <p className="text-sm text-gray-900">{profile.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Phone</label>
                    <p className="text-sm text-gray-900">{profile.phone}</p>
                  </div> 
                  <div>
                    <label className="text-sm font-medium text-gray-700">Hospital/Clinic</label>
                    <p className="text-sm text-gray-900">{doctorProfile?.hospital_name || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">City</label>
                    <p className="text-sm text-gray-900">{doctorProfile?.city}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card> 
              <CardHeader>
                <CardTitle>Bio</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-900">{doctorProfile?.bio || 'No bio available'}</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Complete Appointment Modal */}
      {selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"> 
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Complete Appointment</h2>
              <Button variant="ghost" onClick={() => setSelectedAppointment(null)}>
                <XCircle className="h-5 w-5" />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <Avatar className="h-12 w-12"> 
                  <AvatarFallback>{selectedAppointment.patient?.full_name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{selectedAppointment.patient?.full_name}</h3>
                  <p className="text-sm text-gray-600">{selectedAppointment.patient?.email}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(selectedAppointment.appointment_date).toLocaleDateString()} at {selectedAppointment.appointment_time}
                  </p>
                </div>
              </div>

              {selectedAppointment.symptoms && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Patient Symptoms</label> 
                  <p className="text-sm text-gray-900 p-3 bg-gray-50 rounded-lg">{selectedAppointment.symptoms}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Diagnosis</label>
                <Textarea
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder="Enter diagnosis..."
                  rows={3}
                />
              </div>

              <div> 
                <label className="block text-sm font-medium text-gray-700 mb-2">Prescription</label>
                <Textarea
                  value={prescription}
                  onChange={(e) => setPrescription(e.target.value)}
                  placeholder="Enter prescription details..."
                  rows={4}
                />
              </div>

              <div> 
                <label className="block text-sm font-medium text-gray-700 mb-2">Doctor Notes</label>
                <Textarea
                  value={appointmentNotes}
                  onChange={(e) => setAppointmentNotes(e.target.value)}
                  placeholder="Enter additional notes..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-4">
                <Button variant="outline" onClick={() => setSelectedAppointment(null)}> 
                  Cancel
                </Button>
                <Button onClick={() => handleAppointmentAction(selectedAppointment.id, 'completed', appointmentNotes)}>
                  Complete Appointment
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DoctorDashboard