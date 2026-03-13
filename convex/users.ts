import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * User Queries and Mutations
 */

// Get or create user by Google ID
export const getOrCreateUser = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    avatarUrl: v.optional(v.string()),
    googleId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Try to find existing user by email
    let user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!user) {
      // Create new user
      const userId = await ctx.db.insert("users", {
        email: args.email,
        name: args.name,
        avatarUrl: args.avatarUrl,
        googleId: args.googleId,
        createdAt: Date.now(),
      });
      user = await ctx.db.get(userId);
    } else if (args.googleId && !user.googleId) {
      // Update existing user with Google ID
      await ctx.db.patch(user._id, { googleId: args.googleId });
      user = await ctx.db.get(user._id);
    }

    return user;
  },
});

// Get user by ID
export const getUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

// Update user profile
export const updateUser = mutation({
  args: {
    userId: v.id("users"),
    name: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId, ...updates } = args;
    await ctx.db.patch(userId, updates);
    return await ctx.db.get(userId);
  },
});
