import mongoose, { Schema } from 'mongoose';

import { News } from '../types/news';
import ReactionSchema from './schemas/reaction';

const schema = new Schema<News>({
  author: {
    id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, trim: true, maxLength: 250, required: true },
  },
  title: { type: String, trim: true, maxLength: 100, required: true },
  body: { type: String, trim: true, maxLength: 500 },
  school: {
    fullName: { type: String, trim: true, maxLength: 250, required: true },
    shortName: {
      type: String,
      trim: true,
      uppercase: true,
      maxLength: 25,
      required: true,
    },
  },
  studentData: {
    department: { type: String, trim: true, maxLength: 250, required: true },
    faculty: { type: String, trim: true, maxLength: 250, required: true },
    level: {
      type: String,
      trim: true,
      minLength: 3,
      maxLength: 3,
      required: true,
    },
  },
  searchText: { type: String, trim: true, maxLength: 500, required: true },
  tags: { type: [String] },
  date: { type: Date, default: Date.now },
  reactions: [ReactionSchema],
  reactionCount: Number,
  views: [String],
  viewCount: Number,
  commentCount: Number,
});

export default mongoose.model('New', schema);
