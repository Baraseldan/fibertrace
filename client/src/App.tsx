import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/useAuth";
import NotFound from "@/pages/not-found";

// Pages
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Jobs from "@/pages/Jobs";
import CreateJob from "@/pages/CreateJob";
import Map from "@/pages/Map";
import Meter from "@/pages/Meter";
import Inventory from "@/pages/Inventory";
import Reports from "@/pages/Reports";
import Topology from "@/pages/Topology";
import PowerAnalysis from "@/pages/PowerAnalysis";
import Infrastructure from "@/pages/Infrastructure";
import Nodes from "@/pages/Nodes";
import Splicer from "@/pages/Splicer";
import Calculator from "@/pages/Calculator";

import Layout from "@/components/Layout";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Login} />
      
      {/* Protected Routes Wrapper */}
      <Route path="/:rest*">
        {(params) => (
          <Layout>
            <Switch>
              <Route path="/dashboard" component={Dashboard} />
              <Route path="/jobs" component={Jobs} />
              <Route path="/jobs/new" component={CreateJob} />
              <Route path="/map" component={Map} />
              <Route path="/meter" component={Meter} />
              <Route path="/inventory" component={Inventory} />
              <Route path="/reports" component={Reports} />
              <Route path="/topology" component={Topology} />
              <Route path="/power-analysis" component={PowerAnalysis} />
              <Route path="/infrastructure" component={Infrastructure} />
              <Route path="/nodes" component={Nodes} />
              <Route path="/splicer" component={Splicer} />
              <Route path="/calculator" component={Calculator} />
              <Route component={NotFound} />
            </Switch>
          </Layout>
        )}
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
