import { useState } from 'react';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "@/components/Layout";
import FarmerPortal from "@/pages/FarmerPortal";
import Marketplace from "@/pages/Marketplace";
import AdminCenter from "@/pages/AdminCenter";
import NotFound from "./pages/NotFound";
import { Language } from "@/lib/i18n";

const queryClient = new QueryClient();

const App = () => {
  const [lang, setLang] = useState<Language>('en');

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Layout lang={lang} setLang={setLang}>
            <Routes>
              <Route path="/" element={<FarmerPortal lang={lang} />} />
              <Route path="/marketplace" element={<Marketplace lang={lang} />} />
              <Route path="/admin" element={<AdminCenter lang={lang} />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
