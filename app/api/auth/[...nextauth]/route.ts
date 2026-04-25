/**
 * NextAuth catch-all route handler.
 *
 * This single file mounts all NextAuth endpoints under /api/auth/*:
 *   POST /api/auth/signin/email   (request a magic link)
 *   GET  /api/auth/callback/email (consume a magic link)
 *   GET  /api/auth/session        (fetch current session)
 *   POST /api/auth/signout        (sign out)
 *   GET  /api/auth/csrf           (CSRF token)
 *   ... and several others NextAuth wires up automatically.
 *
 * Do not add other files under /api/auth/. Custom auth-adjacent endpoints
 * (e.g. account deletion) should live elsewhere in /api/.
 */

import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
