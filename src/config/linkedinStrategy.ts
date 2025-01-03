import { Strategy as LinkedInStrategy, Profile as LinkedInProfile } from 'passport-linkedin-oauth2';
import dotenv from 'dotenv';
import passport from 'passport';
import User, { IUser } from '../models/user'; // Adjust path if needed
import { createUser } from '../utils/createUser'; // Adjust path if needed
import { Request, Response,NextFunction } from 'express';
import CustomError from '../middlewares/customError';

dotenv.config();

// LinkedIn Authentication Middleware
export const linkedinAuth = (req: Request, res: Response, next: NextFunction) => {
  const sourceApp = req.query.sourceApp as string; // Extract sourceApp from the query
  
  passport.authenticate('linkedin', {
    state: sourceApp,  // Optional, can be used for CSRF protection
    scope: ['openid', 'profile', 'email'],
  })(req, res, next);
};

// export const linkedinAuth = passport.authenticate('linkedin', {
//   state: 'SOME STATE',  // Optional, can be used for CSRF protection
//   scope: ['openid', 'profile', 'email'],
// });

export const linkedinAuthCallback = passport.authenticate('linkedin', {
  failureRedirect: '/login',
});

export const linkedinAuthRedirect = (req: Request, res: Response): void => {
  // Successful authentication, redirect home or wherever you want.
  res.redirect('/mob/');
};
export const linkedinStrategy = new LinkedInStrategy(
  {
    clientID: process.env.LINKEDIN_CLIENT_ID!,
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
    callbackURL: process.env.LINKEDIN_CALLBACK_URL!,
    scope: ['openid', 'profile', 'email'],
    passReqToCallback: true,
  },
  async (req: Request, accessToken: string, refreshToken: string, profile: LinkedInProfile, done: passport.DoneCallback) => {
    const sourceApp = typeof req.query.state === 'string' ? req.query.state : "source app not provided"; // Use "default" if undefined

    const maxRetries = 3; // Define the number of retries
    let attempt = 0;
    let result;

    while (attempt < maxRetries) {
      try {
        result = await createUser(profile, accessToken, sourceApp);
        if (result.status) {
          return done(null, result);
        } else {
          return done(new CustomError(result.message || "Error while creating user", 400));
        }
      } catch (error) {
        attempt++;
        if (attempt >= maxRetries) {
          // Return an internal server error if all attempts fail
          return done(new CustomError("Internal server error", 500));
        }
        // Optionally, you can add a delay before retrying
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retrying
      }
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
