import mongoose, { Schema } from "mongoose";

import { Level } from "../../types/student-data/level";

const schema = new Schema<Level>(
  {
    name: { type: String, trim: true, maxLength: 250, required: true },
  },
  { timestamps: false }
);

export default mongoose.model("Level", schema);
