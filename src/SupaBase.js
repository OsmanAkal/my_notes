import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  "https://narlnfgolqnfubmaysbo.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hcmxuZmdvbHFuZnVibWF5c2JvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4MjgzNzAsImV4cCI6MjA3OTQwNDM3MH0.0-rP0H9ZSFGfWN2pp7mEHhlE2ijzhoDWZ3kNxGTr4v0"
)

export default supabase;
