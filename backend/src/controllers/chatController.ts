import { Request, Response } from 'express'
import { supabase } from '@/config/database'
import { ApiResponse } from '@/types'
import { AuthRequest } from '@/middleware/auth'
import { v4 as uuidv4 } from 'uuid'

export const sendMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const senderId = req.user!.id
    const { receiver_id, appointment_id, message } = req.body
    if (!receiver_id || !message) {
      res.status(400).json({ success: false, message: 'Missing fields' } as ApiResponse)
      return
    }

    const { error } = await supabase.from('chat_messages').insert([{
      id: uuidv4(),
      sender_id: senderId,
      receiver_id,
      appointment_id: appointment_id || null,
      message,
      is_read: false,
      created_at: new Date().toISOString()
    }])

    if (error) throw error
    res.json({ success: true, message: 'Message sent' } as ApiResponse)
  } catch (error) {
    console.error('Send message error:', error)
    res.status(500).json({ success: false, message: 'Failed to send message', error: error instanceof Error ? error.message : 'Unknown error' } as ApiResponse)
  }
}

export const getMessages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id
    const { withUserId, appointmentId } = req.query

    let query = supabase.from('chat_messages').select('*').or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    if (withUserId) {
      query = supabase.from('chat_messages').select('*').or(`(sender_id.eq.${userId},receiver_id.eq.${withUserId})`)
    }
    if (appointmentId) query = query.eq('appointment_id', appointmentId)

    const { data, error } = await query.order('created_at', { ascending: true })
    if (error) throw error
    res.json({ success: true, message: 'Messages retrieved', data } as ApiResponse)
  } catch (error) {
    console.error('Get messages error:', error)
    res.status(500).json({ success: false, message: 'Failed to get messages', error: error instanceof Error ? error.message : 'Unknown error' } as ApiResponse)
  }
}


