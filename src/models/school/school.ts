import mongoose, { Schema } from "mongoose";
import Joi from "joi";

import { School, AddSchoolData } from "../../types/school/school";

const schema = new Schema<School>(
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
  { timestamps: false }
);

export default mongoose.model("School", schema);

export function validateAddSchoolData(data: AddSchoolData) {
  return Joi.object({
    fullName: Joi.string().trim().max(250).required(),
    shortName: Joi.string().trim().uppercase().max(25).required(),
  }).validate(data);
}
