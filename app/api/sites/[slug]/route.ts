import { NextRequest, NextResponse } from 'next/server';
import getGeneratedSiteModel from '@/models/GeneratedSite';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const Model = await getGeneratedSiteModel();
    const site = await Model.findOne({ slug }).lean();
    if (!site) {
      return NextResponse.json(
        { success: false, error: 'Site not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: site });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch site' },
      { status: 500 }
    );
  }
}
