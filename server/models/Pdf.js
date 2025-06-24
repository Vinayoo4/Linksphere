import mongoose from 'mongoose';

const PdfSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  url: { type: String, required: true },
  size: { type: String },
  filename: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date }
});

export default mongoose.model('Pdf', PdfSchema); 