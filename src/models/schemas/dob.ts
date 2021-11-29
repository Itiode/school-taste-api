import { Schema } from "mongoose";

import { DOB } from "../../types/user";

export default new Schema<DOB>(
  {
    day: {
      type: String,
      trim: true,
      minLength: 1,
      maxLength: 2,
      required: true,
    },
    month: {
      type: String,
      trim: true,
      minLength: 1,
      maxLength: 2,
      required: true,
    },
    year: {
      type: String,
      trim: true,
      minLength: 4,
      maxLength: 4,
      required: true,
    },
  },
  { _id: false }
);
