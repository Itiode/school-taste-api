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
exports.reactToSubPost = void 0;
const user_1 = __importDefault(require("../models/user"));
const sub_post_1 = __importStar(require("../models/sub-post"));
const validators_1 = require("../shared/utils/validators");
const reactToSubPost = async (req, res, next) => {
    try {
        const { error } = (0, sub_post_1.validateReactToSubPostParams)(req.params);
        if (error)
            return res.status(400).send({ msg: error.details[0].message });
        const { reactionType } = req.body;
        const rxTypeIsValid = (0, validators_1.validateReactionType)(reactionType);
        if (!rxTypeIsValid)
            return res.status(400).send({ msg: "Invalid reaction type" });
        const userId = req["user"].id;
        const user = await user_1.default.findById(userId).select("_id");
        if (!user)
            return res.status(404).send({ msg: "No user with the given ID" });
        const { subPostId } = req.params;
        const subPost = await sub_post_1.default.findById(subPostId).select("_id reactions");
        if (!subPost)
            return res.status(404).send({ msg: "No sub post with the given ID" });
        const reaction = subPost.reactions.find((reaction) => reaction.userId.toHexString() === userId);
        if (reaction) {
            // If the user doesn't want to react anymore
            if (reaction.type === reactionType) {
                await sub_post_1.default.updateOne({ _id: subPostId }, { $pull: { reactions: { userId } } });
                await sub_post_1.default.updateOne({ _id: subPostId }, { $inc: { reactionCount: -1 } });
                // If the user changes their reaction.
            }
            else {
                await sub_post_1.default.updateOne({ _id: subPostId }, { $pull: { reactions: { userId } } });
                await sub_post_1.default.updateOne({ _id: subPostId }, { $push: { reactions: { userId, type: reactionType } } });
            }
            return res.send({ msg: "Reacted to sub post successfully" });
        }
        // When the user reacts for the first time.
        await sub_post_1.default.updateOne({ _id: subPostId }, { $push: { reactions: { userId, type: reactionType } } });
        await sub_post_1.default.updateOne({ _id: subPostId }, { $inc: { reactionCount: 1 } });
        res.send({ msg: "Reacted to sub post successfully" });
    }
    catch (e) {
        next(new Error("Error in reacting to sub post: " + e));
    }
};
exports.reactToSubPost = reactToSubPost;
