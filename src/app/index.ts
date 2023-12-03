import express from "express";
import { IError } from "../types/error_type";
import * as responses from "../utils/response";
import middleware from "./middleware";
import routes from "../routes";

const app: express.Application = express();

const globalErrorHandler: express.ErrorRequestHandler = (
  err: IError,
  req,
  res,
  next
) => {
  const message: string = err.message || "Something went wrong!";
  const status: number = err.status || 500;
  return responses.responseErrorMessage(res, status, {
    error: message,
  });
};

app.use(middleware);
app.use(routes);
app.use(globalErrorHandler);

export default app;
