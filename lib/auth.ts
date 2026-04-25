/**
 * NextAuth configuration.
 *
 * Strategy: passwordless sign-in via emailed magic link. NextAuth handles
 * the token lifecycle (generation, storage, expiry, single-use). We
 * override `sendVerificationRequest` to route the email through our
 * Resend-backed sender (or, in dev, log to the console).
 *
 * Session strategy: database. Because we're using the EmailProvider with
 * an adapter, NextAuth requires the database session strategy.
 *
 * The MongoDB adapter writes to four collections in the same database
 * Mongoose connects to: `users`, `accounts`, `sessions`,
 * `verification_tokens`. Our app-domain models (GeneratedSite,
 * ReviewData) live alongside but are managed by Mongoose.
 */

import type { NextAuthOptions } from 'next-auth'
import EmailProvider from 'next-auth/providers/email'
import { MongoDBAdapter } from '@auth/mongodb-adapter'
import { getMongoClient } from '@/lib/db'
import { sendMagicLink } from '@/lib/email'

export const authOptions: NextAuthOptions = {
  // Lazily produce the MongoClient promise. The adapter expects a
  // Promise<MongoClient>, and getMongoClient() returns exactly that.
  adapter: MongoDBAdapter(getMongoClient()),

  session: {
    strategy: 'database',
    // 30-day rolling session. Adjust to taste.
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },

  providers: [
    EmailProvider({
      // No SMTP server — we override sendVerificationRequest to route
      // through Resend directly. The `from` is still required by the
      // provider's type signature.
      from: process.env.EMAIL_FROM ?? 'noreply@repute.site',
      maxAge: 24 * 60 * 60, // 24 hours

      async sendVerificationRequest({ identifier: email, url }) {
        const host = new URL(url).host
        await sendMagicLink({ to: email, url, host })
      },
    }),
  ],

  pages: {
    // Use our own modal-based sign-in flow. NextAuth's default pages are
    // ugly and live at /api/auth/signin; we never want users sent there.
    signIn: '/',
    verifyRequest: '/?auth=check-inbox',
    error: '/?auth=error',
  },

  callbacks: {
    /**
     * Put the user id on the session so the client can identify the user.
     * Default session shape doesn't include it.
     */
    async session({ session, user }) {
      if (session.user && user?.id) {
        ;(session.user as typeof session.user & { id: string }).id = user.id
      }
      return session
    },
  },

  // Required. Generate with: openssl rand -base64 32
  secret: process.env.NEXTAUTH_SECRET,
}
