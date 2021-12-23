import { Schema } from "mongoose";

import { DOB } from "../../types/user";

export default new Schema<DOB>(
  {
    day: {
      type: Number,
      minLength: 1,
      maxLength: 31,
      required: true,
    },
    month: {
      type: Number,
      min: 1,
      max: 12,
      required: true,
    },
    year: {
      type: Number,
      min: 1980,
      max: 2022,
      required: true,
    },
  },
  { _id: false }
);
