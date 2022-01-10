import { Schema } from "mongoose";

import { Image } from "../../types/shared";

export default new Schema<Image>(
  {
    original: {
      url: { type: String, trim: true },
      dUrl: { type: String, trim: true },
    },
    thumbnail: {
      url: { type: String, trim: true },
      dUrl: { type: String, trim: true },
    },
  },
  { _id: false }
);
