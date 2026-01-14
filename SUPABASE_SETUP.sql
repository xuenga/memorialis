-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Table: Product
create table if not exists "Product" (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text,
  category text default 'plaques',
  description text,
  long_description text,
  price numeric not null,
  image_url text,
  gallery text[], -- Array of image URLs
  material text,
  dimensions text,
  features text[],
  stock integer default 0,
  is_active boolean default true,
  created_at timestamp with time zone default now()
);

-- Table: Memorial
create table if not exists "Memorial" (
  id text primary key, -- Can be UUID or custom ID like 'm1'
  name text,
  birth_date date,
  death_date date,
  biography text,
  profile_photo text,
  cover_photo text,
  photos text[], -- Array of URLs
  videos jsonb, -- Array of video objects {url, title, thumbnail}
  allow_comments boolean default true,
  require_moderation boolean default true,
  qr_code_url text,
  access_code text,
  is_public boolean default false,
  theme text default 'classic',
  owner_email text,
  created_at timestamp with time zone default now()
);

-- Table: Tribute
create table if not exists "Tribute" (
  id uuid primary key default uuid_generate_v4(),
  memorial_id text references "Memorial"(id),
  author_name text,
  author_email text,
  message text,
  relationship text,
  is_approved boolean default false,
  is_featured boolean default false,
  created_at timestamp with time zone default now()
);

-- Table: Order
create table if not exists "Order" (
  id uuid primary key default uuid_generate_v4(),
  order_number text,
  customer_email text not null,
  customer_name text,
  customer_phone text,
  shipping_address jsonb, -- {street, city, postal_code, country}
  items jsonb, -- Array of items
  subtotal numeric,
  shipping_cost numeric,
  total numeric not null,
  status text default 'pending',
  memorial_id text,
  stripe_payment_id text,
  personalization jsonb,
  created_at timestamp with time zone default now()
);

-- Table: CartItem
create table if not exists "CartItem" (
  id uuid primary key default uuid_generate_v4(),
  session_id text not null,
  product_id text,
  product_name text,
  product_image text,
  material text,
  price numeric,
  quantity integer default 1,
  personalization jsonb,
  created_at timestamp with time zone default now()
);

-- Table: MemorialVisit (referenced in EditMemorial.tsx)
create table if not exists "MemorialVisit" (
  id uuid primary key default uuid_generate_v4(),
  memorial_id text references "Memorial"(id),
  visitor_ip text,
  visited_at timestamp with time zone default now()
);

-- Enable Row Level Security (RLS) - Optional for dev but recommended
alter table "Product" enable row level security;
alter table "Memorial" enable row level security;
alter table "Tribute" enable row level security;
alter table "Order" enable row level security;
alter table "CartItem" enable row level security;
alter table "MemorialVisit" enable row level security;

-- Policies (Public access for demo purposes - RESTRICT IN PRODUCTION)
create policy "Enable read access for all users" on "Product" for select using (true);
create policy "Enable insert for all users" on "Product" for insert with check (true);
create policy "Enable update for all users" on "Product" for update using (true);
create policy "Enable delete for all users" on "Product" for delete using (true);

create policy "Enable read access for all users" on "Memorial" for select using (true);
create policy "Enable insert for all users" on "Memorial" for insert with check (true);
create policy "Enable update for all users" on "Memorial" for update using (true);

create policy "Enable read access for all users" on "Tribute" for select using (true);
create policy "Enable insert for all users" on "Tribute" for insert with check (true);
create policy "Enable update for all users" on "Tribute" for update using (true);

create policy "Enable read access for all users" on "MemorialVisit" for select using (true);


