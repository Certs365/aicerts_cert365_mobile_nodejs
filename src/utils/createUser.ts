
import User, {IUser} from "../models/user";

interface CreateUserResponse {
  status: number;
  success: boolean;
  user?: IUser;
  message?: string;
  details?: string;
}

export const createUser = async (profile: any): Promise<CreateUserResponse> => {
  try {
    const { id, displayName, emails , email} = profile;

    // Check if emails is defined and has at least one email
    const userEmail = email || (emails && emails.length > 0 ? emails[0].value : null);


    if (!userEmail) {
      return {
        status: 400,
        success: false,
        message: "Email is required",
      };
    }

    // Check if user exists by googleId
    let user = await User.findOne({ googleId: id });
    if (!user) {
      // Check if user exists by email
      user = await User.findOne({ email: userEmail });
      if (user) {
        // If user exists with email, link googleId to their account
        user.googleId = id;
        await user.save();
      } else {
        user = new User({
          googleId: id,
          username: displayName,
          email: userEmail,
          sourceApp: "certs365",
        });

        await user.save();
      }
    }

    return {
      status: 200,
      success: true,
      user,
    };
  } catch (error) {
    // Handle errors
    return {
      status: 400,
      success: false,
      message: "Error while creating user",
      details: error instanceof Error ? error.message : "Unknown error",
    };
  }
};
