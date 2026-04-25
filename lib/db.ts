/**
 * MongoDB connection helper.
 *
 * Pattern: cache the Mongoose connection on the global object so that hot
 * reloads in dev mode don't open new connections on every request. In
 * production this still works fine because the global is fresh per
 * serverless instance.
 *
 * Usage:
 *   import { connectDB } from '@/lib/db'
 *   await connectDB()
 *   const sites = await GeneratedSiteModel.find()
 */

import mongoose, { Mongoose } from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  // We don't throw at import time because this file is imported by route
  // handlers that may not need the DB. We throw inside connectDB() instead.
  console.warn('[db] MONGODB_URI is not set. Database calls will fail until it is configured.')
}

interface MongooseCache {
  conn: Mongoose | null
  promise: Promise<Mongoose> | null
}

// Stash the cache on globalThis so it survives hot reloads.
const globalForMongoose = globalThis as unknown as {
  _mongooseCache?: MongooseCache
}

const cache: MongooseCache = globalForMongoose._mongooseCache ?? { conn: null, promise: null }
globalForMongoose._mongooseCache = cache

/**
 * Connect to MongoDB and return the cached Mongoose instance.
 * Safe to call repeatedly. The first call connects, subsequent calls return
 * the cached connection.
 *
 * @throws if MONGODB_URI is missing or the connection fails
 */
export async function connectDB(): Promise<Mongoose> {
  if (cache.conn) return cache.conn

  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not set. Add it to your .env.local file.')
  }

  if (!cache.promise) {
    cache.promise = mongoose.connect(MONGODB_URI, {
      // Mongoose 8 defaults are sensible. Keep options minimal.
      bufferCommands: false,
    })
  }

  cache.conn = await cache.promise
  return cache.conn
}

/**
 * Get the underlying MongoDB native client. Needed by @auth/mongodb-adapter
 * which talks to the driver directly, not through Mongoose.
 *
 * Returns a Promise<MongoClient> as required by the adapter's interface.
 */
export async function getMongoClient() {
  const conn = await connectDB()
  // mongoose.connection.getClient() returns the underlying MongoClient.
  return conn.connection.getClient()
}
