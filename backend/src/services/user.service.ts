import { UserModel } from '../models/user.model';
import { UserSafe } from '../types';

export class UserService {
  static async getProfile(userId: string): Promise<UserSafe | null> {
    return UserModel.findById(userId);
  }

  static async updateProfile(
    userId: string,
    updates: { name?: string; avatar?: string | null }
  ): Promise<UserSafe | null> {
    return UserModel.updateProfile(userId, updates);
  }
}
