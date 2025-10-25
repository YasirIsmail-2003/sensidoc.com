import React, { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'

const Subscriptions = () => {
  const { profile } = useAuth()
  const [isProcessing, setIsProcessing] = useState(false)

  const startCheckout = async (amount: number, subscription_plan_id: string) => {
    setIsProcessing(true)
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/v1/billing/order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, subscription_plan_id, user_id: profile?.id })
      })
      const json = await res.json()
      if (!json.success) throw new Error('Failed to create order')

      const { id: order_id, amount: orderAmount, subscription_plan_id: planIdEcho } = json.data

      // Use Razorpay checkout
      // @ts-ignore
      const Razorpay = window.Razorpay
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderAmount,
        currency: 'INR',
        name: 'SensiDoc',
        description: 'Subscription purchase',
        order_id,
        handler: async function (response: any) {
          // You should call backend to verify and create subscription record
          await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/v1/billing/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ response, user_id: profile?.id, subscription_plan_id: planIdEcho, amount })
          })
          alert('Payment successful')
          window.location.href = '/dashboard'
        }
      }

      new Razorpay(options).open()
    } catch (error) {
      console.error(error)
      alert('Payment failed')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md p-6 bg-white rounded shadow">
        <h2 className="text-xl font-bold mb-4">Subscriptions</h2>
        <p className="mb-4">Choose a plan to continue using SensiDoc features.</p>
        <div className="space-y-4">
          <div className="p-4 border rounded flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Monthly (Doctor)</h3>
              <p className="text-sm text-gray-600">₹15 per month (doctors)</p>
            </div>
            <Button onClick={() => startCheckout(15, '550e8400-e29b-41d4-a716-446655440001')} disabled={isProcessing}>Buy</Button>
          </div>

          <div className="p-4 border rounded flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Monthly (Patient)</h3>
              <p className="text-sm text-gray-600">₹199 per month</p>
            </div>
            <Button onClick={() => startCheckout(199, '550e8400-e29b-41d4-a716-446655440002')} disabled={isProcessing}>Buy</Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Subscriptions





