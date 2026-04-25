import { initDB, createModel } from 'lyzr-architect';

let _model: any = null;

export default async function getGeneratedSiteModel() {
  if (!_model) {
    await initDB();
    _model = createModel('GeneratedSite', {
      user_id: { type: String, required: true },
      google_maps_url: { type: String, required: true },
      business_name: { type: String },
      business_address: { type: String },
      live_url: { type: String },
      slug: { type: String, unique: true },
      generated_content: { type: Object },
      data_source: { type: String, enum: ['demo', 'live'], default: 'demo' },
      status: { type: String, enum: ['generating', 'live', 'failed'], default: 'generating' },
    });
  }
  return _model;
}
