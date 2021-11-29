import { Schema } from "mongoose";

import { StudentData } from "../../types/user";

export default new Schema<StudentData>(
  {
    department: { type: String, trim: true, maxLength: 250, required: true },
    faculty: { type: String, trim: true, maxLength: 250, required: true },
    level: {
      type: String,
      trim: true,
      enum: [
        "100 Level",
        "200 Level",
        "300 Level",
        "400 Level",
        "500 Level",
        "600 Level",
        "ND 1",
        "ND 2",
        "HND 1",
        "HND 2",
      ],
      required: true,
    },
  },
  { _id: false }
);
