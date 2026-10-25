import mongoose from 'mongoose';
import { NextResponse, type NextRequest } from 'next/server';
import { authenticateRequest, isAuthError } from '@/src/lib/server/auth';
import { connectToDatabase } from '@/src/lib/server/db';
import { Investment } from '@/src/lib/server/models';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export const runtime = 'nodejs';

export async function GET(request: NextRequest, context: RouteContext) {
  const auth = await authenticateRequest(request);
  if (isAuthError(auth)) return auth;

  const { id } = await context.params;
  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ message: 'Investment not found' }, { status: 404 });
  }

  try {
    await connectToDatabase();
    const investment = await Investment.findOne({
      _id: id,
      userId: new mongoose.Types.ObjectId(auth.id),
    }).lean();
    if (!investment) {
      return NextResponse.json({ message: 'Investment not found' }, { status: 404 });
    }
    return NextResponse.json({ investment });
  } catch (error) {
    console.error('Get investment API failed:', error);
    return NextResponse.json({ message: 'Unable to load investment' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const auth = await authenticateRequest(request);
  if (isAuthError(auth)) return auth;

  const { id } = await context.params;
  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ message: 'Investment not found' }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: 'Invalid request body' }, { status: 400 });
  }
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ message: 'Invalid request body' }, { status: 400 });
  }

  const input = body as Record<string, unknown>;
  const updates: Record<string, unknown> = {};
  if (input.symbol !== undefined) {
    if (typeof input.symbol !== 'string' || !input.symbol.trim()) {
      return NextResponse.json({ message: 'Invalid symbol' }, { status: 400 });
    }
    updates.symbol = input.symbol.trim().toUpperCase();
  }
  if (input.assetType !== undefined) {
    if (!['stock', 'crypto'].includes(String(input.assetType))) {
      return NextResponse.json({ message: 'Invalid asset type' }, { status: 400 });
    }
    updates.assetType = input.assetType;
  }
  for (const field of ['quantity', 'purchasePrice'] as const) {
    if (input[field] !== undefined) {
      const value = Number(input[field]);
      if (!Number.isFinite(value) || value <= 0) {
        return NextResponse.json({ message: `Invalid ${field}` }, { status: 400 });
      }
      updates[field] = value;
    }
  }
  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ message: 'No valid updates provided' }, { status: 400 });
  }

  try {
    await connectToDatabase();
    const investment = await Investment.findOneAndUpdate(
      { _id: id, userId: new mongoose.Types.ObjectId(auth.id) },
      { $set: updates },
      { new: true, runValidators: true },
    ).lean();
    if (!investment) {
      return NextResponse.json({ message: 'Investment not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Investment updated successfully', investment });
  } catch (error) {
    console.error('Update investment API failed:', error);
    return NextResponse.json({ message: 'Unable to update investment' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const auth = await authenticateRequest(request);
  if (isAuthError(auth)) return auth;

  const { id } = await context.params;
  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ message: 'Investment not found' }, { status: 404 });
  }

  try {
    await connectToDatabase();
    const result = await Investment.deleteOne({
      _id: id,
      userId: new mongoose.Types.ObjectId(auth.id),
    });
    if (result.deletedCount === 0) {
      return NextResponse.json({ message: 'Investment not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Investment deleted successfully' });
  } catch (error) {
    console.error('Delete investment API failed:', error);
    return NextResponse.json({ message: 'Unable to delete investment' }, { status: 500 });
  }
}
