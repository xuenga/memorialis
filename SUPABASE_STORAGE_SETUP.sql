-- Create the 'memorials' bucket if it doesn't exist
insert into storage.buckets (id, name, public)
values ('memorials', 'memorials', true)
on conflict (id) do nothing;

-- Create the 'products' bucket if it doesn't exist
insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do nothing;

-- Allow public access to read files
create policy "Public Access memorials" on storage.objects for select using ( bucket_id = 'memorials' );
create policy "Public Access products" on storage.objects for select using ( bucket_id = 'products' );

-- Allow anyone to upload files (Development mode)
create policy "Allow all on memorials bucket"
on storage.objects for all
using ( bucket_id = 'memorials' )
with check ( bucket_id = 'memorials' );

create policy "Allow all on products bucket"
on storage.objects for all
using ( bucket_id = 'products' )
with check ( bucket_id = 'products' );
