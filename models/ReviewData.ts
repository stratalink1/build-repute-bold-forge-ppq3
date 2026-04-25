import { initDB, createModel } from 'lyzr-architect';

let _model: any = null;

export default async function getReviewDataModel() {
  if (!_model) {
    await initDB();
    _model = createModel('ReviewData', {
      site_id: { type: String, required: true },
      raw_reviews: { type: Array, default: [] },
      extracted_themes: { type: Object, default: {} },
      review_count: { type: Number, default: 0 },
      average_rating: { type: Number, default: 0 },
      data_source: { type: String, enum: ['demo', 'live'], default: 'demo' },
    });
  }
  return _model;
}
