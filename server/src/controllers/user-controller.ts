import type { Request, Response } from "express";
import User from "../models/User.js";
import { signToken } from "../services/auth";

// create a user, sign a token, and send it back
export const createUser = async (req: Request, res: Response) => {
  try {
    const user = await User.create(req.body);

    if (!user) {
      return res.status(400).json({ message: "Something is wrong!" });
    }

    // Convert ObjectId to string before signing token
    const token = signToken({ _id: user._id.toString(), username: user.username });

    return res.json({ token, user });
  } catch (err) {
    return res.status(500).json({ message: "Internal Server Error", error: err });
  }
};

// login a user, sign a token, and send it back
export const login = async (req: Request, res: Response) => {
  try {
    const user = await User.findOne({ $or: [{ username: req.body.username }, { email: req.body.email }] });

    if (!user) {
      return res.status(400).json({ message: "Can't find this user" });
    }

    const correctPw = await user.isCorrectPassword(req.body.password);

    if (!correctPw) {
      return res.status(400).json({ message: "Wrong password!" });
    }

    // Convert ObjectId to string before signing token
    const token = signToken({ _id: user._id.toString(), username: user.username });

    return res.json({ token, user });
  } catch (err) {
    return res.status(500).json({ message: "Internal Server Error", error: err });
  }

};

export const getSingleUser = async (_req: any, _res: any) => {
  // your function logic
};

export const saveBook = async (_req: any, _res: any) => {
  // your function logic
};

export const deleteBook = async (_req: any, _res: any) => {
  // your function logic
};
