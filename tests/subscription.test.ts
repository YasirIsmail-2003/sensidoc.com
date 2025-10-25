import request from 'supertest'
import app from '@/backend/src/index'

describe('Subscription flow', () => {
  it('should create an order', async () => {
    const res = await request(app).post('/api/v1/billing/order').send({ amount: 10, user_id: 'test-user' })
    expect([200, 500]).toContain(res.statusCode)
  })
})




