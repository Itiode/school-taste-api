import Joi from "joi";

import { validReactionTypes, validSubPostTypes } from "../constants";

// TODO: To be implemented
export function validateIdWithJoi() {}

export function validateReactionType(rxType: string): boolean {
  const isValid = validReactionTypes.find((t) => t === rxType);

  return isValid ? true : false;
}

export function validateSubPostType(subPostType: string): boolean {
  const isValid = validSubPostTypes.find((t) => t === subPostType);

  return isValid ? true : false;
}

export const JoiValidators = {
  id: Joi.string().trim().pattern(new RegExp("^[0-9a-fA-F]{24}$")),
  phone: Joi.string().trim().min(11).max(11).pattern(new RegExp("^[0-9]*$")),
};
