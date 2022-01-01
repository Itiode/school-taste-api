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
exports.getSchools = exports.addSchool = void 0;
const school_1 = __importStar(require("../../models/student-data/school"));
const addSchool = async (req, res, next) => {
    const { error } = (0, school_1.validateAddSchoolData)(req.body);
    if (error)
        return res.status(400).send({ msg: error.details[0].message });
    try {
        const { shortName, fullName } = req.body;
        const fetchedSchool = await school_1.default.findOne({ shortName, fullName });
        if (fetchedSchool)
            return res.status(400).send({ msg: "School already added" });
        await new school_1.default({
            shortName,
            fullName,
        }).save();
        res.send({ msg: "School added successfully" });
    }
    catch (e) {
        next(new Error("Error in adding school: " + e));
    }
};
exports.addSchool = addSchool;
const getSchools = async (req, res, next) => {
    try {
        const schools = await school_1.default.find()
            .select("-__v")
            .sort({ shortName: 1 });
        const transformedSchs = schools.map((s) => {
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
    }
    catch (e) {
        next(new Error("Error in getting schools: " + e));
    }
};
exports.getSchools = getSchools;
