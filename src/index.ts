import express, { Request, Response } from "express";
import dotenv from "dotenv";
import connectDB from "./config/db";
import cors from "cors";
import session from "express-session";
import passport from "passport";
import router from "./routes/user";
import { googleStrategy } from "./config/googleStrategy";
import { linkedinStrategy } from "./config/linkedinStrategy";
import { isAuthenticated } from "./middlewares/authMiddleware";
import errorHandler from "./middlewares/errorHandler";
import { generateJwtToken } from "./utils/authUtils";

const app = express();

// middleware setup
dotenv.config();
connectDB();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
passport.use(linkedinStrategy);

// Use the user-related routes under the "/api" endpoint
app.use("/api", router);
app.get("/", isAuthenticated, (req: Request, res: Response) => {
  // If user is authenticated, retrieve their email
  const user = req.user as any; // 'req.user' is available after successful login
  const JWTToken = generateJwtToken();
  if (user) {
    // Format the response according to the frontend team's needs
    const responseData = {
      success: true,
      statusCode: 200,
      code: JWTToken,
      message: "Credential is valid",
      data: {
        id: user.googleId, // User's ID (use user.id if you store it in a different field)
        email: user.email, // User's email
        nickname: user.username, // Assuming 'username' is available in the user object
        firstName: user.firstName || "", // Optional, fill in if available
        lastName: user.lastName || "", // Optional, fill in if available
        displayName: user.username, // Display name for the user
      },
    };

    // Convert the response data to a JSON string for the deep link
    const jsonResponse = JSON.stringify(responseData);

    // Construct the deep link URL
    const deepLink = `app.certs365.com://auth/?response=${encodeURIComponent(
      jsonResponse
    )}`;
    console.log("Authentication successfull...")

     // Redirect the user to the deep link
     // Return an HTML page with JavaScript for redirection
     res.send(`
      <html>
        <head>
          <title>Redirecting...</title>
          <script type="text/javascript">
            window.location.href = "${deepLink}";
          </script>
        </head>
        <body>
          Redirecting...
        </body>
      </html>
    `);
  } else {
    res.status(403).json({
      status: 403,
      success: false,
      message: "User not authenticated",
      details: null,
    });
  }
});

app.use(errorHandler)

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("app running on port 3001");
});
