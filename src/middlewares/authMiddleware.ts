import { NextFunction, Request, Response } from "express";


export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    if (req.isAuthenticated()) {
      return next(); // If the user is authenticated, allow access
    }
    res.redirect("/login"); // Otherwise, redirect to login
  };