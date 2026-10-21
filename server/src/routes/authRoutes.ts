import express from 'express';
import { registerUser, loginUser } from '../controllers/authController';
// Temporarily comment out protected route until middleware is fixed
// import { authenticateJWT } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
// router.get('/protected', authenticateJWT, protectedRoute);

export default router;