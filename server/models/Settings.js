import mongoose from 'mongoose';

const SettingsSchema = new mongoose.Schema({
  siteName: { type: String, default: 'LinkSphere' },
  adminPin: { type: String, required: true },
  theme: { type: String, default: 'light' },
  notifications: { type: Boolean, default: true }
});

export default mongoose.model('Settings', SettingsSchema); 