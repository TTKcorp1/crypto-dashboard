import { Request, Response } from 'express';
import User from '../models/User';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    console.log('Mongoose readyState:', mongoose.connection.readyState);
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const newUser = new User({ name, email, password });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error: any) {
    console.error("Register error:", error.message);
    res.status(400).json({ message: error.message });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '1d' }
    );

    res.json({ message: 'Login successful', token });
  } catch (error: any) {
    console.error("Login error:", error.message);
    res.status(400).json({ message: error.message });
  }
};