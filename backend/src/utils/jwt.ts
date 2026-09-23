import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { JwtUserPayload } from '../types';

export function generateToken(payload: JwtUserPayload): string {
  return jwt.sign(payload, env.JWT.SECRET, {
    expiresIn: env.JWT.EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
}

export function verifyToken(token: string): JwtUserPayload {
  return jwt.verify(token, env.JWT.SECRET) as JwtUserPayload;
}
