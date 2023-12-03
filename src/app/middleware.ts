import express from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import cors from "cors";
import fileUpload from "express-fileupload";
import helmet from "helmet";
import dotenvconfig from "../config/dotenvconfig";
import { appLimiter } from "../utils/limiter";

const config_middleware = [
  appLimiter,
  express.json(),
  express.urlencoded({ extended: true }),
  cookieParser(),
  fileUpload(),
  helmet(),
  cors({
    origin: [dotenvconfig.SITE_URL],
    credentials: true,
    optionsSuccessStatus: 200,
  }),
  morgan("dev"),
];

if (dotenvconfig.NODE_ENV !== "development") {
  config_middleware.pop();
}

const middleware = config_middleware;

export default middleware;
