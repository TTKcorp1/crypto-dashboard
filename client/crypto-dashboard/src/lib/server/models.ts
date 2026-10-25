import 'server-only';
import mongoose, { Schema } from 'mongoose';

export type UserRecord = {
  name: string;
  email: string;
  password: string;
};

const userSchema = new Schema<UserRecord>({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
});

export const User =
  mongoose.models.User ?? mongoose.model<UserRecord>('User', userSchema);

export type InvestmentRecord = {
  userId: mongoose.Types.ObjectId;
  symbol: string;
  assetType: 'stock' | 'crypto';
  quantity: number;
  purchasePrice: number;
  purchaseDate: Date;
};

const investmentSchema = new Schema<InvestmentRecord>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  symbol: { type: String, required: true, trim: true, uppercase: true },
  assetType: { type: String, enum: ['stock', 'crypto'], required: true },
  quantity: { type: Number, required: true, min: 0 },
  purchasePrice: { type: Number, required: true, min: 0 },
  purchaseDate: { type: Date, default: Date.now },
});

export const Investment =
  mongoose.models.Investment ??
  mongoose.model<InvestmentRecord>('Investment', investmentSchema);
