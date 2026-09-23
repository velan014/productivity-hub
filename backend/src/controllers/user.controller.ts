import { Response } from 'express';
import { z } from 'zod';
import { UserService } from '../services/user.service';
import { AuthenticatedRequest } from '../types';
import { sendSuccess, sendError } from '../utils/response';

export const updateProfileSchema = z.object({
  name: z.string().min(1, 'Name cannot be empty').max(100).optional(),
  avatar: z.string().url('Avatar must be a valid URL').nullable().optional(),
});

export class UserController {
  static async getProfile(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const user = await UserService.getProfile(userId);
      if (!user) {
        return sendError(res, 'User not found', 404);
      }
      return sendSuccess(res, { user }, 'Profile retrieved successfully');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to retrieve profile', 500);
    }
  }

  static async updateProfile(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { name, avatar } = req.body;

      const user = await UserService.updateProfile(userId, { name, avatar });
      if (!user) {
        return sendError(res, 'User not found', 404);
      }

      return sendSuccess(res, { user }, 'Profile updated successfully');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to update profile', 500);
    }
  }
}
