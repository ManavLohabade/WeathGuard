-- Create FX Rates Cache Table
create table public.fx_rates (
  id uuid default gen_random_uuid() primary key,
  date date not null,
  base_currency text not null,
  rates jsonb not null,
  created_at timestamptz default now(),
  unique(date, base_currency)
);

-- Enable RLS
alter table public.fx_rates enable row level security;

-- Policies for Authenticated Users
create policy "Allow authenticated read to fx_rates" on public.fx_rates
  for select to authenticated using (true);

create policy "Allow authenticated write to fx_rates" on public.fx_rates
  for insert to authenticated with check (true);
