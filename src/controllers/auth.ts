import { RequestHandler } from "express";
import bcrypt from "bcryptjs";

import { AuthRes } from "../types/user";
import UserModel, { validateAuthData } from "../models/user";

export const auth: RequestHandler<any, AuthRes> = async (req, res, next) => {
  const { error } = validateAuthData(req.body);
  if (error) return res.status(400).send({ msg: error.details[0].message });

  try {
    const user = await UserModel.findOne({ email: req.body.email });
    if (!user) return res.status(404).send({ msg: "User not registered!" });

    const isPw = await bcrypt.compare(req.body.password, user.password);
    if (!isPw)
      return res.status(400).send({ msg: "Invalid email or password." });

    res.send({
      msg: "Authentication successful",
      token: user.genAuthToken(),
    });
  } catch (e) {
    next(new Error("Error in authenticating user: " + e));
  }
};
