import mongoose, { Document, Schema, Model, CallbackError } from "mongoose";
import bcrypt from "bcryptjs";

// Define an interface for the User document (with methods)
export interface IUser extends Document {
  googleId?: string;
  username: string;
  email: string;
  password?: string;
  sourceApp: string;
  createdAt: Date;

  matchPassword(enteredPassword: string): Promise<boolean>;
}

// Create a Mongoose schema for the User model
const userSchema: Schema<IUser> = new Schema({
  googleId: {
    type: String,
    unique: true,
    sparse: true, // Allows uniqueness check only if the field is set
  },
  username: {
    type: String,
    required: [true, "Username is required"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/.+@.+\..+/, "Please enter a valid email address"],
  },
  password: {
    type: String,
    required: function (this: IUser) {
      return !this.googleId;
    },
    minlength: [6, "Password must be at least 6 characters long"],
  },
  sourceApp: {
    type: String,
    required: [true, "Source application is required"],
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Pre-save middleware to hash password before saving user
userSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password as string, salt); // TypeScript requires casting when field is optional
    next();
  } catch (error) {
    next(error as CallbackError);
  }
});

// Method to compare entered password with hashed password in the database
userSchema.methods.matchPassword = async function (
  enteredPassword: string
): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password as string);
};

// Create the User model with the IUser interface
const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);

export default User;
