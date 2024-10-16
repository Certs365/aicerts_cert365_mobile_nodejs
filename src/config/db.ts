import mongoose, { ConnectOptions } from "mongoose";

// Define the async function with a return type of Promise<void>
// const connectDB = async (): Promise<void> => {
//   try {
//     // Check if the MONGO_URI environment variable exists
//     const mongoUri: string | undefined = process.env.MONGO_URI;

//     if (!mongoUri) {
//       // Throw an error if the MONGO_URI is not defined
//       throw new Error(
//         "MongoDB connection URI is not defined in environment variables."
//       );
//     }
//     // Mongoose's connect method accepts a URI string and an optional options object
//     const connection = await mongoose.connect(mongoUri, {} as ConnectOptions);
//     console.log(`MongoDB Connected: ${connection.connection.host}`);
//   } catch (error: any) {
//     // Log the error message and exit the process with failure
//     console.error(`Error: ${error.message}`);
//     process.exit(1);
//   }
// };

const connectDB = async (): Promise<boolean> => {
  var connection = null;
  try {
    const mongoUri: string | undefined = process.env.MONGO_URI;

    if (!mongoUri) {
      console.error("MongoDB connection URI is not defined in environment variables.");
      return false; // Return false if URI is not defined
    }
    // console.log("Connecting to MongoDB with URI:", mongoUri);
    // Use connection options
    connection = await mongoose.connect(mongoUri);
    console.log(`MongoDB Connected: ${connection.connection.host}`);
    if(connection == null){
      return false;
    }
    return true; // Return true if connection is successful
  } catch (error: any) {
    console.error(`Error: ${error.message}`);
    return false; // Return false if there is an error
  }
};

export default connectDB;
