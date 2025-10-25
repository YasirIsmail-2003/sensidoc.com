import request from 'supertest'
import app from '@/backend/src/index'

describe('Appointments flow', () => {
  it('should return 401 for unauthenticated booking', async () => {
    const res = await request(app).post('/api/v1/appointments').send({})
    expect(res.statusCode).toBe(401)
  })
})





