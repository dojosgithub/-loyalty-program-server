// * Libraries
import nodemailer, { Transporter, SendMailOptions } from 'nodemailer';
import ejs from 'ejs';
import { htmlToText } from 'html-to-text';
import path from 'path';
import { getLoginLinkByEnv } from './misc';

// Types
interface User {
  email: string;
}

interface EmailProps {
  toMultiple?: string | string[];
  serverError?: boolean;
  error?: string;
  loginLink?: string;
  attachments?: {
    filename: string;
    path: string;
  }[];
  [key: string]: any;
}

export default class Email {
  private to: string;
  private from: string;

  constructor(user: User) {
    this.to = user?.email;
    this.from = `${process.env.CLIENT_NAME} <${process.env.EMAIL_FROM}>`;
  }

  private newTransport(): Transporter {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_FROM,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  private async configureMailOptions({
    template,
    subject,
    emailProps,
  }: {
    template: string;
    subject: string;
    emailProps: EmailProps;
  }): Promise<SendMailOptions> {
    const to = emailProps.toMultiple ?? this.to;

    // For server error emails
    if (emailProps.serverError && emailProps.error) {
      return {
        from: this.from,
        to,
        subject,
        html: emailProps.error,
        text: htmlToText(emailProps.error),
      };
    }

    const loginLink = getLoginLinkByEnv();
    emailProps.loginLink = loginLink;

    console.log('EMAIL PROPS', emailProps);

    const renderedHtml = await ejs.renderFile(
      path.join(__dirname, `../../templates/${template}.ejs`),
      { emailProps, subject }
    );

    const mailOptions: SendMailOptions = {
      from: this.from,
      to,
      subject,
      html: renderedHtml,
      text: htmlToText(renderedHtml),
    };

    if (emailProps.attachments) {
      mailOptions.attachments = emailProps.attachments;
    }

    return mailOptions;
  }

  public async send(
    template: string,
    subject: string,
    emailProps: EmailProps
  ): Promise<void> {
    try {
      const mailOptions = await this.configureMailOptions({ template, subject, emailProps });

      try {
        await this.newTransport().sendMail(mailOptions);
        console.log(`📧 Email sent successfully to: ${mailOptions.to} subject: ${subject}`);
      } catch (e) {
        console.error(`❎ Failed to send mail: ${e}`);
      }
    } catch (err) {
      console.error(`❎ Something went wrong in ejs render: ${err}`);
    }
  }

  public async sendForgotPassword(arg: EmailProps): Promise<void> {
    // 1st temp name 2nd subject of email and 3rd arg is the email props
    await this.send('forgot-password', 'Change password', arg);
  }
}
