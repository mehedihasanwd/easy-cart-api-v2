import * as email_type from "../types/email_type";
import dotenvconfig from "../config/dotenvconfig";

export const registerStaffEmailTemplate = ({
  emailTo,
  receiverName,
  access_token,
}: email_type.IEmailTemplateParams): email_type.IEmailBody => {
  return {
    from: dotenvconfig.EMAIL_USER_NAME,
    to: emailTo,
    subject: "Register Your Account",
    html: `<h2>Hello, ${receiverName}</h2>
      <p>
        Please click the following "Register Account" button to verify your email and complete account registration.
      </p>

      <a href=${dotenvconfig.SITE_URL}/verify-email?token=${access_token} style="background: #000000; color: #fff; text-decoration: none; padding: 10px 15px; border-radius: 4px">
        Register Account
      </a>

      <p styl="margin: 10px 0px 0px 0px">
        This link will expire in <strong>15 minutes<strong>.
      </p>

       <p style="margin-top: 25px 0px 0px 0px">
        If you did not initiate this request, please contact us immediately at ${dotenvconfig.EMAIL_USER}
      </p>

      <p style="margin: 5px 0px;">
        Note: Your request becoming an staff depends on our CEO. If the CEO accepts then you'll get an staff role and can able to perform your role. Otherwise, your account will be deleted if CEO don't want you to become an staff.
      </p>

      <p style="margin: 15px 0px 5px 0px;">
        Thank You
      </p>

      <strong>
        EasyCart Team
      </strong>
      
      `,
  };
};

export const registerUserEmailTemplate = ({
  emailTo,
  receiverName,
  access_token,
}: email_type.IEmailTemplateParams): email_type.IEmailBody => {
  return {
    from: dotenvconfig.EMAIL_USER_NAME,
    to: emailTo,
    subject: "Register Your Account",
    html: `<h2>Hello, ${receiverName}</h2>
      <p>
        Please click the following "Register Account" button to verify your email and complete account registration.
      </p>

      <a href=${dotenvconfig.SITE_URL}/verify-email?token=${access_token} style="background: #000000; color: #fff; text-decoration: none; padding: 10px 15px; border-radius: 4px">
        Register Account
      </a>

      <p styl="margin: 10px 0px 0px 0px">
        This link will expire in <strong>15 minutes<strong>.
      </p>

       <p style="margin-top: 25px 0px 0px 0px">
        If you did not initiate this request, please contact us immediately at ${dotenvconfig.EMAIL_USER}
      </p>

      <p style="margin: 15px 0px 5px 0px;">
        Thank You
      </p>

      <strong>
        EasyCart Team
      </strong>
      
      `,
  };
};

export const resetAccountPassworEmailTemplate = ({
  emailTo,
  receiverName,
  access_token,
}: email_type.IEmailTemplateParams): email_type.IEmailBody => {
  return {
    from: dotenvconfig.EMAIL_USER_NAME,
    to: emailTo,
    subject: "Reset Your Password",
    html: `<h2>Hello ${receiverName}</h2>
      <p>
        Please click the following "Reset Password" button to reset your password.
      </p>

      <a href=${dotenvconfig.SITE_URL}/reset-password?token=${access_token} style="background:#000000; color: #fff; text-decoration: none; padding: 10px 15px; border-radius: 4px">
        Reset Password
      </a>

      <p>
        This link will expire in <strong>15 minutes</strong>.
      </p>

      <p style="margin-top: 35px;">
        If you did not initiate this request, please contact us immediately at ${dotenvconfig.EMAIL_USER}
      </p>

      <p>
        Thank You
      </p>

      <strong>
        Easy Cart Team
      </strong>
        `,
  };
};

export const emailToSuperAdminTemplate = ({
  guest_name,
  guest_email,
}: email_type.IEmailToSuperAdmin): email_type.IEmailBody => {
  return {
    from: dotenvconfig.EMAIL_USER_NAME,
    to: dotenvconfig.SUPER_ADMIN,
    subject: "Review Account",
    html: `<p>
        Someone with name ${guest_name} and email ${guest_email} wants to become an staff. Please review this account and take appropriate action.
      </p>
      `,
  };
};
