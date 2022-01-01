import { RequestHandler } from "express";

import FacultyModel, {
  valAddFacultyReqBody,
} from "../../models/student-data/faculty";
import { SimpleRes } from "../../types/shared";
import {
  Faculty,
  FacultyData,
  AddFacultyReqBody,
  GetFacultiesResBody,
} from "../../types/student-data/faculty";

export const addFaculty: RequestHandler<any, SimpleRes, AddFacultyReqBody> =
  async (req, res, next) => {
    const { error } = valAddFacultyReqBody(req.body);
    if (error) return res.status(400).send({ msg: error.details[0].message });

    try {
      const { name } = req.body;

      const fetchedFaculty = await FacultyModel.findOne({ name });
      if (fetchedFaculty)
        return res.status(400).send({ msg: "Faculty already added" });

      await new FacultyModel({
        name,
      }).save();

      res.send({ msg: "Faculty added successfully" });
    } catch (e) {
      next(new Error("Error in adding faculty: " + e));
    }
  };

export const getFaculties: RequestHandler<
  any,
  GetFacultiesResBody | SimpleRes
> = async (req, res, next) => {
  try {
    const faculties = await FacultyModel.find()
      .select("-__v")
      .sort({ name: 1 });

    const transformedFs: FacultyData[] = faculties.map((f: Faculty) => {
      return {
        id: f._id,
        name: f.name,
      };
    });

    return res.send({
      msg: "Faculties gotten successfully",
      facultyCount: transformedFs.length,
      data: transformedFs,
    });
  } catch (e) {
    next(new Error("Error in getting faculties: " + e));
  }
};
