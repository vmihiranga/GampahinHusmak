import React, { useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Auth from "@/pages/auth";
import Dashboard from "@/pages/dashboard";
import Admin from "@/pages/admin";
import Gallery from "@/pages/gallery";
import Contact from "@/pages/contact";
import TreeDetails from "@/pages/tree-details";
import Leaderboard from "@/pages/leaderboard";
import PendingApproval from "@/pages/pending-approval";
import ProtectedRoute from "@/components/ProtectedRoute";
import NotAuthorized from "@/pages/not-authorized";
import { Language } from "./lib/translations";

function AppRouter() {
  const [location, setLocation] = useLocation();

  // Handle redirects for paths without language prefix
  useEffect(() => {
    const segments = location.split('/').filter(Boolean);
    const firstSegment = segments[0] as Language;
    const VALID_LANGUAGES: Language[] = ['en', 'si', 'ta'];
    
    if (location !== "/" && location !== "" && !VALID_LANGUAGES.includes(firstSegment)) {
      const savedLang = localStorage.getItem('app-language') || 'en';
      setLocation(`/${savedLang}${location.startsWith('/') ? location : '/' + location}`);
    }
  }, [location, setLocation]);

  return (
    <Switch>
      {/* Root redirect */}
      <Route path="/">
        {() => {
           const savedLang = localStorage.getItem('app-language') || 'en';
           setLocation(`/${savedLang}`);
           return null;
        }}
      </Route>

      {/* English Routes */}
      <Route path="/en" component={Home} />
      <Route path="/en/auth" component={Auth} />
      <Route path="/en/dashboard">
        {(params) => <ProtectedRoute component={Dashboard} {...params} />}
      </Route>
      <Route path="/en/admin">
        {(params) => <ProtectedRoute component={Admin} adminOnly {...params} />}
      </Route>
      <Route path="/en/gallery" component={Gallery} />
      <Route path="/en/contact" component={Contact} />
      <Route path="/en/trees/:id">
        {(params) => <ProtectedRoute component={TreeDetails} params={params} />}
      </Route>
      <Route path="/en/leaderboard" component={Leaderboard} />
      <Route path="/en/pending-approval" component={PendingApproval} />
      <Route path="/en/not-authorized" component={NotAuthorized} />

      {/* Sinhala Routes */}
      <Route path="/si" component={Home} />
      <Route path="/si/auth" component={Auth} />
      <Route path="/si/dashboard">
        {(params) => <ProtectedRoute component={Dashboard} {...params} />}
      </Route>
      <Route path="/si/admin">
        {(params) => <ProtectedRoute component={Admin} adminOnly {...params} />}
      </Route>
      <Route path="/si/gallery" component={Gallery} />
      <Route path="/si/contact" component={Contact} />
      <Route path="/si/trees/:id">
        {(params) => <ProtectedRoute component={TreeDetails} params={params} />}
      </Route>
      <Route path="/si/leaderboard" component={Leaderboard} />
      <Route path="/si/pending-approval" component={PendingApproval} />
      <Route path="/si/not-authorized" component={NotAuthorized} />

      {/* Tamil Routes */}
      <Route path="/ta" component={Home} />
      <Route path="/ta/auth" component={Auth} />
      <Route path="/ta/dashboard">
        {(params) => <ProtectedRoute component={Dashboard} {...params} />}
      </Route>
      <Route path="/ta/admin">
        {(params) => <ProtectedRoute component={Admin} adminOnly {...params} />}
      </Route>
      <Route path="/ta/gallery" component={Gallery} />
      <Route path="/ta/contact" component={Contact} />
      <Route path="/ta/trees/:id">
        {(params) => <ProtectedRoute component={TreeDetails} params={params} />}
      </Route>
      <Route path="/ta/leaderboard" component={Leaderboard} />
      <Route path="/ta/pending-approval" component={PendingApproval} />
      <Route path="/ta/not-authorized" component={NotAuthorized} />

      {/* Fallback */}
      <Route component={NotFound} />
    </Switch>
  );
}

import { LanguageProvider } from "@/hooks/use-language";

function App() {
  return (
    <LanguageProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <AppRouter />
        </TooltipProvider>
      </QueryClientProvider>
    </LanguageProvider>
  );
}

export default App;
