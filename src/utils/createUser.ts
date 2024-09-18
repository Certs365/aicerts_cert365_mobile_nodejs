
import User, {IUser} from "../models/user";

interface CreateUserResponse {
  code: number;
  status: boolean;
  user?: IUser;
  message?: string;
  details?: object;
}

export const createUser = async (profile: any, accessToken:string): Promise<CreateUserResponse> => {
  try {
    const { id, displayName, emails , email} = profile;

    // Check if emails is defined and has at least one email
    const userEmail = email || (emails && emails.length > 0 ? emails[0].value : null);


    if (!userEmail) {
      return {
        code: 400,
        status: false,
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
    const response={
      _id:user._id,
      userId : user.googleId,
      email:user.email,
      userName:user.username,
      token:accessToken
    }

    return {
      code: 200,
      status: true,
      details:response
    };
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Unknown error"
    // Handle errors
    return {
      code: 400,
      status: false,
      message: "Error while creating user",
      details: {detail}
    };
  }
};
