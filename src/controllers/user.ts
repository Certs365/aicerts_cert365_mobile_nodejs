import mongoose, { MongooseError } from "mongoose";
import { NextFunction, Request, Response } from "express";
import User from "../models/user";

// Define the signup controller function with typed parameters
export const signup = async (req: Request, res: Response): Promise<void> => {
  const { username, email, password, sourceApp } = req.body;

  // Basic input validation
  if (!username || !email || !password || !sourceApp) {
    res.status(400).json({
      status: 400,
      success: false,
      message: "All fields are required",
      details: null,
    });
    return;
  }

  try {
    // Check if the user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400).json({
        status: 400,
        success: false,
        message: "User already exists",
        details: null,
      });
      return;
    }

    // Create a new user
    const user = new User({
      username,
      email,
      password,
      sourceApp,
    });

    // Save the user to the database
    await user.save();

    // Return success response with user details
    res.status(201).json({
      status: 201,
      success: true,
      message: "User registered successfully",
      details: {
        id: user._id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    let statusCode = 500;
    let errorMessage = "Internal server error";
    let errorDetails: any = null;

    // Handle specific Mongoose validation errors
    if (error instanceof mongoose.Error.ValidationError) {
      const messages = Object.values(error.errors).map((val) => val.message);
      statusCode = 400;
      errorMessage = "Validation error";
      errorDetails = messages.join(", ");
    }

    // Handle unique constraint errors (e.g., duplicate email)
    else if (error instanceof mongoose.MongooseError) {
      statusCode = 400;
      errorMessage = "Email already in use";
    }

    // Log error details for further investigation
    console.error("Signup error:", error);

    // Return standardized error response
    res.status(statusCode).json({
      status: statusCode,
      success: false,
      message: errorMessage,
      details: errorDetails,
    });
  }
};

export const logoutHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  req.logOut((err) => {
    if (err) {
      next(err);
    }
    req.session.destroy((err) => {
      if (err) {
        next(err);
      }
      res.clearCookie("connect.sid");
      res.status(200).json({
        code: 200,
        status: true,
        message: "User logout Successfully..",
        details: "",
      });
    });
  });
};
