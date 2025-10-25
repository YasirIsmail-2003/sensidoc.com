import React, { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth' 
import { Navigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Users, 
  UserCheck, 
  UserX, 
  Stethoscope, 
  Calendar, 
  TrendingUp,
  Shield,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  MapPin,
  Phone,
  Mail,
  Award,
  Activity,
  DollarSign,
  FileText,
  Bell
} from 'lucide-react'
import { 
  getAdminStats, 
  getAllUsers, 
  getAllDoctors, 
  verifyDoctor, 
  updateUserMembership, 
  getSpecializations,
  getAppointments,
  createDoctor
} from '@/lib/supabase'
import { supabase } from '@/lib/supabase'
import LiveActivity from './components/LiveActivity'

const AdminDashboard = () => {
  const { profile, loading } = useAuth()
  const [stats, setStats] = useState<any>({}) 
  const [users, setUsers] = useState<any[]>([])
  const [doctors, setDoctors] = useState<any[]>([])
  const [appointments, setAppointments] = useState<any[]>([])
  const [specializations, setSpecializations] = useState<any[]>([])
  const [quotas, setQuotas] = useState<any[]>([])
  const [loginLogs, setLoginLogs] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  
  // Add Doctor modal state
  const [showAddDoctor, setShowAddDoctor] = useState(false)
  const [doctorForm, setDoctorForm] = useState({
    email: '',
    password: '',
    full_name: '',
    phone: '',
    specialization: '',
    license_number: '',
    qualification: '',
    experience_years: '',
    consultation_fee: '',
    hospital_name: '',
    bio: '',
    city: ''
  })
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null)
  const [doctorProfileImageUrl, setDoctorProfileImageUrl] = useState('')

  useEffect(() => {
    if (profile?.role === 'admin') { 
      loadData()
    }
  }, [profile])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1'
      const token = localStorage.getItem('jwtToken')
      
      if (!token) {
        console.error('No authentication token found')
        setIsLoading(false)
        return
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }

      const base = `${API_BASE}/workstation`
      const [statsResponse, usersResponse, doctorsResponse, appointmentsResponse, quotasResponse, logsResponse] = await Promise.all([
        fetch(`${base}/stats`, { headers }),
        fetch(`${base}/users`, { headers }),
        fetch(`${base}/doctors`, { headers }),
        fetch(`${base}/appointments`, { headers }),
        fetch(`${base}/quotas`, { headers }),
        fetch(`${base}/login-logs?days=7&limit=50`, { headers })
      ])

      const [statsData, usersData, doctorsData, appointmentsData, quotasData, logsData] = await Promise.all([
        statsResponse.json(),
        usersResponse.json(),
        doctorsResponse.json(),
        appointmentsResponse.json(),
        quotasResponse.json(),
        logsResponse.json()
      ])

      if (statsData.success) {
        setStats(statsData.data)
      }
      if (usersData.success) {
        setUsers(usersData.data || [])
      }
      if (doctorsData.success) {
        setDoctors(doctorsData.data || [])
      }
      if (appointmentsData.success) {
        setAppointments(appointmentsData.data || [])
      }
      if (quotasData.success) {
        setQuotas(quotasData.data || [])
      }
      if (logsData.success) {
        setLoginLogs(logsData.data || [])
      }

      // Load specializations
      const specializationsData = await getSpecializations()
      setSpecializations(specializationsData.data || [])
    } catch (error) {
      console.error('Error loading admin data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyDoctor = async (doctorId: string, isVerified: boolean) => {
    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1'
      const token = localStorage.getItem('jwtToken')
      
      const response = await fetch(`${API_BASE}/workstation/doctors/${doctorId}/verify`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ is_verified: isVerified })
      })

      const result = await response.json()
      if (result.success) {
        loadData() // Refresh data
      } else {
        console.error('Error verifying doctor:', result.message)
      }
    } catch (error) {
      console.error('Error verifying doctor:', error)
    }
  }

  const handleUpdateMembership = async (userId: string, membershipType: 'free' | 'premium') => {
    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1'
      const token = localStorage.getItem('jwtToken')
      
      const response = await fetch(`${API_BASE}/workstation/users/${userId}/membership`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ membership_type: membershipType })
      })

      const result = await response.json()
      if (result.success) {
        loadData() // Refresh data
      } else {
        console.error('Error updating membership:', result.message)
      }
    } catch (error) {
      console.error('Error updating membership:', error)
    }
  }

  const handleAddDoctor = async (e: React.FormEvent) => {
    e.preventDefault() 
    try {
      // Check if email already exists
      const { data: existing } = await supabase
        .from('users')
        .select('id')
        .eq('email', doctorForm.email)
        .single()
      if (existing) {
        alert('A user with this email already exists')
        return
      }
      // Upload image to Supabase Storage if provided (bucket: doctor-images, public)
      let uploadedImageUrl: string | undefined
      if (profileImageFile) {
        const fileExt = profileImageFile.name.split('.').pop() || 'jpg'
        const userIdTemp = crypto.randomUUID()
        const filePath = `doctors/${userIdTemp}-${Date.now()}.${fileExt}`
        const { data: uploadData, error: uploadErr } = await supabase.storage
          .from('doctor-images')
          .upload(filePath, profileImageFile, { upsert: true, contentType: profileImageFile.type })
        if (!uploadErr && uploadData) {
          const { data: pub } = supabase.storage.from('doctor-images').getPublicUrl(uploadData.path)
          uploadedImageUrl = pub.publicUrl
        }
      }
      // If URL provided in form, prefer it
      if (doctorProfileImageUrl) uploadedImageUrl = doctorProfileImageUrl

      // Create user first
      const userId = crypto.randomUUID()
      
      const { error: userError } = await supabase
        .from('users')
        .insert([{
          id: userId,
          email: doctorForm.email,
          password_hash: doctorForm.password,
          full_name: doctorForm.full_name,
          phone: doctorForm.phone,
          role: 'doctor',
          is_verified: true,
          membership_type: 'free',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])

      if (userError) throw userError

      // Create doctor profile
      await createDoctor({
        id: crypto.randomUUID(),
        user_id: userId,
        specialization: doctorForm.specialization,
        license_number: doctorForm.license_number,
        qualification: doctorForm.qualification,
        experience_years: parseInt(doctorForm.experience_years),
        consultation_fee: parseFloat(doctorForm.consultation_fee),
        hospital_name: doctorForm.hospital_name,
        bio: doctorForm.bio,
        city: doctorForm.city,
        profile_image: uploadedImageUrl,
        is_verified: true,
        is_online: false,
        rating: 0,
        total_consultations: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

      setShowAddDoctor(false)
      setDoctorForm({
        email: '',
        password: '',
        full_name: '',
        phone: '',
        specialization: '',
        license_number: '',
        qualification: '',
        experience_years: '',
        consultation_fee: '',
        hospital_name: '',
        bio: '',
        city: ''
      })
      loadData()
      alert('Doctor added successfully!')
    } catch (error) {
      console.error('Error adding doctor:', error)
      alert('Failed to add doctor. Please try again.')
    } 
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!profile || profile.role !== 'admin') { 
    return <Navigate to="/login" replace />
  }

  const filteredUsers = users.filter(user =>
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredDoctors = doctors.filter(doctor =>
    doctor.users?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.users?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.specialization?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1> 
              <p className="text-gray-600">Manage your healthcare platform</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => setShowAddDoctor(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Doctor
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-9">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="doctors">Doctors</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="live-activity">Live Activity</TabsTrigger>
            <TabsTrigger value="leads">Leads</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white"> 
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100">Total Users</p>
                      <p className="text-3xl font-bold">{stats.users?.total || 0}</p>
                    </div>
                    <Users className="h-12 w-12 text-blue-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white"> 
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100">Active Doctors</p>
                      <p className="text-3xl font-bold">{stats.doctors?.verified || 0}</p>
                    </div>
                    <Stethoscope className="h-12 w-12 text-green-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white"> 
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100">Total Appointments</p>
                      <p className="text-3xl font-bold">{stats.appointments?.total || 0}</p>
                    </div>
                    <Calendar className="h-12 w-12 text-purple-200" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white"> 
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100">Premium Users</p>
                      <p className="text-3xl font-bold">{stats.users?.premium || 0}</p>
                    </div>
                    <Award className="h-12 w-12 text-orange-200" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"> 
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <UserCheck className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-900">Pending Verifications</h3>
                  <p className="text-2xl font-bold text-blue-600">{doctors.filter(d => !d.is_verified).length}</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer"> 
                <CardContent className="p-6 text-center">
                  <Clock className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-900">Pending Appointments</h3>
                  <p className="text-2xl font-bold text-yellow-600">{stats.appointments?.pending || 0}</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer"> 
                <CardContent className="p-6 text-center">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-900">Completed Today</h3>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.appointments?.completed || 0}
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer"> 
                <CardContent className="p-6 text-center">
                  <TrendingUp className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-900">Growth Rate</h3>
                  <p className="text-2xl font-bold text-purple-600">+12%</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">User Management</h2> 
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto"> 
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Membership</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50"> 
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback>{user.full_name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{user.full_name}</div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant={user.role === 'admin' ? 'destructive' : user.role === 'doctor' ? 'default' : 'secondary'}>
                              {user.role} 
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <select
                                value={user.membership_type}
                                onChange={(e) => handleUpdateMembership(user.id, e.target.value as 'free' | 'premium')}
                                className="text-sm border rounded px-2 py-1"
                              >
                                <option value="free">Free</option>
                                <option value="premium">Premium</option>
                              </select>
                              {user.role !== 'admin' && user.membership_type !== 'premium' && (
                                <Button size="sm" onClick={() => handleUpdateMembership(user.id, 'premium')}>
                                  Make Premium
                                </Button>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant={user.is_verified ? 'success' : 'warning'}>
                              {user.is_verified ? 'Verified' : 'Unverified'} 
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(user.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <Button size="sm" variant="outline"> 
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Edit className="h-4 w-4" />
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

          {/* Doctors Tab */}
          <TabsContent value="doctors" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Doctor Management</h2> 
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search doctors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Button onClick={() => setShowAddDoctor(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Doctor
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDoctors.map((doctor) => (
                <Card key={doctor.id} className="hover:shadow-lg transition-shadow"> 
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={doctor.profile_image} />
                          <AvatarFallback>{doctor.users?.full_name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-gray-900">{doctor.users?.full_name}</h3>
                          <p className="text-sm text-gray-500">{doctor.specialization}</p>
                        </div> 
                      </div>
                      <Badge variant={doctor.is_verified ? 'success' : 'warning'}>
                        {doctor.is_verified ? 'Verified' : 'Pending'}
                      </Badge>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center text-gray-600">
                        <Award className="h-4 w-4 mr-2" />
                        <span>{doctor.qualification || 'MBBS'}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Activity className="h-4 w-4 mr-2" />
                        <span>{doctor.experience_years} years experience</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <DollarSign className="h-4 w-4 mr-2" />
                        <span>₹{doctor.consultation_fee || 500} consultation</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Star className="h-4 w-4 mr-2" />
                        <span>{doctor.rating || 0}/5 ({doctor.total_consultations || 0} consultations)</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-4 border-t">
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant={doctor.is_verified ? "destructive" : "default"} 
                          onClick={() => handleVerifyDoctor(doctor.id, !doctor.is_verified)}
                        >
                          {doctor.is_verified ? (
                            <>
                              <XCircle className="h-4 w-4 mr-1" />
                              Unverify
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Verify
                            </>
                          )}
                        </Button>
                      </div> 
                      <div className="flex items-center space-x-1">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Appointments Tab */}
          <TabsContent value="appointments" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Appointment Management</h2> 
              <div className="flex items-center space-x-4">
                <Badge variant="outline">{appointments.length} Total</Badge>
                <Badge variant="warning">{appointments.filter(a => a.status === 'pending').length} Pending</Badge>
                <Badge variant="success">{appointments.filter(a => a.status === 'completed').length} Completed</Badge>
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full"> 
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fee</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {appointments.slice(0, 10).map((appointment) => (
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
                            <div className="text-sm font-medium text-gray-900">{appointment.doctor?.users?.full_name}</div>
                            <div className="text-sm text-gray-500">{appointment.doctor?.specialization || 'General Medicine'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{new Date(appointment.appointment_date).toLocaleDateString()}</div>
                            <div className="text-sm text-gray-500">{appointment.appointment_time}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant="outline">{appointment.consultation_type}</Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge 
                              variant={ 
                                appointment.status === 'completed' ? 'success' :
                                appointment.status === 'confirmed' ? 'default' :
                                appointment.status === 'pending' ? 'warning' :
                                'destructive'
                              }
                            >
                              {appointment.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ₹{appointment.doctor?.consultation_fee || 500}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <h2 className="text-xl font-semibold">Platform Analytics</h2>
             
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    User Growth
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">+{stats.users?.total || 0}</div>
                  <p className="text-sm text-gray-500">Total registered users</p>
                </CardContent>
              </Card>

              <Card> 
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Appointments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">{stats.appointments?.total || 0}</div>
                  <p className="text-sm text-gray-500">Total appointments booked</p>
                </CardContent>
              </Card>

              <Card> 
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="h-5 w-5 mr-2" />
                    Revenue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600">₹{((stats.appointments?.completed || 0) * 500).toLocaleString()}</div>
                  <p className="text-sm text-gray-500">Estimated revenue</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="live-activity" className="space-y-6">
            <h2 className="text-xl font-semibold">Live Activity</h2>
            <Card>
              <CardContent className="p-0">
                {loginLogs.length === 0 ? (
                  <div className="p-6 text-sm text-gray-600">No recent activity.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {loginLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{log.users?.full_name || 'User'}</div>
                              <div className="text-xs text-gray-500">{log.users?.email}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge variant={log.role === 'admin' ? 'destructive' : log.role === 'doctor' ? 'default' : 'secondary'}>
                                {log.role}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">Login</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(log.login_timestamp).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leads" className="space-y-6">
            <h2 className="text-xl font-semibold">Leads</h2>
            <Card>
              <CardContent>
                <p>Leads and contact submissions are listed under Contact management.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            <h2 className="text-xl font-semibold">Payments</h2>
            <Card>
              <CardContent>
                <p>Payments summary will be shown here (from payments table).</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscriptions" className="space-y-6">
            <h2 className="text-xl font-semibold">Subscriptions</h2>
            <Card>
              <CardContent>
                <p>Active subscriptions and their quotas.</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Quotas Tab */}
          <TabsContent value="quotas" className="space-y-6">
            <h2 className="text-xl font-semibold">Role Quotas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {quotas.map((q) => (
                <Card key={q.role}>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{q.role}</h3>
                        <p className="text-sm text-gray-500">Monthly quota: {q.monthly_quota}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Input type="number" defaultValue={q.monthly_quota} id={`quota-${q.role}`} />
                        <Button onClick={async () => {
                          const val = (document.getElementById(`quota-${q.role}`) as HTMLInputElement).value
                          await fetch(`/api/v1/admin/quotas/${q.role}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ monthly_quota: Number(val) }) })
                          alert('Quota updated')
                          loadData()
                        }}>Save</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Doctor Modal */}
      {showAddDoctor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"> 
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Add New Doctor</h2>
              <Button variant="ghost" onClick={() => setShowAddDoctor(false)}>
                <XCircle className="h-5 w-5" />
              </Button>
            </div>

            <form onSubmit={handleAddDoctor} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div> 
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={doctorForm.full_name}
                    onChange={(e) => setDoctorForm({...doctorForm, full_name: e.target.value})}
                    required
                  />
                </div>
                <div> 
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={doctorForm.email}
                    onChange={(e) => setDoctorForm({...doctorForm, email: e.target.value})}
                    required
                  />
                </div>
                <div> 
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={doctorForm.password}
                    onChange={(e) => setDoctorForm({...doctorForm, password: e.target.value})}
                    required
                  />
                </div>
                <div> 
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={doctorForm.phone}
                    onChange={(e) => setDoctorForm({...doctorForm, phone: e.target.value})}
                    required
                  />
                </div>
                <div> 
                  <Label htmlFor="specialization">Specialization</Label>
                  <select
                    id="specialization"
                    value={doctorForm.specialization}
                    onChange={(e) => setDoctorForm({...doctorForm, specialization: e.target.value})}
                    className="w-full border rounded-md px-3 py-2"
                    required
                  >
                    <option value="">Select Specialization</option>
                    {specializations.map((spec) => (
                      <option key={spec.id} value={spec.name}>{spec.name}</option>
                    ))}
                  </select>
                </div>
                <div> 
                  <Label htmlFor="license_number">License Number</Label>
                  <Input
                    id="license_number"
                    value={doctorForm.license_number}
                    onChange={(e) => setDoctorForm({...doctorForm, license_number: e.target.value})}
                    required
                  />
                </div>
                <div> 
                  <Label htmlFor="qualification">Qualification</Label>
                  <Input
                    id="qualification"
                    value={doctorForm.qualification}
                    onChange={(e) => setDoctorForm({...doctorForm, qualification: e.target.value})}
                    required
                  />
                </div>
                <div> 
                  <Label htmlFor="experience_years">Experience (Years)</Label>
                  <Input
                    id="experience_years"
                    type="number"
                    value={doctorForm.experience_years}
                    onChange={(e) => setDoctorForm({...doctorForm, experience_years: e.target.value})}
                    required
                  />
                </div>
                <div> 
                  <Label htmlFor="consultation_fee">Consultation Fee (₹)</Label>
                  <Input
                    id="consultation_fee"
                    type="number"
                    value={doctorForm.consultation_fee}
                    onChange={(e) => setDoctorForm({...doctorForm, consultation_fee: e.target.value})}
                    required
                  />
                </div>
                <div> 
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={doctorForm.city}
                    onChange={(e) => setDoctorForm({...doctorForm, city: e.target.value})}
                    required
                  />
                </div>
                <div> 
                  <Label htmlFor="hospital_name">Hospital/Clinic</Label>
                  <Input
                    id="hospital_name"
                    value={doctorForm.hospital_name}
                    onChange={(e) => setDoctorForm({...doctorForm, hospital_name: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="profile_image">Profile Photo</Label>
                  <input
                    id="profile_image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setProfileImageFile(e.target.files?.[0] || null)}
                    className="block w-full text-sm text-gray-600 border rounded-md px-3 py-2"
                  />
                  <p className="text-xs text-gray-500 mt-1">Or paste image URL below</p>
                  <Input
                    placeholder="https://..."
                    value={doctorProfileImageUrl}
                    onChange={(e) => setDoctorProfileImageUrl(e.target.value)}
                  />
                </div>
              </div>
              <div> 
                <Label htmlFor="bio">Bio</Label>
                <textarea
                  id="bio"
                  value={doctorForm.bio}
                  onChange={(e) => setDoctorForm({...doctorForm, bio: e.target.value})}
                  className="w-full border rounded-md px-3 py-2 h-24"
                  placeholder="Brief description about the doctor..."
                />
              </div>
              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={() => setShowAddDoctor(false)}> 
                  Cancel
                </Button>
                <Button type="submit">Add Doctor</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard