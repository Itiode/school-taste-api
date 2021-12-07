import { Schema } from "mongoose";

import { Owner } from "../../types/shared";

export default new Schema<Owner>(
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
