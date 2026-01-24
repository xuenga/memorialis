-- Enable read access for all users on Order table
create policy "Enable read access for all users" on "Order" for select using (true);

-- Enable update access for all users on Order table
create policy "Enable update for all users" on "Order" for update using (true);
