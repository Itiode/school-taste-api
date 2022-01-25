"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLevels = void 0;
const level_1 = __importDefault(require("../../models/student-data/level"));
const getLevels = async (req, res, next) => {
    try {
        const levels = await level_1.default.find().select("-__v").sort({ name: 1 });
        const transformedLs = levels.map((f) => {
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
    }
    catch (e) {
        next(new Error("Error in getting levels: " + e));
    }
};
exports.getLevels = getLevels;
