import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware, getCurrentUserId } from 'lyzr-architect';

import getGeneratedSiteModel from '@/models/GeneratedSite';

async function handleGet() {
  try {
    const Model = await getGeneratedSiteModel();
    const sites = await Model.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: sites });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch sites' },
      { status: 500 }
    );
  }
}

async function handlePost(req: NextRequest) {
  try {
    const body = await req.json();
    const Model = await getGeneratedSiteModel();
    const site = await Model.create({
      ...body,
      owner_user_id: getCurrentUserId(),
    });
    return NextResponse.json({ success: true, data: site }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create site' },
      { status: 500 }
    );
  }
}

export const GET = authMiddleware(handleGet);
export const POST = authMiddleware(handlePost);
