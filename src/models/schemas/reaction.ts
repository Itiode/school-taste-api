import { Schema } from "mongoose";

import Reaction from "../../types/reaction";

export default new Schema<Reaction>(
  {
    userId: Schema.Types.ObjectId,
    type: {
      type: String,
      trim: true,
      enum: [
        "Like",
        "Love",
        "Celebrate",
        "Support",
        "Curious",
        "Sad",
        "Crying",
      ],
    },
  },
  { _id: false }
);
