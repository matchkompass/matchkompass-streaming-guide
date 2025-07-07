
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Wizard from "./pages/Wizard";
import Vergleich from "./pages/Vergleich";
import EnhancedVergleich from "./pages/EnhancedVergleich";
import DetailVergleich from "./pages/DetailVergleich";
import ClubDetail from "./pages/ClubDetail";
import CompetitionDetail from "./pages/CompetitionDetail";
import ProviderDetail from "./pages/ProviderDetail";
import Deals from "./pages/Deals";
import News from "./pages/News";
import NotFound from "./pages/NotFound";
import StreamingOptimizerPage from "./pages/StreamingOptimizer";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/wizard" element={<Wizard />} />
          <Route path="/vergleich" element={<EnhancedVergleich />} />
          <Route path="/vergleich-alt" element={<Vergleich />} />
          <Route path="/detailvergleich" element={<DetailVergleich />} />
          <Route path="/optimizer" element={<StreamingOptimizerPage />} />
          <Route path="/club/:slug" element={<ClubDetail />} />
          <Route path="/competition/:slug" element={<CompetitionDetail />} />
          <Route path="/streaming-provider/:slug" element={<ProviderDetail />} />
          <Route path="/deals" element={<Deals />} />
          <Route path="/news" element={<News />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
