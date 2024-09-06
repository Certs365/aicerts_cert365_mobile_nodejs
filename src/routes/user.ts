import { Router } from "express";
import { signup } from "../controllers/user";
import { googleAuth, googleAuthCallback, googleAuthRedirect } from "../config/googleStrategy";
import { linkedinAuth, linkedinAuthCallback, linkedinAuthRedirect } from "../config/linkedinStrategy";

const router = Router()
router.route("/signup").post(signup)

// route to initiate Google OAuth login
router.route("/auth/google").get(googleAuth)
router.get("/auth/google/callback", googleAuthCallback, googleAuthRedirect)

// Route to initiate Linkedin OAuth login
router.get("/auth/linkedin", linkedinAuth)
router.get("/auth/linkedin/callback", linkedinAuthCallback, linkedinAuthRedirect)

export default router