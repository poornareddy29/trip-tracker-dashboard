import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://cusfxuktiwddffpeodsm.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1c2Z4dWt0aXdkZGZmcGVvZHNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwODAzNjYsImV4cCI6MjA4NjY1NjM2Nn0.Kf7GzI8kgYJJr-86M9uTof4VV_uDBakOnoWj1jOmTjE";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
