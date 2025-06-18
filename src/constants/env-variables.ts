/**
 * Environments variables declared here.
 */
/* eslint-disable node/no-process-env */

// ----------------------------------------

export default {
  NodeEnv: process.env.NODE_ENV ?? "",
  Port: process.env.PORT ?? 0,
  Stripe: {
    PublshableKey: process.env.STRIPE_PUBLISHABLE_KEY ?? "",
    SecretKey: process.env.STRIPE_SECRET_KEY ?? "",
    WebhookLocalSecret: process.env.STRIPE_WEBHOOK_LOCAL_SECRET ?? "",
    WebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? "",
  },
  Cloudinary: {
    // Folder:
    //   (process.env.NODE_ENV === NodeEnvs.Production
    //     ? process.env.CLOUDINARY_PROD_FOLDER
    //     : process.env.CLOUDINARY_DEV_FOLDER) ?? "",
    Folder: process.env.CLOUDINARY_FOLDER_NAME ?? "",
    CloudName: process.env.CLOUDINARY_CLOUD_NAME ?? "",
    ApiKey: process.env.CLOUDINARY_API_KEY ?? "",
    ApiSecret: process.env.CLOUDINARY_API_SECRET ?? "",
  },
  CookieProps: {
    default: {
      Key: "checkuphoopscookie",
      Secret: process.env.COOKIE_SECRET ?? "",
      // Casing to match express cookie options
      Options: {
        httpOnly: true,
        sameSite: "none",
        signed: true,
        maxAge: Number(process.env.COOKIE_EXP ?? 0),
        secure: process.env.SECURE_COOKIE === "true",
      },
    },
    roleToken: {
      Key: "roleToken",
      Secret: process.env.ROLE_COOKIE_SECRET ?? "",
      Options: {
        httpOnly: true,
        sameSite: "none",
        // signed: true,
        maxAge: Number(process.env.ROLE_COOKIE_EXP ?? 0),
        secure: process.env.SECURE_COOKIE === "true",
      },
    },
    refreshToken: {
      Key: "refreshToken",
      Secret: process.env.REFRESH_COOKIE_SECRET ?? "",
      Options: {
        httpOnly: true,
        sameSite: "none",
        // signed: true,
        maxAge: Number(process.env.REFRESH_COOKIE_EXP ?? 0),
        secure: process.env.SECURE_COOKIE === "true",
      },
    },
  },
  Jwt: {
    default: {
      Secret: process.env.JWT_SECRET ?? "",
      Exp: process.env.COOKIE_EXP ?? "", // exp at the same time as the cookie
    },
    roleToken: {
      Exp: process.env.ROLE_JWT_EXP ?? "", // exp at the same time as the cookie
    },
    refreshToken: {
      Exp: process.env.REFRESH_JWT_EXP ?? "", // exp at the same time as the cookie
    },
  },
  Database: {
    Uri: process.env.MONGODB_URI ?? "",
  },
  FrontendDomain: process.env.FRONTEND_DOMAIN ?? "",
  // FrontendDomain:
  //   (process.env.NODE_ENV === NodeEnvs.Production
  //     ? process.env.DOMAIN_PROD
  //     : process.env.DOMAIN_DEV) ?? "",
  FrontendEmailVerifyUrl: "auth/verify-email",
  FrontendResetPasswordUrl: "auth/reset-password",
  Email: {
    Host: process.env.SMTP_HOST ?? "",
    Port: process.env.SMTP_PORT ?? "",
    Username: process.env.SMTP_USERNAME ?? "",
    Password: process.env.SMTP_PASSWORD ?? "",
    Sender: process.env.SMTP_SENDER ?? "",
    SmtpTls: process.env.SMTP_TLS === "yes" ? true : false,
  },
  Auth0 : {
    Auth0_Domain : process.env.AUTH0_DOMAIN ?? "",
    Audience: process.env.AUTH0_AUDIENCE ?? "",
    Auth0_ClientId: process.env.AUTH0_CLIENT_ID ?? "",
    Auth0_ClientSecret: process.env.AUTH0_CLIENT_SECRET ?? "",
  }
} as const;
