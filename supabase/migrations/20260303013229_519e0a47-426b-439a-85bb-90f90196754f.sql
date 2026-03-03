
CREATE TABLE public.vehicles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plate_number text NOT NULL,
  model text NOT NULL,
  capacity integer NOT NULL DEFAULT 1,
  is_available boolean NOT NULL DEFAULT true,
  company_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their company vehicles"
  ON public.vehicles FOR SELECT
  USING (company_id = public.get_user_company_id(auth.uid()));

CREATE POLICY "Users can insert vehicles for their company"
  ON public.vehicles FOR INSERT
  WITH CHECK (company_id = public.get_user_company_id(auth.uid()));

CREATE POLICY "Users can update their company vehicles"
  ON public.vehicles FOR UPDATE
  USING (company_id = public.get_user_company_id(auth.uid()));

CREATE POLICY "Users can delete their company vehicles"
  ON public.vehicles FOR DELETE
  USING (company_id = public.get_user_company_id(auth.uid()));
