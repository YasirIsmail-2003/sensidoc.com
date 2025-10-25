import { Router } from 'express'
import { sendMessage, getMessages } from '@/controllers/chatController'
import { authenticateToken } from '@/middleware/auth'

const router = Router()

router.use(authenticateToken)
router.post('/send', sendMessage)
router.get('/', getMessages)

export default router


