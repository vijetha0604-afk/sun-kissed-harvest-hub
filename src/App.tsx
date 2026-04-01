import { useState } from 'react';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";
import FarmerPortal from "@/pages/FarmerPortal";
import Marketplace from "@/pages/Marketplace";
import AdminCenter from "@/pages/AdminCenter";
import Login from "@/pages/Login";
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
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<Login lang={lang} />} />
              <Route element={<Layout lang={lang} setLang={setLang}><></></Layout>}>
                {/* Wrapped routes are unused; Layout wraps via children below */}
              </Route>
              <Route path="/" element={
                <ProtectedRoute requiredRole="farmer">
                  <Layout lang={lang} setLang={setLang}>
                    <FarmerPortal lang={lang} />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/marketplace" element={
                <ProtectedRoute>
                  <Layout lang={lang} setLang={setLang}>
                    <Marketplace lang={lang} />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/admin" element={
                <ProtectedRoute>
                  <Layout lang={lang} setLang={setLang}>
                    <AdminCenter lang={lang} />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
