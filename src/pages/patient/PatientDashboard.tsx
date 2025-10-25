import React, { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Navigate, Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Calendar, 
  Clock, 
  User, 
  Heart,
  Brain,
  Pill,
  FileText,
  Activity,
  Phone,
  Video,
  MessageCircle,
  Star,
  MapPin,
  Stethoscope,
  Plus,
  Eye
} from 'lucide-react'
import { getAppointments } from '@/lib/supabase'

const PatientDashboard = () => {
  const { profile, loading } = useAuth()
  const [appointments, setAppointments] = useState<any[]>([])
  const [stats, setStats] = useState({
    totalAppointments: 0,
    upcomingAppointments: 0,
    completedAppointments: 0,
    aiDiagnosisUsed: 2
  })
  const [activeTab, setActiveTab] = useState('overview')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (profile?.role === 'patient') {
      loadPatientData()
    }
  }, [profile])

  const loadPatientData = async () => {
    if (!profile) return
    
    setIsLoading(true)
    try {
      // Load appointments
      const appointmentsData = await getAppointments(profile.id, 'patient')
      setAppointments(appointmentsData.data || [])

      // Calculate stats
      const appointments = appointmentsData.data || []
      const upcoming = appointments.filter(a => 
        new Date(a.appointment_date) >= new Date() && 
        ['pending', 'confirmed'].includes(a.status)
      )
      const completed = appointments.filter(a => a.status === 'completed')

      setStats({
        totalAppointments: appointments.length,
        upcomingAppointments: upcoming.length,
        completedAppointments: completed.length,
        aiDiagnosisUsed: 2
      })
    } catch (error) {
      console.error('Error loading patient data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!profile || profile.role !== 'patient') {
    return <Navigate to="/login" replace />
  }

  const upcomingAppointments = appointments.filter(a => 
    new Date(a.appointment_date) >= new Date() && 
    ['pending', 'confirmed'].includes(a.status)
  ).sort((a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime())

  const recentAppointments = appointments.filter(a => a.status === 'completed')
    .sort((a, b) => new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime())
    .slice(0, 5)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src="" />
                <AvatarFallback>{profile.full_name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Welcome, {profile.full_name}</h1>
                <p className="text-gray-600">Patient Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant={profile.membership_type === 'premium' ? 'default' : 'secondary'}>
                {profile.membership_type} Member
              </Badge>
              <Link to="/subscriptions">
                <Button variant="outline">Manage Subscription</Button>
              </Link>
              <Link to="/ai-diagnosis">
                <Button>
                  <Brain className="h-4 w-4 mr-2" />
                  AI Diagnosis
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="records">Health Records</TabsTrigger>
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
                      <p className="text-blue-100">Upcoming</p>
                      <p className="text-3xl font-bold">{stats.upcomingAppointments}</p>
                    </div>
                    <Calendar className="h-12 w-12 text-blue-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100">Completed</p>
                      <p className="text-3xl font-bold">{stats.completedAppointments}</p>
                    </div>
                    <Heart className="h-12 w-12 text-green-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100">AI Diagnosis</p>
                      <p className="text-3xl font-bold">{stats.aiDiagnosisUsed}/3</p>
                    </div>
                    <Brain className="h-12 w-12 text-purple-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100">Health Score</p>
                      <p className="text-3xl font-bold">85%</p>
                    </div>
                    <Activity className="h-12 w-12 text-orange-200" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Link to="/ai-diagnosis">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <Brain className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                    <h3 className="font-semibold text-gray-900">AI Diagnosis</h3>
                    <p className="text-sm text-gray-600">Get instant health insights</p>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/doctors">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <Stethoscope className="h-12 w-12 text-green-600 mx-auto mb-4" />
                    <h3 className="font-semibold text-gray-900">Find Doctors</h3>
                    <p className="text-sm text-gray-600">Book appointments</p>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/drugs">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <Pill className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                    <h3 className="font-semibold text-gray-900">Drug Info</h3>
                    <p className="text-sm text-gray-600">Search medications</p>
                  </CardContent>
                </Card>
              </Link>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <FileText className="h-12 w-12 text-orange-600 mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-900">Health Records</h3>
                  <p className="text-sm text-gray-600">View your records</p>
                </CardContent>
              </Card>
            </div>

            {/* Upcoming Appointments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Upcoming Appointments
                </CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingAppointments.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">No upcoming appointments</p>
                    <Link to="/doctors">
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Book Appointment
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcomingAppointments.slice(0, 3).map((appointment) => (
                      <div key={appointment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback>Dr</AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold">Dr. {appointment.doctor?.profile?.full_name || 'Doctor'}</h3>
                            <p className="text-sm text-gray-600">{appointment.doctor?.specialization || 'General Medicine'}</p>
                            <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                              <span className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                {new Date(appointment.appointment_date).toLocaleDateString()}
                              </span>
                              <span className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                {appointment.appointment_time}
                              </span>
                            </div>
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
                          <Link to="/doctors">
                            <Button size="sm" variant="outline">Book Again</Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appointments Tab */}
          <TabsContent value="appointments" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">My Appointments</h2>
              <Link to="/doctors">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Book New Appointment
                </Button>
              </Link>
            </div>

            <div className="space-y-4">
              {appointments.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No appointments yet</h3>
                    <p className="text-gray-600 mb-4">Book your first appointment with our verified doctors</p>
                    <Link to="/doctors">
                      <Button>Find Doctors</Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                appointments.map((appointment) => (
                  <Card key={appointment.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback>Dr</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">Dr. {appointment.doctor?.profile?.full_name || 'Doctor'}</h3>
                            <p className="text-gray-600">{appointment.doctor?.specialization || 'General Medicine'}</p>
                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                              <span className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                {new Date(appointment.appointment_date).toLocaleDateString()}
                              </span>
                              <span className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                {appointment.appointment_time}
                              </span>
                              <span className="flex items-center">
                                <MapPin className="h-4 w-4 mr-1" />
                                {appointment.doctor?.city || 'Online'}
                              </span>
                            </div>
                            {appointment.symptoms && (
                              <div className="mt-3">
                                <p className="text-sm font-medium text-gray-700">Symptoms:</p>
                                <p className="text-sm text-gray-600">{appointment.symptoms}</p>
                              </div>
                            )}
                            {appointment.prescription && (
                              <div className="mt-3">
                                <p className="text-sm font-medium text-gray-700">Prescription:</p>
                                <p className="text-sm text-gray-600">{appointment.prescription}</p>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <Badge variant={
                            appointment.status === 'completed' ? 'success' :
                            appointment.status === 'confirmed' ? 'default' :
                            appointment.status === 'pending' ? 'warning' :
                            'destructive'
                          }>
                            {appointment.status}
                          </Badge>
                          <Badge variant="outline">
                            {appointment.consultation_type}
                          </Badge>
                          <p className="text-sm font-medium text-gray-900">
                            ₹{appointment.doctor?.consultation_fee || 500}
                          </p>
                          <p className="text-xs text-gray-500">Booked: {new Date(appointment.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Health Records Tab */}
          <TabsContent value="records" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Health Records</h2>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Record
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Blood Test Results</h3>
                      <p className="text-sm text-gray-500">Jan 15, 2024</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">Complete blood count and lipid profile results</p>
                  <Button size="sm" variant="outline" className="w-full">
                    <Eye className="h-4 w-4 mr-2" />
                    View Report
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Heart className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">ECG Report</h3>
                      <p className="text-sm text-gray-500">Jan 10, 2024</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">Electrocardiogram showing normal heart rhythm</p>
                  <Button size="sm" variant="outline" className="w-full">
                    <Eye className="h-4 w-4 mr-2" />
                    View Report
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Pill className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Prescription</h3>
                      <p className="text-sm text-gray-500">Jan 8, 2024</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">Medication prescribed for cold and fever</p>
                  <Button size="sm" variant="outline" className="w-full">
                    <Eye className="h-4 w-4 mr-2" />
                    View Prescription
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <h2 className="text-xl font-semibold">Profile Settings</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Full Name</label>
                    <p className="text-sm text-gray-900">{profile.full_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Email</label>
                    <p className="text-sm text-gray-900">{profile.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Phone</label>
                    <p className="text-sm text-gray-900">{profile.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Member Since</label>
                    <p className="text-sm text-gray-900">{new Date(profile.created_at).toLocaleDateString()}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Membership Type</label>
                    <div className="flex items-center space-x-2">
                      <Badge variant={profile.membership_type === 'premium' ? 'default' : 'secondary'}>
                        {profile.membership_type}
                      </Badge>
                      {profile.membership_type === 'free' && (
                        <Button size="sm" onClick={() => window.location.href = '/subscriptions'}>Upgrade to Premium</Button>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Account Status</label>
                    <div className="flex items-center space-x-2">
                      <Badge variant={profile.is_verified ? 'success' : 'warning'}>
                        {profile.is_verified ? 'Verified' : 'Unverified'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default PatientDashboard