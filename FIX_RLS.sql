-- Enable RLS on Order table if not already enabled
alter table "Order" enable row level security;

-- Drop existing policies if they exist to avoid conflicts
drop policy if exists "Enable read access for all users" on "Order";
drop policy if exists "Enable update for all users" on "Order";

-- Create policies
create policy "Enable read access for all users" on "Order" for select using (true);
create policy "Enable update for all users" on "Order" for update using (true);
