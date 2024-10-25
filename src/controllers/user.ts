import dotenv from 'dotenv';
import mongoose, { MongooseError } from "mongoose";
import { NextFunction, Request, Response } from "express";
import User from "../models/user";
import Authentication from "../models/schema";
import CustomError from "../middlewares/customError";
import path from "path";
import bcrypt from "bcryptjs";
import * as admin from 'firebase-admin';

import { generateOTP, sendEmail, sendWelcomeMail } from "../utils/customUtils";
import { generateJwtToken } from "../utils/authUtils";

dotenv.config();

interface ServiceAccount {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
  universe_domain?: string;  // Optional, if not always present
}

const serviceAccount: ServiceAccount = {
  type: process.env.TYPE as string,
  project_id: process.env.PROJECT_ID as string,
  private_key_id: process.env.PRIVATE_KEY_ID as string,
  private_key: process.env.PRIVATE_KEY?.replace(/\\n/g, '\n') as string,
  client_email: process.env.CLIENT_EMAIL as string,
  client_id: process.env.CLIENT_ID as string,
  auth_uri: process.env.AUTH_URI as string,
  token_uri: process.env.TOKEN_URI as string,
  auth_provider_x509_cert_url: process.env.AUTH_PROVIDER_X509_CERT_URL as string,
  client_x509_cert_url: process.env.CLIENT_X509_CERT_URL as string,
  universe_domain: process.env.UNIVERSE_DOMAIN,
};

// Initialize the app
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount), // Ensure correct type
});

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

    // Check if the user already exists in auth entry
    const authExist = await Authentication.findOne({ email });

    // Create a new user
    const user = new User({
      username,
      email,
      password,
      sourceApp,
    });

    // Save the user to the database
    await user.save();

    if (!authExist) {
      // Create an authencation entry for the new user
      const authentication = new Authentication({
        email
      });
      // Save the auth entry to the database
      await authentication.save();
    }

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

