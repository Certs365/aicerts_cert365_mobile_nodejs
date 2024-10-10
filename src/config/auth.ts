import dotenv from 'dotenv';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

dotenv.config();

const JWTSecret = process.env.ACCESS_TOKEN_SECRET as string;

export const ensureAuthenticated = (req: Request, res: Response, next: NextFunction): void => {
    const authorizationHeader = req.headers["authorization"];

    if (!authorizationHeader) {
        console.log("No authorization header found");
        res.status(401).json({
            status: 400,
            success: false,
            message: "Unauthorized access. No token provided.",
            details: null,
          });
          return;
    }

    const [bearer, token] = authorizationHeader.split(' ');

    if (!token || bearer.toLowerCase() !== 'bearer') {
        console.log("Invalid authorization header format");
        res.status(401).json({
            status: 400,
            success: false,
            message: "Unauthorized access. Invalid token format.",
            details: null,
          });
          return;
    }

    jwt.verify(token, JWTSecret, (err: Error | null) => {
        if (err) {
            console.log("JWT token error: ", err);
            res.status(401).json({
                status: 400,
                success: false,
                message: "Unauthorized access. Invalid token.",
                details: null,
              });
              return;
        }
        next();
    });
};
