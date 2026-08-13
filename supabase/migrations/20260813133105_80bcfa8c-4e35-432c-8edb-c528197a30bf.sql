ALTER TABLE public.reports
  ADD COLUMN forwarded_at timestamptz,
  ADD COLUMN forwarded_note text;