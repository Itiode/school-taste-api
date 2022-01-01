import { RequestHandler } from "express";

import DepModel, {
  valAddDepReqBody,
} from "../../models/student-data/department";
import { SimpleRes } from "../../types/shared";
import {
  Department,
  DepartmentData,
  AddDepReqBody,
  GetDepsResBody,
} from "../../types/student-data/department";

export const addDepartment: RequestHandler<any, SimpleRes, AddDepReqBody> =
  async (req, res, next) => {
    const { error } = valAddDepReqBody(req.body);
    if (error) return res.status(400).send({ msg: error.details[0].message });

    try {
      const { name } = req.body;

      const fetchedDep = await DepModel.findOne({ name });
      if (fetchedDep)
        return res.status(400).send({ msg: "Department already added" });

      await new DepModel({
        name,
      }).save();

      res.send({ msg: "Department added successfully" });
    } catch (e) {
      next(new Error("Error in adding department: " + e));
    }
  };

export const getDepartments: RequestHandler<any, GetDepsResBody | SimpleRes> =
  async (req, res, next) => {
    try {
      const deps = await DepModel.find().select("-__v").sort({ name: 1 });

      const transformedDeps: DepartmentData[] = deps.map((d: Department) => {
        return {
          id: d._id,
          name: d.name,
        };
      });

      return res.send({
        msg: "Departments gotten successfully",
        departmentCount: transformedDeps.length,
        data: transformedDeps,
      });
    } catch (e) {
      next(new Error("Error in getting department: " + e));
    }
  };
