import { Schema } from "mongoose";

import { UserImage } from "../../types/user";

export default new Schema<UserImage>(
  {
    original: {
      url: { type: String, trim: true, required: true },
      dUrl: { type: String, trim: true, required: true },
    },
    thumbnail: {
      url: { type: String, trim: true, required: true },
      dUrl: { type: String, trim: true, required: true },
    },
  },
  { _id: false }
);
