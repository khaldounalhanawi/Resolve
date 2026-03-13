/**
 * User Service
 * 
 * Business logic for managing users.
 */

import { User } from '../models';
import { userRepository } from '../repositories';

/**
 * Get the current user
 */
export async function getCurrentUser(): Promise<User | null> {
  return userRepository.getCurrentUser();
}

/**
 * Create a new user
 */
export async function createUser(name: string): Promise<User> {
  return userRepository.createUser(name);
}

/**
 * Update user information
 */
export async function updateUser(userId: string, data: Partial<User>): Promise<User> {
  return userRepository.updateUser(userId, data);
}
