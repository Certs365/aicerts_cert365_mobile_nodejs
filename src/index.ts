import express, { Request, Response } from "express";
import dotenv from "dotenv";
import connectDB from "./config/db";
import passport from "passport";
import router from "./routes/user";
import { googleStrategy } from "./config/googleStrategy";
import { linkedinStrategy } from "./config/linkedinStrategy";
import { isAuthenticated } from "./middlewares/authMiddleware";
import errorHandler from "./middlewares/errorHandler";
import { generateJwtToken } from "./utils/authUtils";
import setupMiddleware from "./middlewares/setupMiddleware";
import { getSecurityTxt } from "./controllers/user";

const app = express();

// middleware setup
dotenv.config();
connectDB();
setupMiddleware(app)

// Use the configured Google OAuth strategy for Passport.js
passport.use(googleStrategy);
passport.use(linkedinStrategy);
// Disable the X-Powered-By header
app.disable('x-powered-by');

// Use the user-related routes under the "/api" endpoint
app.use("/api", router);
app.get("/", isAuthenticated, async (req: Request, res: Response) => {
  // If user is authenticated, retrieve their email
  const user = req.user as any; // 'req.user' is available after successful login
  const JWTToken = await generateJwtToken();
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
// Serve the security.txt file
app.get('/.well-known/security.txt',getSecurityTxt);

// Catch-all route for undefined endpoints
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    statusCode: 404,
    message: "Endpoint not found",
  });
});


app.use(errorHandler)

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`App running on port ${PORT}`);
});
