'use client';

import mongoose from 'mongoose';

const investmentSchema = new mongoose.Schema({
userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
symbol: { type: String, required: true},
assetType: { type: String, enum: ['stock', 'crypto'], required: true},
quantity: { type: Number, required: true},
purchasePrice: {type: Number, required: true},
purchaseDate: { type: Date, default: Date.now}
});

const Investment = mongoose.model('Investment', investmentSchema);

export default Investment;