// Define the signup controller function with typed parameters
export const userSignup = async (req: Request, res: Response): Promise<void> => {
  const { username, email, password } = req.body;

  // Basic input validation
  if (!username || !email || !password) {
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

    // Check if the user already exists in auth entry
    const authExist = await Authentication.findOne({ email });

    // Create a new user
    const user = new User({
      username,
      email,
      password,
      sourceApp: "Certs365",
    });

    // Save the user to the database
    await user.save();

    if (!authExist) {
      // Create an authencation entry for the new user
      const authentication = new Authentication({
        email
      });
      // Save the auth entry to the database
      await authentication.save();
    }

    // Send welcome mail to the user on signup
    // await sendWelcomeMail(username, email);

    // Return success response with user details
    res.status(200).json({
      status: 200,
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
    console.error("User Signup error:", error);

    // Return standardized error response
    res.status(statusCode).json({
      status: statusCode,
      success: false,
      message: errorMessage,
      details: errorDetails,
    });
  }
};

// Define the simple user login controller function with typed parameters
export const userLogin = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  // Basic input validation
  if (!email || !password) {
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
    if (!userExists) {
      res.status(400).json({
        status: 400,
        success: false,
        message: "User not found / Invalid user",
        details: null,
      });
      return;
    }

    // Check if the given password is the same as the existing one
    const hashedPassword = userExists.password;

    if (typeof hashedPassword !== 'string') {
      res.status(400).json({
        status: 400,
        success: false,
        message: "Invalid password format.",
        details: null,
      });
      return;
    }
    const isSamePassword = await bcrypt.compare(password, hashedPassword);

    if (!isSamePassword) {
      res.status(400).json({
        status: 400,
        success: false,
        message: "Wrong password, Please check and try again...",
        details: null,
      });
      return;
    }

    const jwToken = await generateJwtToken();

    // Return success response with user details
    res.status(200).json({
      status: 200,
      success: true,
      code: jwToken,
      message: "User logged in successfully",
      data: {
        email: userExists.email,
        nickname: userExists.username,
        displayName: userExists.username
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
      errorMessage = "Email not found";
    }

    // Log error details for further investigation
    console.error("User Login error:", error);

    // Return standardized error response
    res.status(statusCode).json({
      status: statusCode,
      success: false,
      message: errorMessage,
      details: errorDetails,
    });
  }
};

export const _logoutHandler = (req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Cache-Control', 'no-store');  // Prevent caching for this route

  req.logOut((err) => {
    if (err) {
      return next(new CustomError("Logout failed", 500));
    }

    req.session.destroy((err) => {
      if (err) {
        return next(new CustomError("Session destruction failed", 500));
      }

      // Ensure the cookie is properly cleared
      res.clearCookie("connect.sid", { path: '/', httpOnly: true, secure: true, sameSite: 'lax' });

      res.status(200).json({
        code: 200,
        status: true,
        message: "User logged out successfully.",
        details: "",
      });
    });
  });
};

export const logoutHandler = (req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Cache-Control', 'no-store');  // Prevent caching for this route

  req.logOut((err) => {
    if (err) {
      return next({
        status: 500,
        message: "Logout failed",
        details: err.message
      });
    }

    req.session.destroy((err) => {
      if (err) {
        return next({
          status: 500,
          message: "Session destruction failed",
          details: err.message
        });
      }

      // Clear the cookie
      res.clearCookie("connect.sid", { path: '/', httpOnly: true, secure: true, sameSite: 'lax' });

      res.status(200).json({
        status: 200,
        success: true,
        message: "User logged out successfully.",
        details: null,
      });
    });
  });
};

// Define the forgotPassword controller function with typed parameters
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;
  try {
    // Check if the user already exists
    const userExists = await User.findOne({ email });
    // Return success response with user details
    if (userExists) {
      const authExist = await Authentication.findOne({ email });
      const getOTP = await generateOTP();
      if (authExist) {
        authExist.otp = getOTP;
        await authExist.save();
      } else {
        // Create an authencation entry for the new user
        const authentication = new Authentication({
          email: email,
          otp: getOTP
        });
        // Save the auth entry to the database
        await authentication.save();
      }
      // Push the OTP to the respective user email
      // await sendEmail(userExists.username, email, getOTP);
      res.status(200).json({
        status: 200,
        success: true,
        message: "User exists / Valid email",
        details: email,
      });
      return;
    } else {
      res.status(400).json({
        status: 400,
        success: false,
        message: "User / Email does not exist",
        details: email,
      });
      return;
    }
  } catch (error) {
    let statusCode = 500;
    let errorMessage = "Unable to reach the server, Please try again...";
    let errorDetails: any = null;

    // Handle specific Mongoose validation errors
    if (error instanceof mongoose.Error.ValidationError) {
      const messages = Object.values(error.errors).map((val) => val.message);
      statusCode = 400;
      errorMessage = "Validation error";
      errorDetails = messages.join(", ");
    }

    // Handle unique constraint errors (e.g., no email)
    else if (error instanceof mongoose.MongooseError) {
      statusCode = 400;
      errorMessage = "Email not found / Invalid email";
    }

    // Log error details for further investigation
    console.error("Forgot Password error:", error);

    // Return standardized error response
    res.status(statusCode).json({
      status: statusCode,
      success: false,
      message: errorMessage,
      details: errorDetails,
    });
  }
}

// Define the resetPassword controller function
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  try {
    // Check if the user already exists
    const userExists = await User.findOne({ email });
    // Return success response with user details
    if (userExists) {
      if (userExists.password) {
        // Check if the new password is the same as the previous one
        const isSamePassword = await bcrypt.compare(password, userExists.password);
        if (isSamePassword) {
          res.status(400).json({
            status: 400,
            success: false,
            message: "Password cannot be the same as the previous one!",
            details: email,
          });
          return;
        } else {
          userExists.password = password;
          await userExists.save();

          res.status(200).json({
            status: 200,
            success: true,
            message: "user password reset successfully",
            details: email,
          });
          return;
        }
      } else {
        userExists.password = password;
        await userExists.save();
        res.status(200).json({
          status: 200,
          success: true,
          message: "user password reset successfully",
          details: email,
        });
        return;
      }
    } else {
      res.status(400).json({
        status: 400,
        success: false,
        message: "User / Email does not exist",
        details: email,
      });
      return;
    }
  } catch (error) {
    let statusCode = 500;
    let errorMessage = "Unable to reach the server, Please try again...";
    let errorDetails: any = null;

    // Handle specific Mongoose validation errors
    if (error instanceof mongoose.Error.ValidationError) {
      const messages = Object.values(error.errors).map((val) => val.message);
      statusCode = 400;
      errorMessage = "Validation error";
      errorDetails = messages.join(", ");
    }

    // Handle unique constraint errors (e.g., no email)
    else if (error instanceof mongoose.MongooseError) {
      statusCode = 400;
      errorMessage = "Email not found / Invalid user";
    }

    // Log error details for further investigation
    console.error("Reset Password error:", error);

    // Return standardized error response
    res.status(statusCode).json({
      status: statusCode,
      success: false,
      message: errorMessage,
      details: errorDetails,
    });
  }
}

export const getSecurityTxt = (req: Request, res: Response) => {
  res.type('text/plain');
  res.sendFile(path.join(__dirname, '..', '.well-known', 'security.txt'));

}
