import express from 'express';
import { 
  getUserInvestments, 
  createInvestment, 
  getInvestmentById, 
  updateInvestment, 
  deleteInvestment 
} from '../controllers/investmentController';
import { authenticateJWT } from '../middleware/authMiddleware';

const router = express.Router();

// All routes require authentication
router.use(authenticateJWT);

// Get all investments for the user
router.get('/', getUserInvestments);

// Create a new investment
router.post('/', createInvestment);

// Get a specific investment by ID
router.get('/:id', getInvestmentById);

// Update an investment
router.put('/:id', updateInvestment);

// Delete an investment
router.delete('/:id', deleteInvestment);

export default router;
