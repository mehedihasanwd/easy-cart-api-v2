export interface IEmailBody {
  from: string;
  to: string;
  subject: string;
  html: string;
}

export interface IEmailTemplateParams {
  emailTo: string;
  receiverName: string;
  access_token: string;
}

export interface IEmailToSuperAdmin {
  guest_name: string;
  guest_email: string;
}
