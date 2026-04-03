import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,

  // Store user preferences
  userPreferences: defineTable({
    userId: v.id("users"),
    name: v.string(),
    address: v.string(),
    phone: v.string(),
    defaultPizza: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  // Pizza orders
  orders: defineTable({
    userId: v.id("users"),
    pizzaType: v.string(),
    size: v.string(),
    crust: v.string(),
    toppings: v.array(v.string()),
    quantity: v.number(),
    specialInstructions: v.optional(v.string()),
    deliveryAddress: v.string(),
    phone: v.string(),
    status: v.string(), // "preparing", "confirmed", "delivering", "delivered", "cancelled"
    butlerMessage: v.string(),
    estimatedDelivery: v.optional(v.string()),
    totalPrice: v.number(),
    createdAt: v.number(),
  }).index("by_user", ["userId"]).index("by_status", ["status"]),

  // Butler conversation history
  conversations: defineTable({
    userId: v.id("users"),
    role: v.string(), // "user" or "butler"
    message: v.string(),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),
});
