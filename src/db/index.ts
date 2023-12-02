import mongoose from "mongoose";

export const connnectDatabase = (
  uri: string
): Promise<typeof import("mongoose")> => {
  return mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
  });
};
