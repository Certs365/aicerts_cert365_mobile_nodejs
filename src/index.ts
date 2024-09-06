import express, { Request, Response } from "express";
import dotenv from "dotenv"
import connectDB from "./config/db";
import cors from "cors"
import session from "express-session";
import passport from "passport";
import router from "./routes/user";
import { googleStrategy } from "./config/googleStrategy";
import { linkedinStrategy } from "./config/linkedinStrategy";
import { isAuthenticated } from "./middlewares/authMiddleware";

const app = express()

// middleware setup
dotenv.config()
connectDB()
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended:true}))

// Configure session management
app.use(
    session({
      secret: "LearnJuly29$$@#", // Secret key to sign the session ID cookie
      resave: false, // Prevents saving session if it wasn't modified during the request
      saveUninitialized: true, // Save uninitialized sessions (new but not modified)
    })
  );

  // Initialize Passport.js for authentication
app.use(passport.initialize());
app.use(passport.session()); // Enable persistent login sessions

// Use the configured Google OAuth strategy for Passport.js
passport.use(googleStrategy);
passport.use(linkedinStrategy)


// Use the user-related routes under the "/api" endpoint
app.use("/api", router);
app.get("/", isAuthenticated, (req: Request, res: Response) => {
  // If user is authenticated, retrieve their email
  const user = req.user as any; // 'req.user' is available after successful login
  if (user) {
    res.status(200).json({
      status: 200,
      success: true,
      message: "Welcome to the home page",
      details: { email: user.email }, // Display user's email
    });
  } else {
    res.status(403).json({
      status: 403,
      success: false,
      message: "User not authenticated",
      details: null,
    });
  }
});

const PORT = process.env.PORT || 3000
app.listen(PORT, ()=>{
    console.log("app running on port 3001")
})