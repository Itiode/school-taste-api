import { Schema } from "mongoose";

import Creator from "../../types/creator";

export default new Schema<Creator>(
  {
    id: Schema.Types.ObjectId,
    name: {
      type: String,
      minLength: 2,
      maxLength: 50,
      trim: true,
      required: true,
    },
  },
  { _id: false }
);
