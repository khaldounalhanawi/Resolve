/**
 * Convex Client Configuration
 * Provides Convex React client initialization
 */

import { ConvexReactClient } from "convex/react";

// Initialize Convex client
// The deployment URL is set in .env.local
export const convex = new ConvexReactClient(
  process.env.EXPO_PUBLIC_CONVEX_URL || ""
);
