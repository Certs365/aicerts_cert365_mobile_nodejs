import { Strategy as LinkedInStrategy, Profile as LinkedInProfile } from 'passport-linkedin-oauth2';
import dotenv from 'dotenv';
import passport from 'passport';
import User, { IUser } from '../models/user'; // Adjust path if needed
import { createUser } from '../utils/createUser'; // Adjust path if needed
import { Request, Response } from 'express';
import CustomError from '../middlewares/customError';

dotenv.config();

// LinkedIn Authentication Middleware
export const linkedinAuth = passport.authenticate('linkedin', {
  state: 'SOME STATE',  // Optional, can be used for CSRF protection
  scope: ['profile', 'email'],
});

export const linkedinAuthCallback = passport.authenticate('linkedin', {
  failureRedirect: '/login',
});

export const linkedinAuthRedirect = (req: Request, res: Response): void => {
  // Successful authentication, redirect home or wherever you want.
  res.redirect('/');
};

// LinkedIn Strategy Configuration
export const linkedinStrategy = new LinkedInStrategy(
  {
    clientID: process.env.LINKEDIN_CLIENT_ID!,
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
    callbackURL: process.env.LINKEDIN_CALLBACK_URL!,
    scope: ['profile', 'email', "openid"],
  },
  async (accessToken: string, refreshToken: string, profile: LinkedInProfile, done: passport.DoneCallback) => {
    try {
      
      const result = await createUser(profile, accessToken);
      if (result.status) {
        return done(null, result);
      } else {
         // Use CustomError for standardized error response
         return done(new CustomError(result.message || "Error while creating user", 400));
      }
    } catch (error) {
      // Return an internal server error if something goes wrong
      return done(new CustomError("Internal server error", 500));
    }
  }
);

passport.serializeUser((user: any, done: (err: any, id?: any) => void) => {
    done(null, user.details._id);
  });

passport.deserializeUser(async (id: string, done: (err: any, user?: IUser | null,) => void) => {
  try {
    const user = await User.findById(id); // Retrieve user by ID
    done(null, user);
  } catch (error) {
    done(new CustomError("Failed to deserialize user", 500));
  }
});
