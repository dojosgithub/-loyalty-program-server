import jwt, { JwtPayload } from 'jsonwebtoken';

export function tick(milliseconds: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, milliseconds);
    });
  }

  export const getLoginLinkByEnv = () => {
    return process.env.CLOUD === 'DEV_CLOUD' ? process.env.DOMAIN_FRONT_DEV : process.env.DOMAIN_PROD
  }


  export const PROMOTION_STATUS = {
    DRAFT : "Draft",
    SENT: "Sent",
    SCHEDULED : "Scheduled",
    FAILED: "Failed",
  }

  export const parseDate = (dateStr: string): Date | null => {
  const parts = dateStr.split("-");
  if (parts.length !== 3) return null;

  const [dd, mm, yyyy] = parts;
  const isoString = `${yyyy}-${mm}-${dd}T00:00:00.000Z`;

  const date = new Date(isoString);
  return isNaN(date.getTime()) ? null : date;
};

interface OTPPayload {
  secret?: string;
}
export const generateOTToken = (payload: OTPPayload): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const token = jwt.sign(payload, process.env.JWT_SECRET as string, {
        expiresIn: '5m',
      });
      resolve(token);
    } catch (err) {
      reject(err);
    }
  });
};

export const verifyTOTPToken = (
  token: string
): Promise<JwtPayload> => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET as string, (err, decoded) => {
      if (err) {
        reject(err);
      } else if (typeof decoded === 'object' && decoded !== null) {
        resolve(decoded as JwtPayload);
      } else {
        reject(new Error('Invalid token payload'));
      }
    });
  });
};

 export const ACTIVITY_TYPE = {
    REDEEM : "Pt Redeemed",
    EARNED: "Pt Earned",
    REVISIT : "Revisit",
    SIGNUP: "New Signup",
  }