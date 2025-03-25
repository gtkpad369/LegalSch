import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";

// Lawyer dashboard pages
import Dashboard from "@/pages/lawyer/dashboard";
import Agenda from "@/pages/lawyer/agenda";
import Profile from "@/pages/lawyer/profile";
import Clients from "@/pages/lawyer/clients";
import Settings from "@/pages/lawyer/settings";
import AppointmentDetail from "@/pages/lawyer/appointment-detail";

// Public pages
import BookAppointment from "@/pages/public/book-appointment";
import BookingSuccess from "@/pages/public/booking-success";
import NotFound from "@/pages/not-found";

// Create data route to seed demo data
import { useEffect } from "react";
import { apiRequest } from "./lib/queryClient";

function Router() {
  // Create demo data when the app starts
  useEffect(() => {
    const createDemoData = async () => {
      try {
        await apiRequest("POST", "/api/seed-demo-data", {});
        console.log("Demo data created successfully");
      } catch (error) {
        console.error("Failed to create demo data:", error);
      }
    };

    createDemoData();
  }, []);

  return (
    <Switch>
      {/* Lawyer dashboard routes */}
      <Route path="/" component={Dashboard} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/agenda" component={Agenda} />
      <Route path="/profile" component={Profile} />
      <Route path="/clients" component={Clients} />
      <Route path="/settings" component={Settings} />
      <Route path="/appointments/:id" component={AppointmentDetail} />
      
      {/* Public booking routes */}
      <Route path="/book/:slug" component={BookAppointment} />
      <Route path="/booking-success" component={BookingSuccess} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
