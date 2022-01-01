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
exports.getFaculties = exports.addFaculty = void 0;
const faculty_1 = __importStar(require("../../models/student-data/faculty"));
const addFaculty = async (req, res, next) => {
    const { error } = (0, faculty_1.valAddFacultyReqBody)(req.body);
    if (error)
        return res.status(400).send({ msg: error.details[0].message });
    try {
        const { name } = req.body;
        const fetchedFaculty = await faculty_1.default.findOne({ name });
        if (fetchedFaculty)
            return res.status(400).send({ msg: "Faculty already added" });
        await new faculty_1.default({
            name,
        }).save();
        res.send({ msg: "Faculty added successfully" });
    }
    catch (e) {
        next(new Error("Error in adding faculty: " + e));
    }
};
exports.addFaculty = addFaculty;
const getFaculties = async (req, res, next) => {
    try {
        const faculties = await faculty_1.default.find()
            .select("-__v")
            .sort({ name: 1 });
        const transformedFs = faculties.map((f) => {
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
    }
    catch (e) {
        next(new Error("Error in getting faculties: " + e));
    }
};
exports.getFaculties = getFaculties;
