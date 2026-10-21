import { Request, Response } from 'express';
import Investment from '../models/Investment';

// Get all investments for a user
export const getUserInvestments = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId; // Set by auth middleware

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const investments = await Investment.find({ userId });
    res.json({ investments });
  } catch (error: any) {
    console.error("Get investments error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// Create a new investment
export const createInvestment = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { symbol, assetType, quantity, purchasePrice } = req.body;

    if (!symbol || !assetType || !quantity || !purchasePrice) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (!['stock', 'crypto'].includes(assetType)) {
      return res.status(400).json({ message: 'Asset type must be stock or crypto' });
    }

    const newInvestment = new Investment({
      userId,
      symbol,
      assetType,
      quantity,
      purchasePrice,
    });

    await newInvestment.save();
    res.status(201).json({ 
      message: 'Investment created successfully',
      investment: newInvestment 
    });
  } catch (error: any) {
    console.error("Create investment error:", error.message);
    res.status(400).json({ message: error.message });
  }
};

// Get a specific investment by ID
export const getInvestmentById = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const investment = await Investment.findOne({ _id: id, userId });
    
    if (!investment) {
      return res.status(404).json({ message: 'Investment not found' });
    }

    res.json({ investment });
  } catch (error: any) {
    console.error("Get investment error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// Update an investment
export const updateInvestment = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;
    const { symbol, assetType, quantity, purchasePrice } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const investment = await Investment.findOne({ _id: id, userId });
    
    if (!investment) {
      return res.status(404).json({ message: 'Investment not found' });
    }

    if (symbol) investment.symbol = symbol;
    if (assetType) investment.assetType = assetType;
    if (quantity) investment.quantity = quantity;
    if (purchasePrice) investment.purchasePrice = purchasePrice;

    await investment.save();
    res.json({ 
      message: 'Investment updated successfully',
      investment 
    });
  } catch (error: any) {
    console.error("Update investment error:", error.message);
    res.status(400).json({ message: error.message });
  }
};

// Delete an investment
export const deleteInvestment = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const investment = await Investment.findOne({ _id: id, userId });
    
    if (!investment) {
      return res.status(404).json({ message: 'Investment not found' });
    }

    await Investment.deleteOne({ _id: id });
    res.json({ message: 'Investment deleted successfully' });
  } catch (error: any) {
    console.error("Delete investment error:", error.message);
    res.status(500).json({ message: error.message });
  }
};
