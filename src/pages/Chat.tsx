import React, { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const Chat = () => {
  const { profile } = useAuth()
  const [doctors, setDoctors] = useState<any[]>([])
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null)
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<any[]>([])

  useEffect(() => {
    // Load doctors
    fetch('/api/v1/doctors')
      .then(r => r.json())
      .then(json => setDoctors(json.data || []))
  }, [])

  useEffect(() => {
    if (selectedDoctor) {
      fetch(`/api/v1/chat?withUserId=${selectedDoctor.profile.id}`)
        .then(r => r.json())
        .then(json => setMessages(json.data || []))
    }
  }, [selectedDoctor])

  const send = async () => {
    if (!message || !selectedDoctor) return
    await fetch('/api/v1/chat/send', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ receiver_id: selectedDoctor.profile.id, message }) })
    setMessage('')
    // reload
    const res = await fetch(`/api/v1/chat?withUserId=${selectedDoctor.profile.id}`)
    const json = await res.json()
    setMessages(json.data || [])
  }

  if (!profile) return <div>Please login to chat</div>

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div>
          <h3 className="mb-2 font-semibold">Doctors</h3>
          <div className="space-y-2">
            {doctors.map((d: any) => (
              <div key={d.id} className={`p-2 border rounded ${selectedDoctor?.id === d.id ? 'bg-blue-50' : ''}`} onClick={() => setSelectedDoctor(d)}>
                <div className="font-medium">{d.profile?.full_name}</div>
                <div className="text-sm text-gray-500">{d.specialization}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="lg:col-span-2">
          <h3 className="mb-2 font-semibold">Chat</h3>
          <div className="border rounded h-64 overflow-y-auto p-3 mb-3 bg-white">
            {messages.map(m => (
              <div key={m.id} className={`mb-2 ${m.sender_id === profile.id ? 'text-right' : 'text-left'}`}>
                <div className="inline-block p-2 rounded bg-gray-100">{m.message}</div>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Input value={message} onChange={(e) => setMessage(e.target.value)} />
            <Button onClick={send}>Send</Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Chat


