import { Schema } from "mongoose";

import { Reaction } from "../../types/shared";

export default new Schema<Reaction>(
  {
    userId: Schema.Types.ObjectId,
    type: {
      type: String,
      trim: true,
      enum: [
        "like",
        "love",
        "celebrate",
        "support",
        "curious",
        "sad",
        "crying",
      ],
    },
  },
  { _id: false }
);
