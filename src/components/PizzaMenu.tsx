import { useState } from "react";
import { useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Doc } from "../../convex/_generated/dataModel";

interface PizzaMenuProps {
  preferences: Doc<"userPreferences">;
  onOrderComplete: () => void;
  onError: (message: string) => void;
}

const PIZZAS = [
  { name: "Pepperoni", description: "Classic pepperoni with extra cheese", price: 14.99, popular: true },
  { name: "The Works", description: "Pepperoni, sausage, mushrooms, onions, green peppers, black olives", price: 17.99, popular: true },
  { name: "BBQ Chicken Bacon", description: "Grilled chicken, bacon, onions, BBQ sauce", price: 18.99, popular: false },
  { name: "Garden Fresh", description: "Mushrooms, black olives, onions, green peppers, tomatoes", price: 15.99, popular: false },
  { name: "Meat Lovers", description: "Pepperoni, sausage, beef, bacon, ham", price: 19.99, popular: true },
  { name: "Hawaiian", description: "Ham and pineapple with extra cheese", price: 15.99, popular: false },
  { name: "Margherita", description: "Fresh mozzarella, tomatoes, basil, olive oil", price: 16.99, popular: false },
  { name: "Buffalo Chicken", description: "Buffalo chicken, ranch, red onions", price: 17.99, popular: false },
];

const SIZES = [
  { name: "Small", inches: 10, multiplier: 0.8 },
  { name: "Medium", inches: 12, multiplier: 1.0 },
  { name: "Large", inches: 14, multiplier: 1.2 },
  { name: "Extra Large", inches: 16, multiplier: 1.4 },
];

const CRUSTS = [
  { name: "Original", price: 0 },
  { name: "Thin", price: 0 },
  { name: "Pan", price: 2.0 },
  { name: "Stuffed", price: 3.0 },
];

