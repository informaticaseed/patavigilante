INSERT INTO public.user_roles (user_id, role)
VALUES ('214c8cba-fd4e-49e7-97a3-91803c1591f8'::uuid, 'admin'::app_role)
ON CONFLICT (user_id, role) DO NOTHING;