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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const user_1 = __importStar(require("../models/user"));
const auth = async (req, res, next) => {
    const { error } = (0, user_1.validateAuthData)(req.body);
    if (error)
        return res.status(400).send({ msg: error.details[0].message });
    try {
        const user = await user_1.default.findOne({ email: req.body.email });
        if (!user)
            return res.status(404).send({ msg: "User not registered!" });
        const isPw = await bcryptjs_1.default.compare(req.body.password, user.password);
        if (!isPw)
            return res.status(400).send({ msg: "Invalid email or password." });
        res.send({
            msg: "Authentication successful",
            token: user.genAuthToken(),
        });
    }
    catch (e) {
        next(new Error("Error in authenticating user: " + e));
    }
};
exports.auth = auth;
