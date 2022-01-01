import mongoose, { Schema } from "mongoose";
import Joi from "joi";

import { Department, AddDepReqBody } from "../../types/student-data/department";

const schema = new Schema<Department>(
  {
    name: { type: String, trim: true, maxLength: 250, required: true },
  },
  { timestamps: false }
);

export default mongoose.model("Department", schema);

export function valAddDepReqBody(data: AddDepReqBody) {
  return Joi.object({
    name: Joi.string().trim().max(250).required(),
  }).validate(data);
}
