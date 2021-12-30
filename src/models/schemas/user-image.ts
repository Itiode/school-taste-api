import { Schema } from "mongoose";

import { UserImage } from "../../types/user";

export default new Schema<UserImage>(
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
