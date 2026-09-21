import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import * as userModel from "../models/user.model.js";
import { cookieOptions } from "../utils/cookieOptions.js";

export const createUser = async (req, res, next) => {
  const { name, email, password } = req.body;

  try {
    if (!name || !email || !password) {
      return res.status(400).json({
        status: "error",
        message: "Please enter all the mandatory fields",
      });
    }
    // check if existing user
    const isExistingUser = await userModel.findUserByEmail(email);
    if (isExistingUser) {
      return res.status(401).json({
        status: "error",
        message: "User with this email id already exists",
      });
    }

    const passwordhash = await bcrypt.hash(password, 10);
    const data = await userModel.createUser(name, email, passwordhash);
    console.log(data);
    return res.status(201).json({
      status: "success",
      message: "User created successfully",
      data,
    });
  } catch (error) {
    // console.log(error);
    next(error);
  }
};

export const login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res
        .status(400)
        .json({ status: "error", message: "Please enter email and password" });
    }
    const user = await userModel.findUserByEmail(email);

    if (!user) {
      return res
        .status(401)
        .json({ status: "error", message: "Invalid email or password" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ status: "error", message: "Invalid email or password" });
    }

    if (!process.env.SECRET_ACCESS_TOKEN || !process.env.SECRET_REFRESH_TOKEN) {
      return res
        .status(500)
        .json({ status: "error", message: "Server misconfigurations" });
    }

    const accessToken = jwt.sign(
      { id: user.id },
      process.env.SECRET_ACCESS_TOKEN,
      {
        expiresIn: "15m",
      },
    );
    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.SECRET_REFRESH_TOKEN,
      {
        expiresIn: "1d",
      },
    );

    res.cookie("accessToken", accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      status: "success",
      message: "Login successful",
      user: {
        id: user.id,
        userName: user.name,
        email: user.email,
      },
      token: accessToken,
    });
  } catch (error) {
    // console.log(error);
    next(error);
  }
};
