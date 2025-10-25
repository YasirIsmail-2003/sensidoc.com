export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: 'patient' | 'doctor' | 'admin';
  is_verified: boolean;
  membership_type: 'free' | 'premium';
  created_at: string;
  updated_at: string;
}

export interface Doctor {
  id: string;
  user_id: string;
  specialization: string;
  experience_years: number;
  qualification: string;
  license_number: string;
  consultation_fee: number;
  is_verified: boolean;
  is_online: boolean;
  city: string;
  hospital_name?: string;
  bio?: string;
  profile_image?: string;
  rating: number;
  total_consultations: number;
  is_video_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  appointment_date: string;
  appointment_time: string;
  consultation_type: 'chat' | 'video' | 'visit';
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rejected';
  symptoms?: string;
  notes?: string;
  prescription?: string;
  created_at: string;
  updated_at: string;
}

export interface Diagnosis {
  id: string;
  patient_id: string;
  input_text: string;
  input_image?: string;
  ai_response: string;
  condition: string;
  confidence_level: number;
  recommendations: string[];
  created_at: string;
}

export interface DrugAnalysis {
  id: string;
  user_id: string;
  drug_name?: string;
  drug_image?: string;
  analysis_result: string;
  uses: string[];
  side_effects: string[];
  dosage: string;
  warnings: string[];
  created_at: string;
}

export interface HealthRecord {
  id: string;
  patient_id: string;
  doctor_id?: string;
  title: string;
  description: string;
  file_url?: string;
  record_type: 'prescription' | 'test_result' | 'diagnosis' | 'other';
  created_at: string;
  updated_at: string;
}

export interface Blog {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  author_id: string;
  category: string;
  tags: string[];
  featured_image?: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'new' | 'in_progress' | 'resolved';
  created_at: string;
}

export interface LoginLog {
  id: string;
  user_id: string;
  login_timestamp: string;
  ip_address: string;
  user_agent: string;
  role: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AuthRequest extends Request {
  user?: User;
}