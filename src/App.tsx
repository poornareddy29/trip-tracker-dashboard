import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Company from "./pages/Company";
import Customers from "./pages/Customers";
import Drivers from "./pages/Drivers";
import Vehicles from "./pages/Vehicles";
import Employees from "./pages/Employees";
import Trips from "./pages/Trips";
import RoutesPage from "./pages/Routes";
import TripExpenses from "./pages/TripExpenses";
import RateMaster from "./pages/RateMaster";
import Invoices from "./pages/Invoices";
import Payments from "./pages/Payments";
import Suppliers from "./pages/Suppliers";
import Vendors from "./pages/Vendors";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <AppLayout>{children}</AppLayout>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/company" element={<ProtectedRoute><Company /></ProtectedRoute>} />
            <Route path="/customers" element={<ProtectedRoute><Customers /></ProtectedRoute>} />
            <Route path="/drivers" element={<ProtectedRoute><Drivers /></ProtectedRoute>} />
            <Route path="/vehicles" element={<ProtectedRoute><Vehicles /></ProtectedRoute>} />
            <Route path="/employees" element={<ProtectedRoute><Employees /></ProtectedRoute>} />
            <Route path="/trips" element={<ProtectedRoute><Trips /></ProtectedRoute>} />
            <Route path="/routes" element={<ProtectedRoute><RoutesPage /></ProtectedRoute>} />
            <Route path="/trip-expenses" element={<ProtectedRoute><TripExpenses /></ProtectedRoute>} />
            <Route path="/rate-master" element={<ProtectedRoute><RateMaster /></ProtectedRoute>} />
            <Route path="/invoices" element={<ProtectedRoute><Invoices /></ProtectedRoute>} />
            <Route path="/payments" element={<ProtectedRoute><Payments /></ProtectedRoute>} />
            <Route path="/suppliers" element={<ProtectedRoute><Suppliers /></ProtectedRoute>} />
            <Route path="/vendors" element={<ProtectedRoute><Vendors /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
