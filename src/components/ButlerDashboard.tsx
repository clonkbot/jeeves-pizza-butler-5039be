import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Doc } from "../../convex/_generated/dataModel";
import { PizzaMenu } from "./PizzaMenu";
import { OrderHistory } from "./OrderHistory";
import { Toast } from "./Toast";

type Order = Doc<"orders">;

interface ButlerDashboardProps {
  preferences: Doc<"userPreferences">;
  onSignOut: () => void;
}

type ViewType = "home" | "menu" | "history" | "settings";

export function ButlerDashboard({ preferences, onSignOut }: ButlerDashboardProps) {
  const [view, setView] = useState<ViewType>("home");
  const [isOrdering, setIsOrdering] = useState(false);
  const [butlerMessage, setButlerMessage] = useState<string>("");
  const [showOrderConfirmation, setShowOrderConfirmation] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const orders = useQuery(api.orders.list);
  const recentOrder = useQuery(api.orders.getMostRecent);
  const createOrder = useMutation(api.orders.create);
  const chat = useAction(api.ai.chat);

  const greetingGenerated = useRef(false);

  // Generate butler greeting on mount
  useEffect(() => {
    if (greetingGenerated.current) return;
    greetingGenerated.current = true;

    const hour = new Date().getHours();
    let timeGreeting = "Good evening";
    if (hour < 12) timeGreeting = "Good morning";
    else if (hour < 17) timeGreeting = "Good afternoon";

    const generateGreeting = async () => {
      try {
        const response = await chat({
          messages: [
            {
              role: "user",
              content: `Generate a short, elegant butler greeting (1-2 sentences) for someone named "${preferences.name}". Time of day: ${timeGreeting}. You're a distinguished English butler named Jeeves who serves Papa John's pizza. Be witty but refined. Don't use quotation marks around the response.`,
            },
          ],
          systemPrompt:
            "You are Jeeves, an impeccably proper English butler who happens to specialize in procuring Papa John's pizza for your employer. Speak with formal elegance, subtle wit, and the utmost decorum. Keep responses concise and sophisticated.",
        });
        setButlerMessage(response);
      } catch (error) {
        setButlerMessage(`${timeGreeting}, ${preferences.name}. I stand ready to attend to your pizza requirements.`);
      }
    };
    generateGreeting();
  }, [preferences.name, chat]);

  const handleQuickOrder = async () => {
    if (!preferences.address || !preferences.phone) {
      setToast({ message: "Please complete your delivery details first.", type: "error" });
      return;
    }

    setIsOrdering(true);

    try {
      // Generate butler confirmation message
      const confirmationMessage = await chat({
        messages: [
          {
            role: "user",
            content: `Confirm a pizza order for ${preferences.name}. They ordered a Large Pepperoni pizza from Papa John's to be delivered to their address. Generate a witty, elegant butler confirmation (2-3 sentences). Don't use quotation marks.`,
          },
        ],
        systemPrompt:
          "You are Jeeves, an impeccably proper English butler. Confirm the pizza order with formal elegance and subtle wit. Mention that you've placed the order with Papa John's.",
      });

      await createOrder({
        pizzaType: "Pepperoni",
        size: "Large",
        crust: "Original",
        toppings: ["Pepperoni"],
        quantity: 1,
        deliveryAddress: preferences.address,
        phone: preferences.phone,
        butlerMessage: confirmationMessage,
        totalPrice: 16.99,
      });

      setButlerMessage(confirmationMessage);
      setShowOrderConfirmation(true);
      setToast({ message: "Order placed successfully with Papa John's!", type: "success" });
    } catch (error) {
      setToast({ message: "I regret to inform you that the order could not be placed.", type: "error" });
    } finally {
      setIsOrdering(false);
    }
  };

  const pendingOrders = orders?.filter((o: Order) => o.status !== "delivered" && o.status !== "cancelled") || [];

  return (
    <div className="min-h-screen bg-[#1a1410] flex flex-col">
      {/* Background decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMzAgMzBtLTI4IDBhMjgsMjggMCAxLDAgNTYsMGEyOCwyOCAwIDEsMCAtNTYsMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjYzlhMjI3IiBzdHJva2Utd2lkdGg9IjAuNSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDMiLz48L3N2Zz4=')] opacity-50" />
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-[#c9a227]/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-[#8b1a1a]/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-[#c9a227]/20 bg-[#1a1410]/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl sm:text-3xl">🎩</span>
            <div>
              <h1 className="font-serif text-xl sm:text-2xl text-[#f5f0e6]">Jeeves</h1>
              <p className="text-[#c9a227] text-xs tracking-widest uppercase hidden sm:block">Pizza Butler</p>
            </div>
          </div>
          <nav className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => setView("home")}
              className={`px-3 py-2 text-sm transition-colors ${view === "home" ? "text-[#c9a227]" : "text-[#a89f8f] hover:text-[#f5f0e6]"}`}
            >
              Home
            </button>
            <button
              onClick={() => setView("menu")}
              className={`px-3 py-2 text-sm transition-colors ${view === "menu" ? "text-[#c9a227]" : "text-[#a89f8f] hover:text-[#f5f0e6]"}`}
            >
              Menu
            </button>
            <button
              onClick={() => setView("history")}
              className={`px-3 py-2 text-sm transition-colors ${view === "history" ? "text-[#c9a227]" : "text-[#a89f8f] hover:text-[#f5f0e6]"}`}
            >
              Orders
            </button>
            <button
              onClick={onSignOut}
              className="ml-2 px-3 py-2 text-sm text-[#6b6155] hover:text-[#c9a227] transition-colors"
            >
              Sign Out
            </button>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex-1 px-4 sm:px-6 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto">
          {view === "home" && (
            <div className="space-y-8 sm:space-y-12">
              {/* Butler greeting */}
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 mb-6 relative">
                  <div className="absolute inset-0 border-2 border-[#c9a227]/50 rounded-full" />
                  <div className="absolute inset-2 border border-[#c9a227]/30 rounded-full animate-pulse" />
                  <span className="text-4xl sm:text-5xl">🎩</span>
                </div>
                <div className="min-h-[4rem] flex items-center justify-center">
                  {butlerMessage ? (
                    <p className="font-serif text-xl sm:text-2xl text-[#f5f0e6] leading-relaxed max-w-2xl mx-auto animate-fade-in">
                      "{butlerMessage}"
                    </p>
                  ) : (
                    <div className="flex items-center gap-2 text-[#c9a227]">
                      <span className="w-2 h-2 bg-[#c9a227] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 bg-[#c9a227] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 bg-[#c9a227] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  )}
                </div>
              </div>

              {/* Quick order section */}
              {showOrderConfirmation && recentOrder ? (
                <div className="bg-gradient-to-b from-[#1a3d1a] to-[#152d15] border border-[#4ade80]/30 rounded-2xl p-6 sm:p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#4ade80]/20 flex items-center justify-center">
                    <svg className="w-8 h-8 text-[#4ade80]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="font-serif text-2xl text-[#f5f0e6] mb-2">Order Confirmed</h3>
                  <p className="text-[#a89f8f] mb-4">
                    Your {recentOrder.size} {recentOrder.pizzaType} from Papa John's
                  </p>
                  <p className="text-[#c9a227] text-lg font-serif">
                    Estimated Delivery: {recentOrder.estimatedDelivery}
                  </p>
                  <button
                    onClick={() => setShowOrderConfirmation(false)}
                    className="mt-6 px-6 py-2 border border-[#c9a227]/50 text-[#c9a227] rounded-lg hover:bg-[#c9a227]/10 transition-all"
                  >
                    Order Again
                  </button>
                </div>
              ) : (
                <div className="bg-gradient-to-b from-[#2a2016] to-[#1f1812] border border-[#c9a227]/30 rounded-2xl p-6 sm:p-10 text-center">
                  <div className="mb-6">
                    <span className="text-6xl sm:text-7xl">🍕</span>
                  </div>
                  <h2 className="font-serif text-2xl sm:text-3xl text-[#f5f0e6] mb-3">
                    One-Click Pizza Service
                  </h2>
                  <p className="text-[#a89f8f] mb-8 max-w-md mx-auto">
                    Shall I procure your usual order from Papa John's, {preferences.name.split(" ")[0]}?
                    A Large Pepperoni on Original Crust.
                  </p>

                  <button
                    onClick={handleQuickOrder}
                    disabled={isOrdering}
                    className="group relative px-10 sm:px-16 py-5 sm:py-6 bg-gradient-to-r from-[#8b1a1a] to-[#6b1414] text-[#f5f0e6] font-serif text-xl sm:text-2xl rounded-xl hover:from-[#a52a2a] hover:to-[#7b1a1a] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-[#8b1a1a]/30 active:scale-[0.98]"
                  >
                    {isOrdering ? (
                      <span className="inline-flex items-center gap-3">
                        <span className="w-5 h-5 border-2 border-[#f5f0e6] border-t-transparent rounded-full animate-spin" />
                        Placing your order...
                      </span>
                    ) : (
                      <>
                        <span className="relative z-10">Order Papa John's Now</span>
                        <div className="absolute inset-0 rounded-xl border-2 border-[#c9a227]/0 group-hover:border-[#c9a227]/50 transition-all" />
                      </>
                    )}
                  </button>

                  <p className="mt-6 text-[#6b6155] text-sm">
                    $16.99 · Delivered to {preferences.address.split("\n")[0]}
                  </p>
                </div>
              )}

              {/* Custom order button */}
              <div className="text-center">
                <button
                  onClick={() => setView("menu")}
                  className="inline-flex items-center gap-2 text-[#c9a227] hover:text-[#d9b237] transition-colors"
                >
                  <span>Or customize your order from the menu</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Active orders */}
              {pendingOrders.length > 0 && (
                <div className="mt-8">
                  <h3 className="font-serif text-xl text-[#c9a227] mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#4ade80] rounded-full animate-pulse" />
                    Active Orders
                  </h3>
                  <div className="space-y-3">
                    {pendingOrders.slice(0, 2).map((order: Order) => (
                      <div
                        key={order._id}
                        className="bg-[#2a2016]/50 border border-[#c9a227]/20 rounded-xl p-4 flex items-center justify-between"
                      >
                        <div>
                          <p className="text-[#f5f0e6] font-serif">
                            {order.quantity}x {order.size} {order.pizzaType}
                          </p>
                          <p className="text-[#6b6155] text-sm capitalize">
                            Status: {order.status}
                          </p>
                        </div>
                        <p className="text-[#c9a227]">{order.estimatedDelivery}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {view === "menu" && (
            <PizzaMenu
              preferences={preferences}
              onOrderComplete={() => {
                setView("home");
                setShowOrderConfirmation(true);
                setToast({ message: "Order placed successfully!", type: "success" });
              }}
              onError={(msg) => setToast({ message: msg, type: "error" })}
            />
          )}

          {view === "history" && <OrderHistory />}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-4 text-center border-t border-[#c9a227]/10">
        <p className="text-[#6b6155] text-xs">
          Requested by @LBallz77283 · Built by @clonkbot
        </p>
      </footer>

      {/* Toast notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}
