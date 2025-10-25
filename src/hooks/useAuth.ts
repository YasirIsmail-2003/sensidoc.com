import { useState, useEffect, createContext, useContext } from 'react'
import { supabase, type Profile, type UserRole, getCurrentProfile, getCurrentUser } from '@/lib/supabase'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1'

interface AuthContextType {
  user: any | null
  profile: Profile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, userData: any) => Promise<{ error: any }>
  signOut: () => Promise<void>
  updateProfile: (data: Partial<Profile>) => Promise<{ error: any }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function useAuthProvider() {
  const [user, setUser] = useState<any | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing session
    const currentUser = getCurrentUser()
    if (currentUser) {
      setUser(currentUser)
      setProfile(currentUser)
      setLoading(false)
    } else {
      setLoading(false)
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const json = await res.json()
      if (!res.ok || !json?.success) {
        return { error: { message: json?.message || 'Invalid email or password' } }
      }

      const { token, user: userPayload } = json.data
      localStorage.setItem('jwtToken', token)
      localStorage.setItem('currentUser', JSON.stringify(userPayload))
      setUser(userPayload)
      setProfile(userPayload)
      return { error: null }
    } catch (error) {
      return { error: { message: 'Login failed' } }
    }
  }

  const signUp = async (email: string, password: string, userData: any) => {
    try {
      const payload: any = {
        email,
        password,
        full_name: userData.full_name,
        phone: userData.phone,
        role: userData.role || 'patient',
      }
      if (userData.role === 'doctor') {
        Object.assign(payload, {
          specialization: userData.specialization,
          experience_years: parseInt(userData.experienceYears || '1', 10),
          qualification: userData.qualification,
          license_number: userData.licenseNumber || `LIC${Date.now()}`,
          city: userData.city,
          hospital_name: userData.hospitalName,
          bio: userData.bio,
        })
      }

      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const json = await res.json()
      if (!res.ok || !json?.success) {
        return { error: { message: json?.message || 'Signup failed' } }
      }
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const signOut = async () => {
    localStorage.removeItem('jwtToken')
    localStorage.removeItem('currentUser')
    setUser(null)
    setProfile(null)
  }

  const updateProfile = async (data: Partial<Profile>) => {
    if (!user) return { error: new Error('No user logged in') }

    const { error } = await supabase 
      .from('users')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', user.id)

    if (!error) {
      const updatedUser = { ...user, ...data }
      localStorage.setItem('currentUser', JSON.stringify(updatedUser))
      setUser(updatedUser)
      setProfile(updatedUser)
    }

    return { error }
  }

  return {
    user, 
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
  }
}

export { AuthContext }