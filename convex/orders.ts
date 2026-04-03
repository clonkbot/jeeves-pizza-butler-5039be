import { query, mutation, action } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { api } from "./_generated/api";

// Get all orders for the current user
export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("orders")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

// Get most recent order
export const getMostRecent = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const orders = await ctx.db
      .query("orders")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(1);
    return orders[0] || null;
  },
});

// Create a new order
export const create = mutation({
  args: {
    pizzaType: v.string(),
    size: v.string(),
    crust: v.string(),
    toppings: v.array(v.string()),
    quantity: v.number(),
    specialInstructions: v.optional(v.string()),
    deliveryAddress: v.string(),
    phone: v.string(),
    butlerMessage: v.string(),
    totalPrice: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Calculate estimated delivery (30-45 mins)
    const now = new Date();
    const minDelivery = new Date(now.getTime() + 30 * 60000);
    const maxDelivery = new Date(now.getTime() + 45 * 60000);
    const formatTime = (d: Date) => d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    const estimatedDelivery = `${formatTime(minDelivery)} - ${formatTime(maxDelivery)}`;

    return await ctx.db.insert("orders", {
      userId,
      pizzaType: args.pizzaType,
      size: args.size,
      crust: args.crust,
      toppings: args.toppings,
      quantity: args.quantity,
      specialInstructions: args.specialInstructions,
      deliveryAddress: args.deliveryAddress,
      phone: args.phone,
      status: "confirmed",
      butlerMessage: args.butlerMessage,
      estimatedDelivery,
      totalPrice: args.totalPrice,
      createdAt: Date.now(),
    });
  },
});

// Update order status
export const updateStatus = mutation({
  args: {
    orderId: v.id("orders"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const order = await ctx.db.get(args.orderId);
    if (!order || order.userId !== userId) throw new Error("Order not found");

    await ctx.db.patch(args.orderId, { status: args.status });
  },
});
