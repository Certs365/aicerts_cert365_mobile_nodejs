import { Strategy as LinkedInStrategy, Profile as LinkedInProfile } from 'passport-linkedin-oauth2';
import dotenv from 'dotenv';
import passport from 'passport';
import User, { IUser } from '../models/user'; // Adjust path if needed
import { createUser } from '../utils/createUser'; // Adjust path if needed
import { Request, Response } from 'express';

dotenv.config();

// LinkedIn Authentication Middleware
export const linkedinAuth = passport.authenticate('linkedin', {
  state: 'SOME STATE',  // Optional, can be used for CSRF protection
  scope: ['profile', 'email'],
});

export const linkedinAuthCallback = passport.authenticate('linkedin', {
  failureRedirect: '/',
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
    scope: ['profile', 'email'],
  },
  async (accessToken: string, refreshToken: string, profile: LinkedInProfile, done: passport.DoneCallback) => {
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
);

passport.serializeUser((user: any, done: (err: any, id?: any) => void) => {
    done(null, user.id);
  });

passport.deserializeUser(async (id: string, done: (err: any, user?: IUser | null) => void) => {
  try {
    const user = await User.findById(id); // Retrieve user by ID
    console.log('user in deserialize', user);
    done(null, user);
  } catch (error) {
    done(error as Error, null);
  }
});
