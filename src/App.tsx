import { useState } from "react";
import { Route, Switch } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { trpc, createTrpcClient } from "./lib/trpc";
import OwnerLogin from "./pages/OwnerLogin";
import OwnerDashboard from "./pages/OwnerDashboard";

export default function App() {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() => createTrpcClient());

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <Switch>
          <Route path="/owner" component={OwnerLogin} />
          <Route path="/owner/dashboard" component={OwnerDashboard} />
          <Route>
            <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
              <p className="text-white/40 text-sm">Page not found.</p>
            </div>
          </Route>
        </Switch>
        <Toaster richColors position="top-right" />
      </QueryClientProvider>
    </trpc.Provider>
  );
}