export function PizzaMenu({ preferences, onOrderComplete, onError }: PizzaMenuProps) {
  const [selectedPizza, setSelectedPizza] = useState<string | null>(null);
  const [size, setSize] = useState("Large");
  const [crust, setCrust] = useState("Original");
  const [quantity, setQuantity] = useState(1);
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [isOrdering, setIsOrdering] = useState(false);

  const createOrder = useMutation(api.orders.create);
  const chat = useAction(api.ai.chat);

  const selectedPizzaData = PIZZAS.find((p) => p.name === selectedPizza);
  const selectedSizeData = SIZES.find((s) => s.name === size);
  const selectedCrustData = CRUSTS.find((c) => c.name === crust);

  const calculatePrice = () => {
    if (!selectedPizzaData || !selectedSizeData || !selectedCrustData) return 0;
    const basePrice = selectedPizzaData.price * selectedSizeData.multiplier;
    return (basePrice + selectedCrustData.price) * quantity;
  };

  const handleOrder = async () => {
    if (!selectedPizza || !selectedPizzaData) {
      onError("Please select a pizza first.");
      return;
    }

    setIsOrdering(true);

    try {
      const confirmationMessage = await chat({
        messages: [
          {
            role: "user",
            content: `Confirm a pizza order for ${preferences.name}. They ordered ${quantity}x ${size} ${selectedPizza} pizza with ${crust} crust from Papa John's. Total: $${calculatePrice().toFixed(2)}. Generate a witty, elegant butler confirmation (2-3 sentences). Don't use quotation marks.`,
          },
        ],
        systemPrompt:
          "You are Jeeves, an impeccably proper English butler. Confirm the pizza order with formal elegance and subtle wit. Mention that you've placed the order with Papa John's.",
      });

      await createOrder({
        pizzaType: selectedPizza,
        size,
        crust,
        toppings: [selectedPizza],
        quantity,
        specialInstructions: specialInstructions || undefined,
        deliveryAddress: preferences.address,
        phone: preferences.phone,
        butlerMessage: confirmationMessage,
        totalPrice: calculatePrice(),
      });

      onOrderComplete();
    } catch (error) {
      onError("Failed to place order. Please try again.");
    } finally {
      setIsOrdering(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="font-serif text-3xl text-[#f5f0e6] mb-2">The Menu</h2>
        <p className="text-[#a89f8f]">Select your preferred pizza from Papa John's fine offerings</p>
      </div>

      {/* Pizza selection */}
      <div>
        <h3 className="text-[#c9a227] text-xs uppercase tracking-widest mb-4">Select Your Pizza</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {PIZZAS.map((pizza) => (
            <button
              key={pizza.name}
              onClick={() => setSelectedPizza(pizza.name)}
              className={`relative text-left p-4 rounded-xl border transition-all ${
                selectedPizza === pizza.name
                  ? "bg-[#c9a227]/20 border-[#c9a227]"
                  : "bg-[#2a2016]/50 border-[#c9a227]/20 hover:border-[#c9a227]/50"
              }`}
            >
              {pizza.popular && (
                <span className="absolute top-2 right-2 px-2 py-0.5 bg-[#8b1a1a] text-[#f5f0e6] text-xs rounded-full">
                  Popular
                </span>
              )}
              <h4 className="font-serif text-lg text-[#f5f0e6] mb-1">{pizza.name}</h4>
              <p className="text-[#6b6155] text-sm mb-2 line-clamp-1">{pizza.description}</p>
              <p className="text-[#c9a227] font-serif">${pizza.price.toFixed(2)}</p>
            </button>
          ))}
        </div>
      </div>

      {selectedPizza && (
        <>
          {/* Size selection */}
          <div>
            <h3 className="text-[#c9a227] text-xs uppercase tracking-widest mb-4">Select Size</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {SIZES.map((s) => (
                <button
                  key={s.name}
                  onClick={() => setSize(s.name)}
                  className={`p-4 rounded-xl border transition-all ${
                    size === s.name
                      ? "bg-[#c9a227]/20 border-[#c9a227]"
                      : "bg-[#2a2016]/50 border-[#c9a227]/20 hover:border-[#c9a227]/50"
                  }`}
                >
                  <p className="font-serif text-[#f5f0e6]">{s.name}</p>
                  <p className="text-[#6b6155] text-sm">{s.inches}" pizza</p>
                </button>
              ))}
            </div>
          </div>

          {/* Crust selection */}
          <div>
            <h3 className="text-[#c9a227] text-xs uppercase tracking-widest mb-4">Select Crust</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {CRUSTS.map((c) => (
                <button
                  key={c.name}
                  onClick={() => setCrust(c.name)}
                  className={`p-4 rounded-xl border transition-all ${
                    crust === c.name
                      ? "bg-[#c9a227]/20 border-[#c9a227]"
                      : "bg-[#2a2016]/50 border-[#c9a227]/20 hover:border-[#c9a227]/50"
                  }`}
                >
                  <p className="font-serif text-[#f5f0e6]">{c.name}</p>
                  <p className="text-[#6b6155] text-sm">
                    {c.price > 0 ? `+$${c.price.toFixed(2)}` : "Included"}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div>
            <h3 className="text-[#c9a227] text-xs uppercase tracking-widest mb-4">Quantity</h3>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-12 h-12 rounded-lg border border-[#c9a227]/30 text-[#c9a227] hover:bg-[#c9a227]/10 transition-all text-2xl"
              >
                −
              </button>
              <span className="text-2xl font-serif text-[#f5f0e6] w-12 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(10, quantity + 1))}
                className="w-12 h-12 rounded-lg border border-[#c9a227]/30 text-[#c9a227] hover:bg-[#c9a227]/10 transition-all text-2xl"
              >
                +
              </button>
            </div>
          </div>

          {/* Special instructions */}
          <div>
            <h3 className="text-[#c9a227] text-xs uppercase tracking-widest mb-4">Special Instructions (Optional)</h3>
            <textarea
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="Any special requests for the chef..."
              rows={3}
              className="w-full px-4 py-3 bg-[#1a1410] border border-[#c9a227]/30 rounded-lg text-[#f5f0e6] placeholder-[#6b6155] focus:outline-none focus:border-[#c9a227] focus:ring-1 focus:ring-[#c9a227]/50 transition-all resize-none"
            />
          </div>

          {/* Order summary */}
          <div className="bg-gradient-to-b from-[#2a2016] to-[#1f1812] border border-[#c9a227]/30 rounded-2xl p-6">
            <h3 className="font-serif text-xl text-[#f5f0e6] mb-4">Order Summary</h3>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-[#a89f8f]">
                <span>
                  {quantity}x {size} {selectedPizza} ({crust})
                </span>
                <span className="text-[#f5f0e6]">${calculatePrice().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[#6b6155] text-sm">
                <span>Delivery to:</span>
                <span>{preferences.address.split("\n")[0]}</span>
              </div>
            </div>
            <div className="border-t border-[#c9a227]/20 pt-4 flex justify-between items-center mb-6">
              <span className="text-[#c9a227] font-serif text-lg">Total</span>
              <span className="text-[#f5f0e6] font-serif text-2xl">${calculatePrice().toFixed(2)}</span>
            </div>

            <button
              onClick={handleOrder}
              disabled={isOrdering}
              className="w-full py-4 bg-gradient-to-r from-[#8b1a1a] to-[#6b1414] text-[#f5f0e6] font-serif text-lg rounded-xl hover:from-[#a52a2a] hover:to-[#7b1a1a] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#8b1a1a]/30"
            >
              {isOrdering ? (
                <span className="inline-flex items-center justify-center gap-3">
                  <span className="w-5 h-5 border-2 border-[#f5f0e6] border-t-transparent rounded-full animate-spin" />
                  Placing your order...
                </span>
              ) : (
                "Place Order with Papa John's"
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
