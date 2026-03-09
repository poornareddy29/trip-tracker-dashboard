import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Truck,
  LayoutDashboard,
  Users,
  UserCheck,
  Car,
  MapPin,
  Receipt,
  FileText,
  LogOut,
  Building2,
  UserCog,
  Route,
  DollarSign,
  Package,
  Store,
  CreditCard,
} from "lucide-react";
import type { ReactNode } from "react";

const navGroups = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", icon: LayoutDashboard, path: "/" },
      { title: "Company", icon: Building2, path: "/company" },
      { title: "Customers", icon: Users, path: "/customers" },
    ],
  },
  {
    label: "Fleet Management",
    items: [
      { title: "Vehicles", icon: Car, path: "/vehicles" },
      { title: "Drivers", icon: UserCheck, path: "/drivers" },
      { title: "Employees", icon: UserCog, path: "/employees" },
    ],
  },
  {
    label: "Trip Operations",
    items: [
      { title: "Trips", icon: MapPin, path: "/trips" },
      { title: "Routes", icon: Route, path: "/routes" },
      { title: "Trip Expenses", icon: Receipt, path: "/trip-expenses" },
      { title: "Rate Master", icon: DollarSign, path: "/rate-master" },
    ],
  },
  {
    label: "Billing",
    items: [
      { title: "Invoices", icon: FileText, path: "/invoices" },
      { title: "Payments", icon: CreditCard, path: "/payments" },
    ],
  },
  {
    label: "Supply Chain",
    items: [
      { title: "Suppliers", icon: Package, path: "/suppliers" },
      { title: "Vendors", icon: Store, path: "/vendors" },
    ],
  },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Truck className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-base font-semibold text-sidebar-foreground">
              TMS
            </span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          {navGroups.map((group) => (
            <SidebarGroup key={group.label}>
              <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => (
                    <SidebarMenuItem key={item.path}>
                      <SidebarMenuButton
                        isActive={location.pathname === item.path}
                        onClick={() => navigate(item.path)}
                        tooltip={item.title}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>
        <SidebarFooter className="p-4">
          <div className="flex items-center gap-2">
            <div className="flex-1 truncate text-xs text-sidebar-foreground/70">
              {user?.email}
            </div>
            <button
              onClick={signOut}
              className="rounded-md p-1.5 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-12 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <span className="text-sm font-medium text-foreground">
            {navGroups.flatMap((g) => g.items).find((i) => i.path === location.pathname)?.title ?? ""}
          </span>
        </header>
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
