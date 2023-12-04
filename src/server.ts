import mongoose from "mongoose";
import { connnectDatabase } from "./db";
import http from "http";
import dotenvconfig from "./config/dotenvconfig";
import app from "./app";

const server: http.Server = http.createServer(app);

connnectDatabase(dotenvconfig.MONGO_URI)
  .then(() => {
    console.log("Database connected");
    server.listen(() => {
      console.log(`Server is listening on port: ${dotenvconfig.PORT}`);
    });
  })
  .catch((e: mongoose.MongooseError) => {
    console.log(`Mongoose connection error: ${e.message}`);
  });
