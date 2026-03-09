
-- 1. companies
CREATE TABLE public.companies (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  address text,
  phone text,
  email text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their company" ON public.companies FOR SELECT TO authenticated USING (id = get_user_company_id(auth.uid()));
CREATE POLICY "Users can update their company" ON public.companies FOR UPDATE TO authenticated USING (id = get_user_company_id(auth.uid()));

-- 2. employee
CREATE TABLE public.employee (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  phone text,
  email text,
  position text,
  salary numeric,
  is_active boolean NOT NULL DEFAULT true,
  company_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.employee ENABLE ROW LEVEL SECURITY;
CREATE POLICY "employee_select" ON public.employee FOR SELECT TO authenticated USING (company_id = get_user_company_id(auth.uid()));
CREATE POLICY "employee_insert" ON public.employee FOR INSERT TO authenticated WITH CHECK (company_id = get_user_company_id(auth.uid()));
CREATE POLICY "employee_update" ON public.employee FOR UPDATE TO authenticated USING (company_id = get_user_company_id(auth.uid()));
CREATE POLICY "employee_delete" ON public.employee FOR DELETE TO authenticated USING (company_id = get_user_company_id(auth.uid()));

-- 3. routes
CREATE TABLE public.routes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  origin text NOT NULL,
  destination text NOT NULL,
  distance numeric,
  estimated_time text,
  company_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "routes_select" ON public.routes FOR SELECT TO authenticated USING (company_id = get_user_company_id(auth.uid()));
CREATE POLICY "routes_insert" ON public.routes FOR INSERT TO authenticated WITH CHECK (company_id = get_user_company_id(auth.uid()));
CREATE POLICY "routes_update" ON public.routes FOR UPDATE TO authenticated USING (company_id = get_user_company_id(auth.uid()));
CREATE POLICY "routes_delete" ON public.routes FOR DELETE TO authenticated USING (company_id = get_user_company_id(auth.uid()));

-- 4. rate_master
CREATE TABLE public.rate_master (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  rate numeric NOT NULL DEFAULT 0,
  unit text NOT NULL DEFAULT 'per_km',
  description text,
  company_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.rate_master ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rate_master_select" ON public.rate_master FOR SELECT TO authenticated USING (company_id = get_user_company_id(auth.uid()));
CREATE POLICY "rate_master_insert" ON public.rate_master FOR INSERT TO authenticated WITH CHECK (company_id = get_user_company_id(auth.uid()));
CREATE POLICY "rate_master_update" ON public.rate_master FOR UPDATE TO authenticated USING (company_id = get_user_company_id(auth.uid()));
CREATE POLICY "rate_master_delete" ON public.rate_master FOR DELETE TO authenticated USING (company_id = get_user_company_id(auth.uid()));

-- 5. suppliers
CREATE TABLE public.suppliers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  phone text,
  email text,
  address text,
  company_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "suppliers_select" ON public.suppliers FOR SELECT TO authenticated USING (company_id = get_user_company_id(auth.uid()));
CREATE POLICY "suppliers_insert" ON public.suppliers FOR INSERT TO authenticated WITH CHECK (company_id = get_user_company_id(auth.uid()));
CREATE POLICY "suppliers_update" ON public.suppliers FOR UPDATE TO authenticated USING (company_id = get_user_company_id(auth.uid()));
CREATE POLICY "suppliers_delete" ON public.suppliers FOR DELETE TO authenticated USING (company_id = get_user_company_id(auth.uid()));

-- 6. vendors
CREATE TABLE public.vendors (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  phone text,
  email text,
  address text,
  service_type text,
  company_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "vendors_select" ON public.vendors FOR SELECT TO authenticated USING (company_id = get_user_company_id(auth.uid()));
CREATE POLICY "vendors_insert" ON public.vendors FOR INSERT TO authenticated WITH CHECK (company_id = get_user_company_id(auth.uid()));
CREATE POLICY "vendors_update" ON public.vendors FOR UPDATE TO authenticated USING (company_id = get_user_company_id(auth.uid()));
CREATE POLICY "vendors_delete" ON public.vendors FOR DELETE TO authenticated USING (company_id = get_user_company_id(auth.uid()));

-- 7. trips
CREATE TABLE public.trips (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  origin text NOT NULL,
  destination text NOT NULL,
  driver_id uuid,
  vehicle_id uuid,
  customer_id uuid,
  route_id uuid,
  status text NOT NULL DEFAULT 'pending',
  departure_date timestamptz,
  arrival_date timestamptz,
  notes text,
  company_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "trips_select" ON public.trips FOR SELECT TO authenticated USING (company_id = get_user_company_id(auth.uid()));
CREATE POLICY "trips_insert" ON public.trips FOR INSERT TO authenticated WITH CHECK (company_id = get_user_company_id(auth.uid()));
CREATE POLICY "trips_update" ON public.trips FOR UPDATE TO authenticated USING (company_id = get_user_company_id(auth.uid()));
CREATE POLICY "trips_delete" ON public.trips FOR DELETE TO authenticated USING (company_id = get_user_company_id(auth.uid()));

-- 8. trip_expenses
CREATE TABLE public.trip_expenses (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id uuid,
  description text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  category text,
  expense_date timestamptz NOT NULL DEFAULT now(),
  company_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.trip_expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "trip_expenses_select" ON public.trip_expenses FOR SELECT TO authenticated USING (company_id = get_user_company_id(auth.uid()));
CREATE POLICY "trip_expenses_insert" ON public.trip_expenses FOR INSERT TO authenticated WITH CHECK (company_id = get_user_company_id(auth.uid()));
CREATE POLICY "trip_expenses_update" ON public.trip_expenses FOR UPDATE TO authenticated USING (company_id = get_user_company_id(auth.uid()));
CREATE POLICY "trip_expenses_delete" ON public.trip_expenses FOR DELETE TO authenticated USING (company_id = get_user_company_id(auth.uid()));

-- 9. invoices
CREATE TABLE public.invoices (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_number text,
  trip_id uuid,
  customer_id uuid,
  amount numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  due_date date,
  notes text,
  company_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "invoices_select" ON public.invoices FOR SELECT TO authenticated USING (company_id = get_user_company_id(auth.uid()));
CREATE POLICY "invoices_insert" ON public.invoices FOR INSERT TO authenticated WITH CHECK (company_id = get_user_company_id(auth.uid()));
CREATE POLICY "invoices_update" ON public.invoices FOR UPDATE TO authenticated USING (company_id = get_user_company_id(auth.uid()));
CREATE POLICY "invoices_delete" ON public.invoices FOR DELETE TO authenticated USING (company_id = get_user_company_id(auth.uid()));

-- 10. payment_table
CREATE TABLE public.payment_table (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id uuid,
  amount numeric NOT NULL DEFAULT 0,
  payment_date timestamptz NOT NULL DEFAULT now(),
  payment_method text,
  reference_number text,
  notes text,
  company_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.payment_table ENABLE ROW LEVEL SECURITY;
CREATE POLICY "payment_table_select" ON public.payment_table FOR SELECT TO authenticated USING (company_id = get_user_company_id(auth.uid()));
CREATE POLICY "payment_table_insert" ON public.payment_table FOR INSERT TO authenticated WITH CHECK (company_id = get_user_company_id(auth.uid()));
CREATE POLICY "payment_table_update" ON public.payment_table FOR UPDATE TO authenticated USING (company_id = get_user_company_id(auth.uid()));
CREATE POLICY "payment_table_delete" ON public.payment_table FOR DELETE TO authenticated USING (company_id = get_user_company_id(auth.uid()));

-- Also add missing RLS policies for existing tables
CREATE POLICY "Users can update their company customers" ON public.customers FOR UPDATE TO authenticated USING (company_id = get_user_company_id(auth.uid()));
CREATE POLICY "Users can delete their company customers" ON public.customers FOR DELETE TO authenticated USING (company_id = get_user_company_id(auth.uid()));
