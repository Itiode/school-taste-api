import { Schema } from "mongoose";

import { PaymentDetails } from "../../types/user";

export default new Schema<PaymentDetails>(
  {
    bankName: { type: String, trim: true, minLength: 1, maxLength: 500 },
    bankSortCode: { type: String, trim: true, minLength: 1, maxLength: 5 },
    accountType: {
      type: String,
      trim: true,
      enum: ["Current", "Savings", "Fixed"],
    },
    accountName: { type: String, trim: true, minLength: 5, maxLength: 250 },
    accountNumber: { type: String, trim: true, minLength: 10, maxLength: 10 },
    currency: { type: String, trim: true, minLength: 1, maxLength: 5 },
  },
  { _id: false }
);
