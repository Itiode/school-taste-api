import { Schema } from "mongoose";

import { School } from "../../types/user";

export default new Schema<School>(
  {
    fullName: { type: String, trim: true, maxLength: 250, required: true },
    shortName: {
      type: String,
      trim: true,
      uppercase: true,
      maxLength: 25,
      required: true,
    },
  },
  { _id: false }
);
