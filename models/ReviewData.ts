/**
 * ReviewData model.
 *
 * Stores the raw + processed review information for one site. Indexed on
 * site_id so we can look up review data when re-rendering a site or when
 * a user revisits their dashboard.
 */

import mongoose, { Schema, model, models, type Model } from 'mongoose'

export interface ReviewDataDoc {
  site_id: string
  raw_reviews: unknown[]
  extracted_themes: Record<string, unknown>
  review_count: number
  average_rating: number
  data_source: 'demo' | 'live'
  createdAt: Date
  updatedAt: Date
}

const ReviewDataSchema = new Schema<ReviewDataDoc>(
  {
    site_id: { type: String, required: true, index: true },
    raw_reviews: { type: [Schema.Types.Mixed], default: [] },
    extracted_themes: { type: Schema.Types.Mixed, default: {} },
    review_count: { type: Number, default: 0 },
    average_rating: { type: Number, default: 0 },
    data_source: { type: String, enum: ['demo', 'live'], default: 'demo' },
  },
  { timestamps: true }
)

const ReviewData: Model<ReviewDataDoc> =
  (models.ReviewData as Model<ReviewDataDoc>) ||
  model<ReviewDataDoc>('ReviewData', ReviewDataSchema)

export default ReviewData
