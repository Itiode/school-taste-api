import mongoose, { Schema } from 'mongoose';
import Joi from 'joi';

import { PostComment, AddPostCommentData, ReactToPostCommentParams } from '../../types/comment/post-comment';
import ReactionSchema from '../schemas/reaction';

const schema = new Schema<PostComment>({
  text: {
    type: String,
    trim: true,
    minLength: 1,
    maxLength: 1000,
    required: true,
  },
  postId: { type: Schema.Types.ObjectId, required: true },
  creator: {
    id: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    name: {
      type: String,
      trim: true,
      minLength: 5,
      maxLength: 50,
      required: true,
    },
  },
  date: { type: Date, default: Date.now },
  reactions: [ReactionSchema],
  reactionCount: Number,
});

export default mongoose.model('Post-Comment', schema);

export function validateAddPostCommentData(data: AddPostCommentData) {
  return Joi.object({
    text: Joi.string().trim().min(1).max(1000).required(),
    postId: Joi.string()
      .trim()
      .regex(new RegExp('^[0-9a-fA-F]{24}$'))
      .required(),
  }).validate(data);
}

export function validateReactToPostCommentParams(data: ReactToPostCommentParams) {
  return Joi.object({
    commentId: Joi.string()
      .trim()
      .regex(new RegExp('^[0-9a-fA-F]{24}$'))
      .required(),
  }).validate(data);
}
