import express from "express";
import nodemailer from "nodemailer";
import dotenvconfig from "../config/dotenvconfig";
import { SentMessageInfo } from "nodemailer/lib/smtp-transport";
import { IEmailBody } from "../types/email_type";
import * as responses from "../utils/response";

export const sendMail = (
  res: express.Response,
  body: IEmailBody,
  message: string
) => {
  const transporter: nodemailer.Transporter<SentMessageInfo> =
    nodemailer.createTransport({
      host: dotenvconfig.EMAIL_HOST,
      port: dotenvconfig.EMAIL_PORT,
      service: dotenvconfig.EMAIL_SERVICE,
      secure: false,
      auth: {
        user: dotenvconfig.EMAIL_USER,
        pass: dotenvconfig.EMAIL_PASS,
      },
    });

  transporter.verify((err: Error | null) => {
    if (err) {
      return responses.responseErrorMessage(res, 403, {
        error: `Something went wrong while verifying email: ${err.message}`,
      });
    }
  });

  transporter.sendMail(body, (err: Error | null) => {
    if (err) {
      return responses.responseErrorMessage(res, 403, {
        error: `Something went wrong while sending email: ${err.message}`,
      });
    } else {
      return responses.responseSuccessMessage(res, 200, { message });
    }
  });
};

export const sendMailToSuperAdmin = (body: IEmailBody): void => {
  const transporter: nodemailer.Transporter<SentMessageInfo> =
    nodemailer.createTransport({
      host: dotenvconfig.EMAIL_HOST,
      port: dotenvconfig.EMAIL_PORT,
      service: dotenvconfig.EMAIL_SERVICE,
      secure: false,
      auth: {
        user: dotenvconfig.EMAIL_USER,
        pass: dotenvconfig.EMAIL_PASS,
      },
    });

  transporter.verify((err: Error | null) => {
    if (err) {
      console.log(
        "error from sendMailToSuperAdmin: ",
        `Something went wrong while verifying email: ${err.message}`
      );
    }
  });

  transporter.sendMail(body, (err: Error | null) => {
    if (err) {
      console.log(
        "error from sendMailToSuperAdmin: ",
        `Something went wrong while sending email: ${err.message}`
      );
    } else {
      console.log(`Email has been sent to super admin`);
    }
  });
};
