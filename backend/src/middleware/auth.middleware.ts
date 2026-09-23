import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { verifyToken } from '../utils/jwt';
import { sendError } from '../utils/response';

export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(res, 'Authentication required. Please log in.', 401);
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return sendError(res, 'Invalid authentication token.', 401);
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    return next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      return sendError(res, 'Your session has expired. Please log in again.', 401);
    }
    return sendError(res, 'Invalid or expired session. Please log in again.', 401);
  }
}
