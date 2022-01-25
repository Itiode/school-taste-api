import { RequestHandler } from "express";

import LevelModel from "../../models/student-data/level";
import { SimpleRes } from "../../types/shared";
import {
  Level,
  LevelData,
  GetLevelsResBody,
} from "../../types/student-data/level";

export const getLevels: RequestHandler<
  any,
  GetLevelsResBody | SimpleRes
> = async (req, res, next) => {
  try {
    const levels = await LevelModel.find().select("-__v").sort({ name: -1 });

    const transformedLs: LevelData[] = levels.map((f: Level) => {
      return {
        id: f._id,
        name: f.name,
      };
    });

    return res.send({
      msg: "Levels gotten successfully",
      levelCount: transformedLs.length,
      data: transformedLs,
    });
  } catch (e) {
    next(new Error("Error in getting levels: " + e));
  }
};
