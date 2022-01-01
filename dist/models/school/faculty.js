"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.valUpdateFacultyReqBody = exports.valAddFacultyReqBody = void 0;
const joi_1 = __importDefault(require("joi"));
function valAddFacultyReqBody(data) {
    return joi_1.default.object({
        facultyName: joi_1.default.string().trim().max(250).required(),
    }).validate(data);
}
exports.valAddFacultyReqBody = valAddFacultyReqBody;
function valUpdateFacultyReqBody(data) {
    return joi_1.default.object({
        facultyId: joi_1.default.string()
            .trim()
            .regex(new RegExp("^[0-9a-fA-F]{24}$"))
            .required(),
    }).validate(data);
}
exports.valUpdateFacultyReqBody = valUpdateFacultyReqBody;
