/*
# Create FasalFlux shared booking queue

1. New Tables
- `fasalflux_bookings`
- `id` (uuid, primary key)
- `farmer_name` (text, display name used by the prototype)
- `village` (text, farmer location)
- `crop` (text, crop being brought to the mandi)
- `quantity` (numeric, expected quantity in tonnes)
- `slot` (text, selected arrival window)
- `status` (text, current journey stage)
- `token` (text, public queue token)
- `priority` (text, queue priority)
- `payment_status` (text, payment state)
- `created_at` (timestamp)

2. Security
- Row-level security is enabled.
- The prototype intentionally uses a shared, no-sign-in workspace, so anonymous and authenticated visitors can read and update the demo queue.

3. Notes
- This table powers the live queue, farmer booking flow, mandi operator controls, and payment tracking in the hackathon prototype.
*/

CREATE TABLE IF NOT EXISTS public.fasalflux_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_name text NOT NULL,
  village text NOT NULL,
  crop text NOT NULL,
  quantity numeric NOT NULL CHECK (quantity > 0),
  slot text NOT NULL,
  status text NOT NULL DEFAULT 'booked',
  token text NOT NULL UNIQUE,
  priority text NOT NULL DEFAULT 'standard',
  payment_status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.fasalflux_bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read booking queue" ON public.fasalflux_bookings;
CREATE POLICY "Public can read booking queue"
  ON public.fasalflux_bookings FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Public can create bookings" ON public.fasalflux_bookings;
CREATE POLICY "Public can create bookings"
  ON public.fasalflux_bookings FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Public can update demo bookings" ON public.fasalflux_bookings;
CREATE POLICY "Public can update demo bookings"
  ON public.fasalflux_bookings FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Public can delete demo bookings" ON public.fasalflux_bookings;
CREATE POLICY "Public can delete demo bookings"
  ON public.fasalflux_bookings FOR DELETE
  TO anon, authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS fasalflux_bookings_status_idx ON public.fasalflux_bookings(status);
CREATE INDEX IF NOT EXISTS fasalflux_bookings_slot_idx ON public.fasalflux_bookings(slot);
