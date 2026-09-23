import { Request, Response } from 'express';
import { z } from 'zod';
import { AuthService } from '../services/auth.service';
import { sendSuccess, sendError } from '../utils/response';
import { AuthenticatedRequest } from '../types';

export const registerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be at most 100 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  confirmPassword: z.string().min(8, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const { name, email, password } = req.body;
      const result = await AuthService.register(name, email, password);
      return sendSuccess(res, result, 'Registration successful', 201);
    } catch (error: any) {
      if (error.message.includes('already exists')) {
        return sendError(res, error.message, 409);
      }
      return sendError(res, error.message || 'Registration failed', 500);
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password);
      return sendSuccess(res, result, 'Login successful', 200);
    } catch (error: any) {
      if (error.message.includes('Invalid email or password')) {
        return sendError(res, error.message, 401);
      }
      return sendError(res, error.message || 'Login failed', 500);
    }
  }

  static async getMe(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, 'Unauthorized', 401);
      }
      const user = await AuthService.getCurrentUser(req.user.id);
      if (!user) {
        return sendError(res, 'User not found', 404);
      }
      return sendSuccess(res, { user }, 'User retrieved successfully', 200);
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to retrieve user', 500);
    }
  }
}
