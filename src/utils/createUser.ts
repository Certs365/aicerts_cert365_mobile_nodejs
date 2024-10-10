import CustomError from "../middlewares/customError";
import User, { IUser } from "../models/user"; // Adjust path if needed


interface CreateUserResponse {
  code: number;
  status: boolean;
  user?: IUser;
  message?: string;
  details?: object;
}

export const createUser = async (profile: any, accessToken: string, sourceApp:string): Promise<CreateUserResponse> => {
  try {
    const { id, displayName, emails, email } = profile;

    // Check if emails is defined and has at least one email
    const userEmail = email || (emails && emails.length > 0 ? emails[0].value : null);

    if (!userEmail) {
      throw new CustomError("Email is required", 400); // Use CustomError here
    }

    // Check if user exists by googleId
    let user = await User.findOne({ googleId: id });
    if (user){
      user.sourceApp=sourceApp
      await user.save()
    }

    if (!user) {
      // Check if user exists by email
      user = await User.findOne({ email: userEmail });
      if (user) {
        // If user exists with email, link googleId to their account
        user.googleId = id;
        user.sourceApp=sourceApp
        await user.save();
      } else {
        // Create a new user if not found
        user = new User({
          googleId: id,
          username: displayName,
          email: userEmail,
          sourceApp: sourceApp,
        });

        await user.save();
      }
    }

    const response = {
      _id: user._id,
      userId: user.googleId,
      email: user.email,
      userName: user.username,
      token: accessToken,
    };

    return {
      code: 200,
      status: true,
      details: response,
    };
  } catch (error) {
    // If the error is an instance of CustomError, use it; otherwise create a generic one
    const detail = error instanceof CustomError ? error.message : "Unknown error";
    const statusCode = error instanceof CustomError ? error.statusCode : 400;

    // Handle errors
    return {
      code: statusCode,
      status: false,
      message: "Error while creating user",
      details: { detail },
    };
  }
};
