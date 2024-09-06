import { Strategy as GoogleStrategy, VerifyCallback } from "passport-google-oauth2";
import dotenv from "dotenv";
import passport, {Profile} from "passport";



// Load environment variables
dotenv.config();

// Define types for request and response if needed
import { Request, Response, NextFunction } from "express";
import User from "../models/user";
import { createUser } from "../utils/createUser";

// Configure Google OAuth2 strategy

 export const googleStrategy= new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
      scope: ["profile", "email"],
    },
    async (accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) => {
      try {
        const result = await createUser(profile);
        if (result.success) {
          return done(null, result.user);
        } else {
          return done(new Error(result.message), null);
        }
      } catch (error) {
        return done(error as Error, null);
      }
    }
  )


// Serialize user ID into session
passport.serializeUser((user: any, done: (err: any, id?: any) => void) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id: string, done: (err: any, user?: any) => void) => {
  try {
    const user = await User.findById(id);
    console.log("user in deserialize", user);
    done(null, user);
  } catch (error) {
    done(error as Error, null);
  }
});

// Define authentication routes
export const googleAuth = passport.authenticate("google", {
  scope: ["profile", "email"],
});

export const googleAuthCallback = passport.authenticate("google", {
  failureRedirect: "/",
});

export const googleAuthRedirect = (req: Request, res: Response) => {
  // Successful authentication, redirect home or wherever you want.
  res.redirect("/");
};
