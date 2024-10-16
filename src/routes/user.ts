import { Request, Router, Response } from "express";
import { logoutHandler, signup } from "../controllers/user";
import { googleAuth, googleAuthCallback, googleAuthRedirect } from "../config/googleStrategy";
import { linkedinAuth, linkedinAuthCallback, linkedinAuthRedirect } from "../config/linkedinStrategy";
import connectDB from "../config/db";

const router = Router()
router.route("/signup").post(signup)

// Health check route
// router.get("/health", (req: Request, res: Response) => {
//   res.status(200).json({
//     success: true,
//     statusCode: 200,
//     message: "Service is up and running",
//     timestamp: new Date().toISOString(),
//   });
// });
router.get("/health", async (req: Request, res: Response) => {
  try {
    const dbStatus = await connectDB();
    const response = {
      success: true,
      statusCode: 200,
      message: "Service is up and running",
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version, // Version from package.json
      dependencies: {
        database: dbStatus == true ? "healthy" : "unhealthy",
      },
    };

    res.status(200).json(response);
  } catch (error) {
    // Handle error properly here
    const errorMessage = error instanceof Error ? error.message : "Service is not healthy";
    
    res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Service is not healthy",
      error: errorMessage,
      timestamp: new Date().toISOString(),
    });
  }
});

// route to initiate Google OAuth login
router.route("/auth/google").get(googleAuth)
router.get("/auth/google/callback", googleAuthCallback, googleAuthRedirect)

// Route to initiate Linkedin OAuth login
router.get("/auth/linkedin", linkedinAuth)
router.get("/auth/linkedin/callback", linkedinAuthCallback, linkedinAuthRedirect)

// Route to logout user 
router.post("/logout", logoutHandler)

export default router