import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Convex Schema for Resolve App
 * Defines the database structure for users, metrics, and entries
 */

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    avatarUrl: v.optional(v.string()),
    googleId: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_email", ["email"])
    .index("by_googleId", ["googleId"]),

  metrics: defineTable({
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
    order: v.optional(v.number()),
    createdAt: v.number(),
  }).index("by_user", ["userId"])
    .index("by_user_order", ["userId", "order"]),

  entries: defineTable({
    userId: v.id("users"),
    metricId: v.id("metrics"),
    date: v.string(), // ISO date string (YYYY-MM-DD)
    value: v.number(),
    note: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"])
    .index("by_metric", ["metricId"])
    .index("by_user_date", ["userId", "date"])
    .index("by_metric_date", ["metricId", "date"]),
});
