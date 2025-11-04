import mongoose from 'mongoose';

const fileSchema = new mongoose.Schema({
  name: { type: String, required: true },
  content: { type: String, required: true },
  type: { type: String, enum: ['html', 'css', 'js', 'jsx', 'ts', 'tsx'], required: true }
});

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  prompt: String,
  files: [fileSchema],
  generatedCode: String,
  previewUrl: String,
  isPublic: { type: Boolean, default: false }
}, {
  timestamps: true
});

export default mongoose.model('Project', projectSchema);