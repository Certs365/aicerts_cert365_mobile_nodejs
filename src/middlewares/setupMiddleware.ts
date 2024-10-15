import cors from "cors";
import session from "express-session";
import passport from "passport";
import express, { Request, Response } from "express";

const setupMiddleware = (app: any) => {
  app.use(cors({
    credentials: true, // Allow cookies to be sent with requests
  }));

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use(session({
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production', // Send cookie only over HTTPS in production
      httpOnly: true, // Prevent client-side access to the cookie
      sameSite: 'lax', // Use 'lax' or 'none' depending on your app's requirements
      maxAge: 1000 * 60 * 60 * 24, // Cookie expiry time
    },
  }));

  app.use(passport.initialize());
  app.use(passport.session());
};

export default setupMiddleware;
