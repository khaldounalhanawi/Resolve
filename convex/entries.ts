import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Entries Queries and Mutations
 */

// Get all entries for a user
export const getUserEntries = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("entries")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

// Get entries for a specific metric
export const getMetricEntries = query({
  args: { metricId: v.id("metrics") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("entries")
      .withIndex("by_metric", (q) => q.eq("metricId", args.metricId))
      .collect();
  },
});

// Get entries for a user on a specific date
export const getUserEntriesByDate = query({
  args: {
    userId: v.id("users"),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("entries")
      .withIndex("by_user_date", (q) =>
        q.eq("userId", args.userId).eq("date", args.date)
      )
      .collect();
  },
});

// Get entry for a specific metric and date
export const getEntry = query({
  args: {
    metricId: v.id("metrics"),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("entries")
      .withIndex("by_metric_date", (q) =>
        q.eq("metricId", args.metricId).eq("date", args.date)
      )
      .first();
  },
});

// Create or update an entry
export const upsertEntry = mutation({
  args: {
    userId: v.id("users"),
    metricId: v.id("metrics"),
    date: v.string(),
    value: v.number(),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if entry already exists
    const existingEntry = await ctx.db
      .query("entries")
      .withIndex("by_metric_date", (q) =>
        q.eq("metricId", args.metricId).eq("date", args.date)
      )
      .first();

    const now = Date.now();

    if (existingEntry) {
      // Update existing entry
      await ctx.db.patch(existingEntry._id, {
        value: args.value,
        note: args.note,
        updatedAt: now,
      });
      return existingEntry._id;
    } else {
      // Create new entry
      const entryId = await ctx.db.insert("entries", {
        userId: args.userId,
        metricId: args.metricId,
        date: args.date,
        value: args.value,
        note: args.note,
        createdAt: now,
        updatedAt: now,
      });
      return entryId;
    }
  },
});

// Accumulate value to existing entry (for accumulate type metrics)
export const accumulateEntry = mutation({
  args: {
    userId: v.id("users"),
    metricId: v.id("metrics"),
    date: v.string(),
    value: v.number(),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if entry already exists
    const existingEntry = await ctx.db
      .query("entries")
      .withIndex("by_metric_date", (q) =>
        q.eq("metricId", args.metricId).eq("date", args.date)
      )
      .first();

    const now = Date.now();

    if (existingEntry) {
      // Add to existing value
      await ctx.db.patch(existingEntry._id, {
        value: existingEntry.value + args.value,
        note: args.note || existingEntry.note,
        updatedAt: now,
      });
      return existingEntry._id;
    } else {
      // Create new entry
      const entryId = await ctx.db.insert("entries", {
        userId: args.userId,
        metricId: args.metricId,
        date: args.date,
        value: args.value,
        note: args.note,
        createdAt: now,
        updatedAt: now,
      });
      return entryId;
    }
  },
});

// Delete an entry
export const deleteEntry = mutation({
  args: { entryId: v.id("entries") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.entryId);
  },
});

// Get all unique dates for a user's entries
export const getUserEntryDates = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const entries = await ctx.db
      .query("entries")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const uniqueDates = [...new Set(entries.map((e) => e.date))].sort();
    return uniqueDates;
  },
});

// Get entries for a user in a date range
export const getUserEntriesInRange = query({
  args: {
    userId: v.id("users"),
    startDate: v.string(),
    endDate: v.string(),
  },
  handler: async (ctx, args) => {
    const entries = await ctx.db
      .query("entries")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    // Filter by date range (ISO string comparison works for YYYY-MM-DD format)
    return entries.filter(
      (e) => e.date >= args.startDate && e.date <= args.endDate
    );
  },
});
