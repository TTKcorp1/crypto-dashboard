import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  const rawUri = process.env.MONGO_URI;
  const mongoUri = rawUri?.trim();

  if (!mongoUri) {
    console.error("MONGO_URI is not defined or is empty.");
    process.exit(1);
  }

  try {
    console.log("Attempting to connect to MongoDB...");
    mongoose.set('strictQuery', false);
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error: any) {
    console.error(`MongoDB connection error: ${error.message}`);
    if (error.message.includes("authentication")) {
      console.error("→ Check your username/password in MONGO_URI");
    } else if (error.message.includes("ENOTFOUND")) {
      console.error("→ Check cluster name / internet connection");
    } else if (error.message.includes("buffering timed out")) {
      console.error("→ MongoDB server is unreachable or the URI is invalid");
    }
    process.exit(1);
  }
};

export default connectDB;   // ← This must be here