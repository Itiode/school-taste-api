import { Schema } from "mongoose";

import { Metadata } from "../../types/shared";

export default new Schema<Metadata>(
  {
    original: {
      width: { type: Number },
      height: { type: Number },
    },
    thumbnail: {
      width: { type: Number },
      height: { type: Number },
    },
  },
  { _id: false }
);
