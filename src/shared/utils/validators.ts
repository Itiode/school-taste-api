import Joi from 'joi';

import { validReactionTypes, validSubPostTypes } from '../constants';

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
