
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { navItems } from "./nav-items";
import ClubDetail from "./pages/ClubDetail";
import CompetitionDetail from "./pages/CompetitionDetail";
import ProviderDetail from "./pages/ProviderDetail";
import DetailVergleich from "./pages/DetailVergleich";
import NotFound from "./pages/NotFound";
import Vergleich from "./pages/Vergleich";
import DetailVergleich2 from "./pages/DetailVergleich2";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {navItems
            .filter(item => item.title !== "News") // Remove news route
            .map(({ to, page }) => (
              <Route key={to} path={to} element={page} />
            ))}
          {/* Detail routes */}
          <Route path="/club/:slug" element={<ClubDetail />} />
          <Route path="/competition/:slug" element={<CompetitionDetail />} />
          <Route path="/streaming-provider/:slug" element={<ProviderDetail />} />
          <Route path="/detailvergleich" element={<DetailVergleich />} />
          <Route path="/classic-vergleich" element={<Vergleich />} />
          <Route path="/detailvergleich2" element={<DetailVergleich2 />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
