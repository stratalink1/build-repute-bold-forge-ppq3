/**
 * GeneratedSite model.
 *
 * One record per site generated through the pipeline. Owned by a user_id
 * that maps to the NextAuth users collection. The `slug` is what we
 * publish to (e.g. sharma-sweets.repute.site or /sites/sharma-sweets).
 */

import mongoose, { Schema, model, models, type Model } from 'mongoose'

export interface GeneratedSiteDoc {
  user_id: string
  google_maps_url: string
  business_name?: string
  business_address?: string
  live_url?: string
  slug?: string
  generated_content?: Record<string, unknown>
  data_source: 'demo' | 'live'
  status: 'generating' | 'live' | 'failed'
  createdAt: Date
  updatedAt: Date
}

const GeneratedSiteSchema = new Schema<GeneratedSiteDoc>(
  {
    user_id: { type: String, required: true, index: true },
    google_maps_url: { type: String, required: true },
    business_name: { type: String },
    business_address: { type: String },
    live_url: { type: String },
    slug: { type: String, unique: true, sparse: true, index: true },
    generated_content: { type: Schema.Types.Mixed },
    data_source: { type: String, enum: ['demo', 'live'], default: 'demo' },
    status: { type: String, enum: ['generating', 'live', 'failed'], default: 'generating' },
  },
  { timestamps: true }
)

/**
 * Cached model accessor. The `models` registry survives hot reloads, so
 * we look there first to avoid Mongoose's "OverwriteModelError".
 */
const GeneratedSite: Model<GeneratedSiteDoc> =
  (models.GeneratedSite as Model<GeneratedSiteDoc>) ||
  model<GeneratedSiteDoc>('GeneratedSite', GeneratedSiteSchema)

export default GeneratedSite
