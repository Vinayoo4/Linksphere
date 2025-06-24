import mongoose from 'mongoose';

const LinkSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  url: { type: String, required: true, trim: true },
  icon: { type: String, trim: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date }
});

export default mongoose.model('Link', LinkSchema); 