import { Schema } from "mongoose";

import { Name } from "../../types/user";

export default new Schema<Name>(
  {
    first: {
      type: String,
      minLength: 2,
      maxLength: 25,
      trim: true,
      required: true,
    },
    last: {
      type: String,
      minLength: 2,
      maxLength: 25,
      trim: true,
      required: true,
    },
  },
  { _id: false }
);
