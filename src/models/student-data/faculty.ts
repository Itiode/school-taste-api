import mongoose, { Schema } from "mongoose";
import Joi from "joi";

import { Faculty, AddFacultyReqBody } from "../../types/student-data/faculty";

const schema = new Schema<Faculty>(
  {
    name: { type: String, trim: true, maxLength: 250, required: true },
  },
  { timestamps: false }
);

export default mongoose.model("Faculty", schema);

export function valAddFacultyReqBody(data: AddFacultyReqBody) {
  return Joi.object({
    name: Joi.string().trim().max(250).required(),
  }).validate(data);
}
