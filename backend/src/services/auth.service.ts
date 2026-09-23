import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { UserModel } from '../models/user.model';
import { generateToken } from '../utils/jwt';
import { UserSafe } from '../types';

export class AuthService {
  static async register(name: string, email: string, password: string):Promise<{ user: UserSafe; token: string }> {
    const existing = await UserModel.findByEmail(email);
    if (existing) {
      throw new Error('An account with this email already exists.');
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    const id = uuidv4();

    const user = await UserModel.create({
      id,
      name,
      email,
      password_hash,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
    });

    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
    });

    return { user, token };
  }

  static async login(email: string, password: string): Promise<{ user: UserSafe; token: string }> {
    const userWithPassword = await UserModel.findByEmail(email);
    if (!userWithPassword) {
      throw new Error('Invalid email or password.');
    }

    const isMatch = await bcrypt.compare(password, userWithPassword.password_hash);
    if (!isMatch) {
      throw new Error('Invalid email or password.');
    }

    const user: UserSafe = {
      id: userWithPassword.id,
      name: userWithPassword.name,
      email: userWithPassword.email,
      avatar: userWithPassword.avatar,
      created_at: userWithPassword.created_at,
      updated_at: userWithPassword.updated_at,
    };

    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
    });

    return { user, token };
  }

  static async getCurrentUser(userId: string): Promise<UserSafe | null> {
    return UserModel.findById(userId);
  }
}
