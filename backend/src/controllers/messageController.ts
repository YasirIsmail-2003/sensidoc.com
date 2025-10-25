import { Request, Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { supabase } from '@/config/database'
import { ApiResponse } from '@/types'
import { AuthRequest } from '@/middleware/auth'

export const sendMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const senderId = req.user!.id
    const { appointment_id, receiver_id, content } = req.body
    if (!receiver_id || !content) return res.status(400).json({ success: false, message: 'Missing fields' } as ApiResponse)

    const { error } = await supabase.from('messages').insert([{ id: uuidv4(), appointment_id, sender_id: senderId, receiver_id, content, created_at: new Date().toISOString() }])
    if (error) throw error

    res.json({ success: true, message: 'Message sent' } as ApiResponse)
  } catch (error) {
    console.error('Send message error:', error)
    res.status(500).json({ success: false, message: 'Failed to send message', error: error instanceof Error ? error.message : 'Unknown error' } as ApiResponse)
  }
}

export const getMessages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { appointmentId, otherUserId, limit = 50 } = req.query
    if (!appointmentId && !otherUserId) return res.status(400).json({ success: false, message: 'Missing filters' } as ApiResponse)

    let query = supabase.from('messages').select('*').order('created_at', { ascending: true }).limit(Number(limit))
    if (appointmentId) query = query.eq('appointment_id', appointmentId as string)
    if (otherUserId) query = query.or(`sender_id.eq.${otherUserId},receiver_id.eq.${otherUserId}`)

    const { data, error } = await query
    if (error) throw error

    res.json({ success: true, message: 'Messages retrieved', data } as ApiResponse)
  } catch (error) {
    console.error('Get messages error:', error)
    res.status(500).json({ success: false, message: 'Failed to get messages', error: error instanceof Error ? error.message : 'Unknown error' } as ApiResponse)
  }
}


