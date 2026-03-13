/**
 * Authentication Context and Provider
 * Manages user authentication state with Convex
 * Uses in-memory storage (no native dependencies)
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';

interface AuthContextType {
  userId: Id<"users"> | null;
  isLoading: boolean;
  signIn: (email: string, name: string, googleId?: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Simple in-memory storage (works everywhere)
// Note: User will need to login again after app restart
// TODO: Add persistent storage with proper AsyncStorage setup
let memoryUserId: string | null = null;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<Id<"users"> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const getOrCreateUser = useMutation(api.users.getOrCreateUser);

  // Load saved user ID on mount (from memory)
  useEffect(() => {
    if (memoryUserId) {
      setUserId(memoryUserId as Id<"users">);
    }
  }, []);

  const signIn = async (email: string, name: string, googleId?: string) => {
    setIsLoading(true);
    try {
      const user = await getOrCreateUser({ email, name, googleId });
      if (user) {
        memoryUserId = user._id;
        setUserId(user._id);
      }
    } catch (error) {
      console.error('Sign in error:', error);
      throw new Error('Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    memoryUserId = null;
    setUserId(null);
  };

  return (
    <AuthContext.Provider value={{ userId, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
