import mongoose, { Schema } from 'mongoose';

import Transaction from '../types/transaction';

const schema = new Schema<Transaction>({
  sender: { type: Schema.Types.ObjectId, ref: 'User' },
  receiver: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  description: {
    type: String,
    trim: true,
    minLength: 5,
    maxLength: 250,
    required: true,
  },
  amount: { type: Number, min: 1, max: 10, required: true },
  date: { type: Date, default: Date.now },
});

export default mongoose.model('Transaction', schema);
