import { Switch, Route } from "wouter";
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
import ProtectedRoute from "@/components/ProtectedRoute";
import NotAuthorized from "@/pages/not-authorized";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/auth" component={Auth} />
      <Route path="/dashboard">
        {(params) => <ProtectedRoute component={Dashboard} {...params} />}
      </Route>
      <Route path="/admin">
        {(params) => <ProtectedRoute component={Admin} adminOnly {...params} />}
      </Route>
      <Route path="/gallery" component={Gallery} />
      <Route path="/contact" component={Contact} />
      <Route path="/trees/:id">
        {(params) => <ProtectedRoute component={TreeDetails} params={params} />}
      </Route>
      <Route path="/leaderboard" component={Leaderboard} />
      <Route path="/not-authorized" component={NotAuthorized} />
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
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </LanguageProvider>
  );
}

export default App;
