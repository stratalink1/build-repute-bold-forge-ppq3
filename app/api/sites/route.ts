/**
 * /api/sites
 *
 * GET  - list sites owned by the signed-in user, newest first
 * POST - create a new site (owned by the signed-in user)
 *
 * Both require an authenticated session. Anonymous calls return 401.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import GeneratedSite from '@/models/GeneratedSite'

export const dynamic = 'force-dynamic'

interface SessionUser {
  id?: string
  email?: string | null
  name?: string | null
}

async function getUserIdOr401(): Promise<string | NextResponse> {
  const session = await getServerSession(authOptions)
  const user = session?.user as SessionUser | undefined
  if (!user?.id) {
    return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })
  }
  return user.id
}

export async function GET() {
  const userIdOrError = await getUserIdOr401()
  if (typeof userIdOrError !== 'string') return userIdOrError

  try {
    await connectDB()
    const sites = await GeneratedSite.find({ user_id: userIdOrError })
      .sort({ createdAt: -1 })
      .lean()
    return NextResponse.json({ success: true, data: sites })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch sites'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const userIdOrError = await getUserIdOr401()
  if (typeof userIdOrError !== 'string') return userIdOrError

  try {
    const body = await req.json()
    await connectDB()
    const site = await GeneratedSite.create({
      ...body,
      user_id: userIdOrError,
    })
    return NextResponse.json({ success: true, data: site }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create site'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
