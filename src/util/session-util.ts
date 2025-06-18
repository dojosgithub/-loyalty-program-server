import { Request, Response } from "express";
import _ from "lodash";
import jsonwebtoken, { JwtPayload } from "jsonwebtoken";

import envVariables from "../constants/env-variables";
import { IRefreshToken, RefreshToken } from "../models";
import { RouteError } from "../other/classes";
import HttpStatusCodes from "../constants/https-status-codes";

// ----------------------------------------

// **** Variables **** //

interface IJWTTokenDecoded {
  id: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}
interface IGenerateTokensResponse {
  accessToken: string;
  refreshToken: string;
}

// Errors
const Errors = {
  ParamFalsey: "Param is falsey",
  Validation: "JSON-web-token validation failed.",
} as const;

// Options
const Options = {
  expiresIn: envVariables.Jwt.default.Exp,
};

// **** Functions **** //

/**
 * Create new access jwt token
 */
async function regenerateAccessToken(payload: any): Promise<string> {
  const accessToken = await _sign(payload, {
    expiresIn: "60m",
  });
  return accessToken;
}

/**
 * Create user jwt tokens
 */
async function generateJWTtokens(
  payload: any,
  ip: number | string
): Promise<IGenerateTokensResponse> {
  // const jwtPayload = { id: user.id, role: user.role };

  const accessToken = await _sign(payload, {
    expiresIn: "60m",
  });

  const refreshToken = await createRefreshToken(payload, ip);

  const tokens = {
    accessToken,
    refreshToken: refreshToken.token,
  };

  return tokens;
}

async function createRefreshToken(
  payload: any,
  ip: string | number
): Promise<IRefreshToken> {
  // const expiresInDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const expiresInDate = new Date(
    Date.now() + Number(envVariables.Jwt.refreshToken.Exp)
  );

  const refreshToken = await _sign(payload, {
    expiresIn: "7d",
  });

  const _newRefreshToken = new RefreshToken({
    user: payload._id,
    token: refreshToken,
    expires: expiresInDate,
    createdByIp: ip,
  });
  await _newRefreshToken.save();

  return _newRefreshToken;
}

/**
 * Get session data from request object (i.e. ISessionUser)
 */
function getSessionData<T>(req: Request): Promise<string | T | undefined> {
  const { Key } = envVariables.CookieProps.default,
    jwt = req.signedCookies[Key];
  return _decode(jwt);
}

/**
 * Create role token & cookie
 */
// async function addRoleTokenCookie(
//   res: Response,
//   payload: object
// ): Promise<Response> {
//   if (!res || !payload)
//     throw new RouteError(HttpStatusCodes.BAD_REQUEST, Errors.ParamFalsey);

//   const { Key, Options } = envVariables.CookieProps.roleToken;
//   const jwtOptions = { expiresIn: "7d" };

//   // Setup JWT
//   const jwt = await _sign(payload, Key, jwtOptions);

//   return res.cookie(Key, jwt, Options);
// }
/**
 * Create refresh token cookie
 */
async function addRefreshTokenCookie(
  res: Response,
  jwt: string
): Promise<Response> {
  if (!res || !jwt)
    throw new RouteError(HttpStatusCodes.BAD_REQUEST, Errors.ParamFalsey);

  const { Key, Options } = envVariables.CookieProps.refreshToken;

  return res.cookie(Key, jwt, Options);
}

/**
 * Verify refresh token cookie
 */
async function verifyRefreshTokenCookie(
  refreshToken: string
): Promise<boolean | IJWTTokenDecoded> {
  if (!refreshToken)
    throw new RouteError(HttpStatusCodes.BAD_REQUEST, Errors.ParamFalsey);

  console.log("verifyRefreshTokenCookie refreshToken", refreshToken);
  return new Promise((resolve, reject) =>
    jsonwebtoken.verify(
      refreshToken,
      envVariables.Jwt.default.Secret,
      (err, decoded) => {
        return err ? resolve(false) : resolve(decoded as IJWTTokenDecoded);
      }
    )
  );
}

/**
 * Add a JWT to the response
 */
async function addSessionData(
  res: Response,
  payload: string | object,
  cookieOptions?: any,
  jwtOptions?: object,
  generateJWT: boolean = true
): Promise<Response> {
  // if (!res || !payload)
  //   throw new RouteError(HttpStatusCodes.BAD_REQUEST, Errors.ParamFalsey);

  // // Setup JWT
  // let jwt;
  // if (generateJWT) jwt = await _sign(payload, jwtOptions);
  // else jwt = payload;

  // const { Key, Options } = cookieOptions;

  // return res.cookie(Key, jwt, Options);
  return res;
}

/**
 * Remove cookie
 */
function clearCookie(res: Response): Response {
  const refreshCookie = envVariables.CookieProps.refreshToken;
  res.clearCookie(refreshCookie.Key, refreshCookie.Options);

  const roleCookie = envVariables.CookieProps.roleToken;
  res.clearCookie(roleCookie.Key, roleCookie.Options);

  const defaultCookie = envVariables.CookieProps.default;
  res.clearCookie(defaultCookie.Key, defaultCookie.Options);

  return res;
  // const { Key, Options } = envVariables.CookieProps.default;
  // res.setHeader('set-cookie', `${Key}=; max-age=0`)
  // return res.clearCookie(Key, Options);
}

// **** Helper Functions **** //

/**
 * Encrypt data and return jwt.
 */
function _sign(data: string | object | Buffer, options?: any): Promise<string> {
  const jwtSecret = envVariables.Jwt.default.Secret;

  let jwtOptions = options;

  if (_.isEmpty(options)) jwtOptions = Options;

  console.log("_sign", jwtOptions);

  return new Promise((resolve, reject) => {
    jsonwebtoken.sign(data, jwtSecret, jwtOptions, (err, token) => {
      return err ? reject(err) : resolve(token || "");
    });
  });
}

/**
 * Decrypt JWT and extract client data.
 */
function _decode<T>(jwt: string): Promise<string | undefined | T> {
  return new Promise((res, rej) => {
    jsonwebtoken.verify(jwt, envVariables.Jwt.default.Secret, (err, decoded) => {
      return err ? rej(Errors.Validation) : res(decoded as T);
    });
  });
}

// **** Export default **** //

export default {
  addSessionData,
  getSessionData,
  // addRoleTokenCookie,
  addRefreshTokenCookie,
  clearCookie,
  generateJWTtokens,
  regenerateAccessToken,
  verifyRefreshTokenCookie,
} as const;
