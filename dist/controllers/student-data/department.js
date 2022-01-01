"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDepartments = exports.addDepartment = void 0;
const department_1 = __importStar(require("../../models/student-data/department"));
const addDepartment = async (req, res, next) => {
    const { error } = (0, department_1.valAddDepReqBody)(req.body);
    if (error)
        return res.status(400).send({ msg: error.details[0].message });
    try {
        const { name } = req.body;
        const fetchedDep = await department_1.default.findOne({ name });
        if (fetchedDep)
            return res.status(400).send({ msg: "Department already added" });
        await new department_1.default({
            name,
        }).save();
        res.send({ msg: "Department added successfully" });
    }
    catch (e) {
        next(new Error("Error in adding department: " + e));
    }
};
exports.addDepartment = addDepartment;
const getDepartments = async (req, res, next) => {
    try {
        const deps = await department_1.default.find().select("-__v").sort({ name: 1 });
        const transformedDeps = deps.map((d) => {
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
    }
    catch (e) {
        next(new Error("Error in getting department: " + e));
    }
};
exports.getDepartments = getDepartments;
