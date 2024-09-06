import mongoose, { MongooseError } from "mongoose";
import { Request, Response } from "express";
import User from "../models/user";

// Define the signup controller function with typed parameters
export const signup = async (req: Request, res: Response): Promise<void> => {
  const { username, email, password, sourceApp } = req.body;

  // Basic input validation
  if (!username || !email || !password || !sourceApp) {
    res.status(400).json({ message: "All fields are required" });
    return;
  }

  try {
    // Check if the user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

    // Create a new user
    const user = new User({
      username,
      email,
      password,
      sourceApp
    });

    // Save the user to the database
    await user.save();
    console.log(user);

    // Return the user details in the response
    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    // Handle specific Mongoose errors
    if (error instanceof mongoose.Error.ValidationError) {
      // Handle validation errors (e.g., invalid email format)
      const messages = Object.values(error.errors).map((val) => val.message);
      res.status(400).json({ message: messages.join(", ") });
      return;
    }

    if (error instanceof mongoose.MongooseError) {
      // Handle unique constraint errors (e.g., duplicate email)
      res.status(400).json({ message: "Email already in use" });
      return;
    }

    // General error handling
    console.error("Signup error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
