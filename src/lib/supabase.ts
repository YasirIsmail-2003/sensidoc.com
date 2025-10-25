import { createClient } from '@supabase/supabase-js'

// Require explicit env settings to prevent accidental use of stale keys
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
})

// Types
export type UserRole = 'patient' | 'doctor' | 'admin' 
export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rejected'
export type ConsultationType = 'chat' | 'video' | 'visit'
export type MembershipType = 'free' | 'premium'

export interface Profile {
  id: string
  email: string
  full_name: string 
  phone?: string
  role: UserRole
  membership_type: MembershipType
  is_verified: boolean
  created_at: string
  updated_at: string
}

export interface Doctor {
  id: string
  user_id: string 
  specialization: string
  license_number: string
  qualification: string
  experience_years: number
  consultation_fee: number
  hospital_name?: string
  bio?: string
  city: string
  is_verified: boolean
  is_online: boolean
  rating: number
  total_consultations: number
  profile_image?: string
  created_at: string
  updated_at: string
}

export interface Appointment {
  id: string
  patient_id: string 
  doctor_id: string
  appointment_date: string
  appointment_time: string
  consultation_type: ConsultationType
  status: AppointmentStatus
  symptoms?: string
  notes?: string
  prescription?: string 
  created_at: string
  updated_at: string
}

