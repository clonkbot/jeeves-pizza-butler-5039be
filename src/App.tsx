import { useState, useEffect } from "react";
import { useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { AuthScreen } from "./components/AuthScreen";
import { ButlerDashboard } from "./components/ButlerDashboard";
import { SetupWizard } from "./components/SetupWizard";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

export default function App() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { signOut } = useAuthActions();
  const preferences = useQuery(api.preferences.get);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#1a1410] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-6 border-4 border-[#c9a227] border-t-transparent rounded-full animate-spin" />
          <p className="font-serif text-[#c9a227] text-xl tracking-wider animate-pulse">
            The butler is preparing...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  // Check if user needs to set up their delivery preferences
  if (preferences === undefined) {
    return (
      <div className="min-h-screen bg-[#1a1410] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#c9a227] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (preferences === null) {
    return <SetupWizard />;
  }

  return <ButlerDashboard preferences={preferences} onSignOut={signOut} />;
}
