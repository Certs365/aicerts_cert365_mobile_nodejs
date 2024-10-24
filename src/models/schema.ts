import mongoose, { Document, Schema, Model, CallbackError } from "mongoose";

// Define an interface for the Authentication
export interface UserAuth extends Document {
    email: string;
    otp?: number;
    status: string;
    createdAt: Date;
  }

// Create a Mongoose schema for the Authentication model
const authenticationSchema: Schema<UserAuth> = new Schema({
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/.+@.+\..+/, "Please enter a valid email address"],
    },
    otp: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      default: "Active",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    }
});

// Create the Authentication model with the IUser interface
const Authentication: Model<UserAuth> = mongoose.model<UserAuth>("Authentication", authenticationSchema);

export default Authentication;