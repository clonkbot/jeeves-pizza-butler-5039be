import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";

export function AuthScreen() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    try {
      await signIn("password", formData);
    } catch (err) {
      setError("Authentication failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnonymous = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signIn("anonymous");
    } catch (err) {
      setError("Failed to sign in as guest.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1410] flex flex-col relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMzAgMzBtLTI4IDBhMjgsMjggMCAxLDAgNTYsMGEyOCwyOCAwIDEsMCAtNTYsMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjYzlhMjI3IiBzdHJva2Utd2lkdGg9IjAuNSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDUiLz48L3N2Zz4=')] opacity-30" />
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#c9a227]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-[#8b1a1a]/10 rounded-full blur-3xl" />
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 relative z-10">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 mb-6 relative">
              <div className="absolute inset-0 border-2 border-[#c9a227] rounded-full animate-pulse" />
              <div className="absolute inset-2 border border-[#c9a227]/50 rounded-full" />
              <span className="text-4xl sm:text-5xl">🎩</span>
            </div>
            <h1 className="font-serif text-4xl sm:text-5xl text-[#f5f0e6] mb-3 tracking-tight">
              Jeeves
            </h1>
            <p className="text-[#c9a227] text-lg sm:text-xl tracking-widest uppercase font-light">
              Your Personal Pizza Butler
            </p>
          </div>

          {/* Auth card */}
          <div className="bg-gradient-to-b from-[#2a2016] to-[#1f1812] border border-[#c9a227]/30 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-sm">
            <div className="text-center mb-6">
              <h2 className="font-serif text-2xl text-[#f5f0e6] mb-2">
                {flow === "signIn" ? "Welcome Back, Sir" : "Your Registration"}
              </h2>
              <p className="text-[#a89f8f] text-sm">
                {flow === "signIn"
                  ? "Please present your credentials"
                  : "Allow me to take your particulars"}
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-[#8b1a1a]/20 border border-[#8b1a1a]/50 rounded-lg text-[#f5a5a5] text-sm text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[#c9a227] text-xs uppercase tracking-widest mb-2">
                  Electronic Mail
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  className="w-full px-4 py-3 bg-[#1a1410] border border-[#c9a227]/30 rounded-lg text-[#f5f0e6] placeholder-[#6b6155] focus:outline-none focus:border-[#c9a227] focus:ring-1 focus:ring-[#c9a227]/50 transition-all"
                  placeholder="your.email@domain.com"
                />
              </div>
              <div>
                <label className="block text-[#c9a227] text-xs uppercase tracking-widest mb-2">
                  Secret Word
                </label>
                <input
                  name="password"
                  type="password"
                  required
                  className="w-full px-4 py-3 bg-[#1a1410] border border-[#c9a227]/30 rounded-lg text-[#f5f0e6] placeholder-[#6b6155] focus:outline-none focus:border-[#c9a227] focus:ring-1 focus:ring-[#c9a227]/50 transition-all"
                  placeholder="••••••••"
                />
              </div>
              <input name="flow" type="hidden" value={flow} />

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-gradient-to-r from-[#c9a227] to-[#a88620] text-[#1a1410] font-serif text-lg rounded-lg hover:from-[#d9b237] hover:to-[#b89630] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#c9a227]/20 active:scale-[0.98]"
              >
                {isLoading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-[#1a1410] border-t-transparent rounded-full animate-spin" />
                    One moment, please...
                  </span>
                ) : flow === "signIn" ? (
                  "Enter the Manor"
                ) : (
                  "Register with the Butler"
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-[#c9a227]/20">
              <button
                onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
                className="w-full text-center text-[#a89f8f] hover:text-[#c9a227] transition-colors text-sm"
              >
                {flow === "signIn"
                  ? "New here? Create an account"
                  : "Already registered? Sign in"}
              </button>
            </div>

            <div className="mt-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#c9a227]/20" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="px-3 bg-[#231a14] text-[#6b6155]">or</span>
                </div>
              </div>
              <button
                onClick={handleAnonymous}
                disabled={isLoading}
                className="w-full mt-4 py-3 border border-[#c9a227]/30 text-[#c9a227] rounded-lg hover:bg-[#c9a227]/10 transition-all disabled:opacity-50"
              >
                Continue as Guest
              </button>
            </div>
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
