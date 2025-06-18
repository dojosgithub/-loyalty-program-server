import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import jwksRsa from "jwks-rsa";
import _ from "lodash";
import HttpStatusCodes from "../constants/https-status-codes";
import EnvVars from "../constants/env-variables";

const USER_UNAUTHORIZED_ERR = "User not authorized to perform this action";

// JWKS client to fetch Auth0 public key
const jwksClient = jwksRsa({
  jwksUri: `https://${EnvVars.Auth0.Auth0_Domain}/.well-known/jwks.json`,
  cache: true,
  rateLimit: true,
  jwksRequestsPerMinute: 5,
});

function getKey(header: jwt.JwtHeader, callback: jwt.SigningKeyCallback) {
  jwksClient.getSigningKey(header.kid!, (err, key) => {
    const signingKey = key?.getPublicKey();
    callback(err, signingKey);
  });
}

export interface ISessionReq extends Request {
  _session?: any;
}

export const AuthenticateMW = (
  req: ISessionReq,
  res: Response,
  next: NextFunction
) => {
  let token = req.headers["authorization"] ?? "";

  if (_.isEmpty(token)) {
    return res
      .status(HttpStatusCodes.UNAUTHORIZED)
      .json({ error: USER_UNAUTHORIZED_ERR });
  }

  if (token.startsWith("Bearer ")) {
    token = token.slice(7, token.length).trimLeft();
  }

  jwt.verify(
    token,
    getKey,
    {
      audience: EnvVars.Auth0.Audience,
      issuer: `https://${EnvVars.Auth0.Auth0_Domain}/`,
      algorithms: ["RS256"],
    },
    (err, decoded) => {
      if (err) {
        return res
          .status(HttpStatusCodes.UNAUTHORIZED)
          .json({ error: err.message });
      }

      req._session = decoded;
      next();
    }
  );
};
