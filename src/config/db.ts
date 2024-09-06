import mongoose, { ConnectOptions } from "mongoose";

// Define the async function with a return type of Promise<void>
const connectDB = async (): Promise<void> => {
  try {
    // Check if the MONGO_URI environment variable exists
    const mongoUri: string | undefined = process.env.MONGO_URI;

    if (!mongoUri) {
      // Throw an error if the MONGO_URI is not defined
      throw new Error(
        "MongoDB connection URI is not defined in environment variables."
      );
    }

    // Mongoose's connect method accepts a URI string and an optional options object
    const connection = await mongoose.connect(mongoUri, {} as ConnectOptions);

    console.log(`MongoDB Connected: ${connection.connection.host}`);
  } catch (error: any) {
    // Log the error message and exit the process with failure
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
