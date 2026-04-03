import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Get user preferences
export const get = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const prefs = await ctx.db
      .query("userPreferences")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    return prefs;
  },
});

// Save user preferences
export const save = mutation({
  args: {
    name: v.string(),
    address: v.string(),
    phone: v.string(),
    defaultPizza: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("userPreferences")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        name: args.name,
        address: args.address,
        phone: args.phone,
        defaultPizza: args.defaultPizza,
        updatedAt: Date.now(),
      });
      return existing._id;
    } else {
      return await ctx.db.insert("userPreferences", {
        userId,
        name: args.name,
        address: args.address,
        phone: args.phone,
        defaultPizza: args.defaultPizza,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
  },
});
