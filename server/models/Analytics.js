import mongoose from 'mongoose';

const AnalyticsSchema = new mongoose.Schema({
  totalViews: { type: Number, default: 0 },
  totalUsers: { type: Number, default: 0 },
  engagement: { type: Number, default: 0 },
  contentGrowth: [{ week: Number, content: Number }],
  userActivity: [{ day: String, active: Number }]
});

export default mongoose.model('Analytics', AnalyticsSchema); 