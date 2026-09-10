/*
# Add role-aware FasalFlux accounts

- Creates a profile row for each authenticated account.
- Roles are server-owned and default to farmer; they are not writable by the browser.
- Authenticated users can only read their own profile.
*/

CREATE TABLE IF NOT EXISTS public.fasalflux_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL DEFAULT 'FasalFlux user',
  role text NOT NULL DEFAULT 'farmer' CHECK (role IN ('farmer', 'mandi_official', 'admin')),
  mandi_name text NOT NULL DEFAULT 'Mandi Khandwa',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.fasalflux_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read their own profile" ON public.fasalflux_profiles;
CREATE POLICY "Users can read their own profile"
  ON public.fasalflux_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

REVOKE INSERT, UPDATE, DELETE ON public.fasalflux_profiles FROM authenticated;

CREATE OR REPLACE FUNCTION public.handle_fasalflux_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.fasalflux_profiles (id, display_name)
  VALUES (new.id, COALESCE(NULLIF(new.raw_user_meta_data->>'display_name', ''), split_part(new.email, '@', 1)));
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_fasalflux ON auth.users;
CREATE TRIGGER on_auth_user_created_fasalflux
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_fasalflux_new_user();
