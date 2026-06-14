import mongoose, { Schema, Types } from 'mongoose';

const messageSchema = new Schema({
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  references: [{ type: Schema.Types.Mixed }],
  webSources: [{ title: String, url: String }],
  source: { type: String, enum: ['brain', 'web', 'greeting'], default: 'brain' }
}, { timestamps: true });

const chatSessionSchema = new Schema({
  userId: { type: Types.ObjectId, ref: 'User', required: true },
  title: { type: String, default: 'New Chat' },
  messages: [messageSchema],
}, { timestamps: true });

export default mongoose.model('ChatSession', chatSessionSchema);
