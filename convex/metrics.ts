import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Metrics Queries and Mutations
 */

// Get all metrics for a user
export const getUserMetrics = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("metrics")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("asc")
      .collect();
  },
});

// Get a single metric
export const getMetric = query({
  args: { metricId: v.id("metrics") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.metricId);
  },
});

// Create a new metric
export const createMetric = mutation({
  args: {
    userId: v.id("users"),
    name: v.string(),
    type: v.union(
      v.literal("number"),
      v.literal("duration"),
      v.literal("scale"),
      v.literal("boolean")
    ),
    unit: v.optional(v.string()),
    minValue: v.number(),
    maxValue: v.number(),
    targetValue: v.optional(v.number()),
    direction: v.optional(v.union(
      v.literal("ascending"),
      v.literal("descending")
    )),
    aggregationType: v.union(
      v.literal("singleValue"),
      v.literal("accumulate")
    ),
    color: v.string(),
  },
  handler: async (ctx, args) => {
    // Get the current max order for this user
    const metrics = await ctx.db
      .query("metrics")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    
    const maxOrder = metrics.reduce((max, m) => Math.max(max, m.order || 0), 0);

    const metricId = await ctx.db.insert("metrics", {
      ...args,
      order: maxOrder + 1,
      createdAt: Date.now(),
    });

    return metricId;
  },
});

// Update a metric
export const updateMetric = mutation({
  args: {
    metricId: v.id("metrics"),
    name: v.optional(v.string()),
    type: v.optional(
      v.union(
        v.literal("number"),
        v.literal("duration"),
        v.literal("scale"),
        v.literal("boolean")
      )
    ),
    unit: v.optional(v.string()),
    minValue: v.optional(v.number()),
    maxValue: v.optional(v.number()),
    targetValue: v.optional(v.number()),
    direction: v.optional(v.union(
      v.literal("ascending"),
      v.literal("descending")
    )),
    aggregationType: v.optional(
      v.union(
        v.literal("singleValue"),
        v.literal("accumulate")
      )
    ),
    color: v.optional(v.string()),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { metricId, ...updates } = args;
    await ctx.db.patch(metricId, updates);
    return await ctx.db.get(metricId);
  },
});

// Delete a metric and all its entries
export const deleteMetric = mutation({
  args: { metricId: v.id("metrics") },
  handler: async (ctx, args) => {
    // Delete all entries for this metric
    const entries = await ctx.db
      .query("entries")
      .withIndex("by_metric", (q) => q.eq("metricId", args.metricId))
      .collect();

    for (const entry of entries) {
      await ctx.db.delete(entry._id);
    }

    // Delete the metric
    await ctx.db.delete(args.metricId);
  },
});

// Reorder metrics
export const reorderMetrics = mutation({
  args: {
    metricOrders: v.array(
      v.object({
        metricId: v.id("metrics"),
        order: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    for (const { metricId, order } of args.metricOrders) {
      await ctx.db.patch(metricId, { order });
    }
  },
});
