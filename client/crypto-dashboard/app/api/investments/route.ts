import mongoose from 'mongoose';
import { NextResponse, type NextRequest } from 'next/server';
import { authenticateRequest, isAuthError } from '@/src/lib/server/auth';
import { connectToDatabase } from '@/src/lib/server/db';
import { Investment } from '@/src/lib/server/models';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (isAuthError(auth)) return auth;

  try {
    await connectToDatabase();
    const investments = await Investment.find({
      userId: new mongoose.Types.ObjectId(auth.id),
    }).lean();
    return NextResponse.json({ investments });
  } catch (error) {
    console.error('Get investments API failed:', error);
    return NextResponse.json({ message: 'Unable to load investments' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (isAuthError(auth)) return auth;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: 'Invalid request body' }, { status: 400 });
  }

  if (!body || typeof body !== 'object') {
    return NextResponse.json({ message: 'Invalid request body' }, { status: 400 });
  }

  const { symbol, assetType, quantity, purchasePrice } = body as Record<string, unknown>;
  const parsedQuantity = Number(quantity);
  const parsedPurchasePrice = Number(purchasePrice);
  if (
    typeof symbol !== 'string' ||
    !symbol.trim() ||
    !['stock', 'crypto'].includes(String(assetType)) ||
    !Number.isFinite(parsedQuantity) ||
    parsedQuantity <= 0 ||
    !Number.isFinite(parsedPurchasePrice) ||
    parsedPurchasePrice <= 0
  ) {
    return NextResponse.json({ message: 'Invalid investment details' }, { status: 400 });
  }

  try {
    await connectToDatabase();
    const investment = await Investment.create({
      userId: new mongoose.Types.ObjectId(auth.id),
      symbol: symbol.trim().toUpperCase(),
      assetType,
      quantity: parsedQuantity,
      purchasePrice: parsedPurchasePrice,
    });
    return NextResponse.json(
      { message: 'Investment created successfully', investment },
      { status: 201 },
    );
  } catch (error) {
    console.error('Create investment API failed:', error);
    return NextResponse.json({ message: 'Unable to create investment' }, { status: 500 });
  }
}
