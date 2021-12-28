import { RequestHandler } from "express";

import SchoolModel, { validateAddSchoolData } from "../models/school/school";
import {
  School,
  AddSchoolData,
  GetSchoolsRes,
  SchoolData,
} from "../types/school";
import { SimpleRes } from "../types/shared";

export const addSchool: RequestHandler<any, SimpleRes, AddSchoolData> = async (
  req,
  res,
  next
) => {
  const { error } = validateAddSchoolData(req.body);
  if (error) return res.status(400).send({ msg: error.details[0].message });

  try {
    const { shortName, fullName } = req.body;

    const fetchedSchool = await SchoolModel.findOne({ shortName, fullName });
    if (fetchedSchool)
      return res.status(400).send({ msg: "School already added" });

    await new SchoolModel({
      shortName,
      fullName,
    }).save();

    res.send({ msg: "School added successfully" });
  } catch (e) {
    next(new Error("Error in adding school: " + e));
  }
};

export const getSchools: RequestHandler<any, GetSchoolsRes | SimpleRes> =
  async (req, res, next) => {
    try {
      const schools = await SchoolModel.find()
        .select("-__v")
        .sort({ shortName: 1 });

      const transformedSchs: SchoolData[] = schools.map((s: School) => {
        return {
          id: s._id,
          shortName: s.shortName,
          fullName: s.fullName,
        };
      });

      return res.send({
        msg: "Schools gotten successfully",
        schoolCount: transformedSchs.length,
        data: transformedSchs,
      });
    } catch (e) {
      next(new Error("Error in getting schools: " + e));
    }
  };
