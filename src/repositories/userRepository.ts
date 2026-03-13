/**
 * In-Memory User Repository
 * 
 * Implementation of IUserRepository using in-memory storage.
 * This is used for testing and development before connecting to Convex.
 */

import { User } from '../models';
import { IUserRepository } from './interfaces';
import { generateId } from '../utils';

class InMemoryUserRepository implements IUserRepository {
  private users: Map<string, User> = new Map();
  private currentUserId: string | null = null;

  async getCurrentUser(): Promise<User | null> {
    if (!this.currentUserId) {
      // Auto-create a default user for testing
      const user = await this.createUser('Test User');
      this.currentUserId = user.id;
      return user;
    }
    return this.users.get(this.currentUserId) || null;
  }

  async createUser(name: string): Promise<User> {
    const user: User = {
      id: generateId(),
      name,
      createdAt: Date.now(),
    };
    this.users.set(user.id, user);
    this.currentUserId = user.id;
    return user;
  }

  async updateUser(userId: string, data: Partial<User>): Promise<User> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }
    const updated = { ...user, ...data };
    this.users.set(userId, updated);
    return updated;
  }
}

export default new InMemoryUserRepository();
