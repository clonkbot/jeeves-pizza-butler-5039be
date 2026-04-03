import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuthActions } from "@convex-dev/auth/react";

export function SetupWizard() {
  const savePreferences = useMutation(api.preferences.save);
  const { signOut } = useAuthActions();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await savePreferences({
        name: formData.name,
        address: formData.address,
        phone: formData.phone,
      });
    } catch (err) {
      setError("Failed to save preferences. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1410] flex flex-col relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 -left-32 w-96 h-96 bg-[#c9a227]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 -right-32 w-96 h-96 bg-[#8b1a1a]/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 p-4 sm:p-6 flex justify-end">
        <button
          onClick={() => signOut()}
          className="text-[#6b6155] hover:text-[#c9a227] text-sm transition-colors"
        >
          Sign Out
        </button>
      </header>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 relative z-10">
        <div className="w-full max-w-lg">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-4">
              <span className="text-4xl">🎩</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl text-[#f5f0e6] mb-3">
              Good Evening, Sir
            </h1>
            <p className="text-[#a89f8f] text-lg leading-relaxed max-w-md mx-auto">
              Before I may attend to your pizza requirements, I shall require a few particulars.
            </p>
          </div>

          {/* Form card */}
          <div className="bg-gradient-to-b from-[#2a2016] to-[#1f1812] border border-[#c9a227]/30 rounded-2xl p-6 sm:p-8 shadow-2xl">
            {error && (
              <div className="mb-6 p-3 bg-[#8b1a1a]/20 border border-[#8b1a1a]/50 rounded-lg text-[#f5a5a5] text-sm text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-[#c9a227] text-xs uppercase tracking-widest mb-2">
                  How Shall I Address You?
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-[#1a1410] border border-[#c9a227]/30 rounded-lg text-[#f5f0e6] placeholder-[#6b6155] focus:outline-none focus:border-[#c9a227] focus:ring-1 focus:ring-[#c9a227]/50 transition-all"
                  placeholder="Mr. John Smith"
                />
              </div>

              <div>
                <label className="block text-[#c9a227] text-xs uppercase tracking-widest mb-2">
                  Delivery Address
                </label>
                <textarea
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 bg-[#1a1410] border border-[#c9a227]/30 rounded-lg text-[#f5f0e6] placeholder-[#6b6155] focus:outline-none focus:border-[#c9a227] focus:ring-1 focus:ring-[#c9a227]/50 transition-all resize-none"
                  placeholder="123 Manor Lane, Suite 4&#10;London, UK SW1A 1AA"
                />
              </div>

              <div>
                <label className="block text-[#c9a227] text-xs uppercase tracking-widest mb-2">
                  Telephone Number
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 bg-[#1a1410] border border-[#c9a227]/30 rounded-lg text-[#f5f0e6] placeholder-[#6b6155] focus:outline-none focus:border-[#c9a227] focus:ring-1 focus:ring-[#c9a227]/50 transition-all"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 mt-4 bg-gradient-to-r from-[#c9a227] to-[#a88620] text-[#1a1410] font-serif text-lg rounded-lg hover:from-[#d9b237] hover:to-[#b89630] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#c9a227]/20 active:scale-[0.98]"
              >
                {isLoading ? (
                  <span className="inline-flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-[#1a1410] border-t-transparent rounded-full animate-spin" />
                    Noting your details...
                  </span>
                ) : (
                  "Very Good, Proceed"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 py-4 text-center">
        <p className="text-[#6b6155] text-xs">
          Requested by @LBallz77283 · Built by @clonkbot
        </p>
      </footer>
    </div>
  );
}
