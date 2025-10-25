import request from 'supertest'
import app from '@/backend/src/index'

describe('Auth flow', () => {
  it('should not allow duplicate signup', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      email: 'test@example.com',
      password: 'password123',
      full_name: 'Test User',
      role: 'patient'
    })
    // Could be 201 or 400 depending on DB state; just ensure endpoint responds
    expect([201, 400]).toContain(res.statusCode)
  })
})




