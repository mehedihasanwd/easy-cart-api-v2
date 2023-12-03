import rateLimit, { RateLimitRequestHandler } from "express-rate-limit";
import express from "express";
import * as responses from "./response";

const minutes: number = 30;

const configLimit = (max: number = 15): RateLimitRequestHandler => {
  return rateLimit({
    windowMs: minutes * 60 * 1000,
    max,
    handler: (
      req: express.Request,
      res: express.Response
    ): express.Response => {
      return responses.responseErrorMessage(res, 409, {
        error: `You made too many requests! please try again after ${minutes} minutes`,
      });
    },
  });
};

export const appLimiter: RateLimitRequestHandler = configLimit(100);

export const verifyEmailLimiter: RateLimitRequestHandler = configLimit();

export const forgotPasswordLimiter: RateLimitRequestHandler = configLimit();