// Auth functions
export const signUp = async (email: string, password: string, userData: any) => {
  try {
    // Create user in users table directly
    const userId = crypto.randomUUID()
    
    const { error } = await supabase
      .from('users')
      .insert([{
        id: userId,
        email,
        password_hash: password, // In real app, this should be hashed
        full_name: userData.full_name,
        phone: userData.phone,
        role: userData.role || 'patient',
        is_verified: userData.role === 'admin', // Auto-verify admin
        membership_type: 'free',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
    
    if (error) {
      return { data: null, error }
    }

    // If doctor, create doctor profile. Allow optional profile image upload URL
    if (userData.role === 'doctor') {
      const doctorPayload: any = {
        id: crypto.randomUUID(),
        user_id: userId,
        specialization: userData.specialization || 'General Medicine',
        experience_years: parseInt(userData.experienceYears) || 1,
        qualification: userData.qualification || 'MBBS',
        license_number: userData.licenseNumber || `LIC${Date.now()}`,
        consultation_fee: 500,
        city: userData.city || 'Mumbai',
        hospital_name: userData.hospitalName,
        bio: userData.bio,
        is_verified: false,
        is_online: false,
        rating: 0,
        total_consultations: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      if (userData.profileImageUrl) {
        doctorPayload.profile_image = userData.profileImageUrl
      }

      const { error: doctorError } = await supabase
        .from('doctors')
        .insert([doctorPayload])

      if (doctorError) {
        console.error('Doctor profile creation error:', doctorError)
      }
    }
    
    return { data: { user: { id: userId, email } }, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

export const signIn = async (email: string, password: string) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('password_hash', password) // In real app, compare hashed passwords
      .single()
    
    if (error || !user) {
      return { data: null, error: { message: 'Invalid email or password' } }
    }

    // Store user in localStorage for session management
    localStorage.setItem('currentUser', JSON.stringify(user))
    
    return { data: { user }, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

export const signOut = async () => {
  localStorage.removeItem('currentUser')
  return { error: null }
}

export const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem('currentUser')
    return userStr ? JSON.parse(userStr) : null
  } catch {
    return null
  }
}

export const getCurrentProfile = async () => {
  const user = getCurrentUser()
  if (!user) return { data: null, error: null }

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  return { data, error }
}

// Doctor functions
export const getDoctors = async (filters: any = {}) => {
  let query = supabase
    .from('doctors')
    .select(`
      *,
      profile:users!doctors_user_id_fkey(*)
    `) 
    .eq('is_verified', true)
    .order('rating', { ascending: false })

  if (filters.specialization) {
    query = query.eq('specialization', filters.specialization)
  }

  if (filters.city) { 
    query = query.ilike('city', `%${filters.city}%`)
  }

  const { data, error } = await query
  return { data, error }
}

export const getDoctorById = async (id: string) => {
  const { data, error } = await supabase
    .from('doctors')
    .select(`
      *,
      profile:users!doctors_user_id_fkey(*)
    `)
    .eq('id', id)
    .single()

  return { data, error }
}

export const createDoctor = async (doctorData: any) => { 
  const { data, error } = await supabase
    .from('doctors')
    .insert([doctorData])
    .select()
    .single()

  return { data, error }
}

// Utility: upload file to Supabase storage if available
export const uploadToStorage = async (bucket: string, path: string, file: File | Blob) => {
  try {
    const { data, error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true })
    if (error) return { data: null, error }
    const { data: pub } = supabase.storage.from(bucket).getPublicUrl(data.path)
    return { data: pub?.publicUrl || null, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

export const updateDoctor = async (id: string, updates: any) => { 
  const { data, error } = await supabase
    .from('doctors')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  return { data, error }
}

// Appointment functions
export const createAppointment = async (appointmentData: any) => {
  try {
    // Enforce patient monthly quota before booking
    const user = getCurrentUser()
    if (!user) return { data: null, error: { message: 'Not authenticated' } }

    // Get active subscription for user (if any)
    const { data: activeSub } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    const patientQuota = activeSub?.quota_monthly || 0

    if (patientQuota > 0) {
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
      const { count } = await supabase
        .from('appointments')
        .select('id', { count: 'exact' })
        .eq('patient_id', user.id)
        .gte('created_at', startOfMonth)

      const used = count || 0
      if (used >= patientQuota) {
        return { data: null, error: { message: 'Monthly appointment quota exceeded' } }
      }
    }

    const { data, error } = await supabase
      .from('appointments')
      .insert([{
        ...appointmentData,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single()

    return { data, error }
  } catch (err) {
    return { data: null, error: err }
  }
}

// Subscription management helpers
export const createSubscription = async (userId: string, provider: string, provider_subscription_id: string, quota_monthly: number) => {
  const { data, error } = await supabase
    .from('subscriptions')
    .insert([{ id: crypto.randomUUID(), user_id: userId, provider, provider_subscription_id, status: 'active', started_at: new Date().toISOString(), quota_monthly, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }])
    .select()
    .single()

  return { data, error }
}

export const getSubscription = async (userId: string) => {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  return { data, error }
}

export const getAppointments = async (userId: string, role: UserRole) => { 
  let query = supabase
    .from('appointments')
    .select(`
      *,
      patient:users!appointments_patient_id_fkey(*),
      doctor:doctors!appointments_doctor_id_fkey(*, profile:users!doctors_user_id_fkey(*))
    `)
    .order('appointment_date', { ascending: false })
    .order('appointment_time', { ascending: false })

  if (role === 'patient') {
    query = query.eq('patient_id', userId) 
  } else if (role === 'doctor') {
    // Get doctor ID first
    const { data: doctor } = await supabase
      .from('doctors')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (doctor) {
      query = query.eq('doctor_id', doctor.id)
    }
  }

  const { data, error } = await query
  return { data, error }
}

export const updateAppointmentStatus = async (id: string, status: AppointmentStatus, updates: any = {}) => { 
  const { data, error } = await supabase
    .from('appointments')
    .update({ status, ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  return { data, error }
}

// Specialization functions
export const getSpecializations = async () => {
  const mockSpecializations = [
    { id: '1', name: 'Cardiology', description: 'Heart and cardiovascular system', is_active: true },
    { id: '2', name: 'Dermatology', description: 'Skin, hair, and nails', is_active: true },
    { id: '3', name: 'Neurology', description: 'Brain and nervous system', is_active: true },
    { id: '4', name: 'Orthopedics', description: 'Bones, joints, and muscles', is_active: true },
    { id: '5', name: 'Pediatrics', description: 'Children\'s health', is_active: true },
    { id: '6', name: 'Psychiatry', description: 'Mental health', is_active: true },
    { id: '7', name: 'General Medicine', description: 'General healthcare', is_active: true },
    { id: '8', name: 'Gynecology', description: 'Women\'s health', is_active: true }
  ]
  
  return { data: mockSpecializations, error: null }
}

// Admin functions
export const getAdminStats = async () => {
  const [
    totalUsers,
    totalDoctors,
    totalPatients,
    verifiedDoctors,
    totalAppointments,
    pendingAppointments,
    completedAppointments,
    premiumUsers
  ] = await Promise.all([
    supabase.from('users').select('id', { count: 'exact' }),
    supabase.from('users').select('id', { count: 'exact' }).eq('role', 'doctor'),
    supabase.from('users').select('id', { count: 'exact' }).eq('role', 'patient'),
    supabase.from('doctors').select('id', { count: 'exact' }).eq('is_verified', true),
    supabase.from('appointments').select('id', { count: 'exact' }),
    supabase.from('appointments').select('id', { count: 'exact' }).eq('status', 'pending'),
    supabase.from('appointments').select('id', { count: 'exact' }).eq('status', 'completed'),
    supabase.from('users').select('id', { count: 'exact' }).eq('membership_type', 'premium')
  ])

  return {
    totalUsers: totalUsers.count || 0,
    totalDoctors: totalDoctors.count || 0,
    totalPatients: totalPatients.count || 0,
    verifiedDoctors: verifiedDoctors.count || 0,
    totalAppointments: totalAppointments.count || 0,
    pendingAppointments: pendingAppointments.count || 0,
    completedAppointments: completedAppointments.count || 0,
    premiumUsers: premiumUsers.count || 0
  }
}

export const getAllUsers = async () => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })

  return { data, error }
}

export const getAllDoctors = async () => {
  const { data, error } = await supabase
    .from('doctors')
    .select(`
      *,
      profile:users!doctors_user_id_fkey(*)
    `)
    .order('created_at', { ascending: false })

  return { data, error }
}

export const verifyDoctor = async (id: string, isVerified: boolean) => {
  const { data, error } = await supabase
    .from('doctors')
    .update({ is_verified: isVerified, updated_at: new Date().toISOString() })
    .eq('id', id)

  return { data, error }
}

export const updateUserMembership = async (id: string, membershipType: MembershipType) => {
  const { data, error } = await supabase
    .from('users')
    .update({ membership_type: membershipType, updated_at: new Date().toISOString() })
    .eq('id', id)

  return { data, error }
}