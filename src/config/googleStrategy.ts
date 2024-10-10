import { Strategy as GoogleStrategy, VerifyCallback } from "passport-google-oauth2";
import dotenv from "dotenv";
import passport, {Profile} from "passport";



// Load environment variables
dotenv.config();

// Define types for request and response if needed
import { Request, Response, NextFunction } from "express";
import User from "../models/user";
import { createUser } from "../utils/createUser";
import CustomError from "../middlewares/customError";

// Configure Google OAuth2 strategy

 export const googleStrategy= new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
      scope: ["profile", "email"],
      passReqToCallback:true
    },
    async (req:Request,accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) => {
      try {

         // Extract sourceApp from the request's query
        const sourceApp = typeof req.query.state === 'string' ? req.query.state : "source app not provided"; // Use "default" if undefined

        const result = await createUser(profile, accessToken, sourceApp);
        if (result.status) {
          return done(null, result);
        } else {
          return done(new CustomError(result.message || "Error while creating user", 400)); // Use standardized error
        }
      } catch (error) {
        return done(new CustomError("Internal server error", 500)); // Handle any unexpected errors
      }
    }
  )


// Serialize user ID into session
passport.serializeUser((user: any, done: (err: any, id?: any) => void) => {
  done(null, user.details._id);
});

// Deserialize user from session
passport.deserializeUser(async (id: string, done: (err: any, user?: any) => void) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(new CustomError("Failed to deserialize user", 500));
  }
});

// Initiates Google OAuth login
export const googleAuth = (req: Request, res: Response, next: NextFunction) => {
  const sourceApp = req.query.sourceApp as string; // Extract sourceApp from the query
  
  passport.authenticate("google", {
    scope: ["profile", "email"],
    state: sourceApp, // Pass sourceApp via the state parameter
  })(req, res, next);
};

export const googleAuthCallback = passport.authenticate("google", {
  failureRedirect: "/login",
});

export const googleAuthRedirect = (req: Request, res: Response) => {
  // Successful authentication, redirect home or wherever you want.
  res.redirect("/");
};
