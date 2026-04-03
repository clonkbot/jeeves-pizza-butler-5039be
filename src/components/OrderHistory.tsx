import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Doc } from "../../convex/_generated/dataModel";

type Order = Doc<"orders">;

export function OrderHistory() {
  const orders = useQuery(api.orders.list);

  if (orders === undefined) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-[#c9a227] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-[#c9a227]/20 text-[#c9a227] border-[#c9a227]/30";
      case "preparing":
        return "bg-[#f59e0b]/20 text-[#f59e0b] border-[#f59e0b]/30";
      case "delivering":
        return "bg-[#3b82f6]/20 text-[#3b82f6] border-[#3b82f6]/30";
      case "delivered":
        return "bg-[#4ade80]/20 text-[#4ade80] border-[#4ade80]/30";
      case "cancelled":
        return "bg-[#ef4444]/20 text-[#ef4444] border-[#ef4444]/30";
      default:
        return "bg-[#6b6155]/20 text-[#6b6155] border-[#6b6155]/30";
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="font-serif text-3xl text-[#f5f0e6] mb-2">Order History</h2>
        <p className="text-[#a89f8f]">A record of your esteemed pizza acquisitions</p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <span className="text-6xl mb-4 block">🍕</span>
          <h3 className="font-serif text-2xl text-[#f5f0e6] mb-2">No Orders Yet</h3>
          <p className="text-[#a89f8f]">
            Your order history shall appear here once you've sampled Papa John's fine offerings.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order: Order) => (
            <div
              key={order._id}
              className="bg-gradient-to-b from-[#2a2016] to-[#1f1812] border border-[#c9a227]/20 rounded-2xl p-4 sm:p-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                <div>
                  <h3 className="font-serif text-xl text-[#f5f0e6] mb-1">
                    {order.quantity}x {order.size} {order.pizzaType}
                  </h3>
                  <p className="text-[#6b6155] text-sm">{order.crust} Crust</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-sm border capitalize ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                  <span className="text-[#c9a227] font-serif text-lg">${order.totalPrice.toFixed(2)}</span>
                </div>
              </div>

              {order.butlerMessage && (
                <div className="bg-[#1a1410]/50 rounded-xl p-4 mb-4 border-l-2 border-[#c9a227]/50">
                  <p className="text-[#a89f8f] italic font-serif">"{order.butlerMessage}"</p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm">
                <div className="text-[#6b6155]">
                  <span>Ordered: </span>
                  <span className="text-[#a89f8f]">{formatDate(order.createdAt)}</span>
                </div>
                {order.estimatedDelivery && order.status !== "delivered" && order.status !== "cancelled" && (
                  <div className="text-[#6b6155]">
                    <span>Est. Delivery: </span>
                    <span className="text-[#c9a227]">{order.estimatedDelivery}</span>
                  </div>
                )}
              </div>

              {order.specialInstructions && (
                <div className="mt-3 pt-3 border-t border-[#c9a227]/10">
                  <p className="text-[#6b6155] text-sm">
                    <span className="text-[#a89f8f]">Special Instructions:</span> {order.specialInstructions}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
