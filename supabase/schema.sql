-- Profiles
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  default_currency text default 'USD',
  created_at timestamptz default now()
);

-- Monthly Budget Periods
create table public.monthly_budgets (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  month_year text not null,           -- Format: "YYYY-MM"
  currency text not null,
  total_income decimal(15,2) default 0,
  total_expenses decimal(15,2) default 0,
  created_at timestamptz default now(),
  unique(user_id, month_year)
);

-- Incomes
create table public.incomes (
  id uuid default gen_random_uuid() primary key,
  monthly_budget_id uuid references public.monthly_budgets(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  source_name text not null,
  amount decimal(15,2) not null,
  currency text not null,
  date date not null,
  category text,
  note text
);

-- Expenses
create table public.expenses (
  id uuid default gen_random_uuid() primary key,
  monthly_budget_id uuid references public.monthly_budgets(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  amount decimal(15,2) not null,
  currency text not null,
  date date not null,
  category text not null,
  sub_category text,
  type text check (type in ('Need', 'Want', 'Other')),
  note text,
  payment_mode text
);

-- Savings Buckets
create table public.savings_buckets (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  target_amount decimal(15,2),
  current_amount decimal(15,2) default 0,
  currency text not null,
  target_date date,
  color text default '#3b82f6',
  icon text default 'PiggyBank'
);

-- Investments
create table public.investments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  type text not null, -- 'Crypto', 'Stock', 'Mutual Fund', 'Others'
  invested_amount decimal(15,2) not null,
  current_value decimal(15,2),
  currency text not null,
  purchase_date date,
  notes text
);

-- ENABLE ROW LEVEL SECURITY
alter table public.profiles enable row level security;
alter table public.monthly_budgets enable row level security;
alter table public.incomes enable row level security;
alter table public.expenses enable row level security;
alter table public.savings_buckets enable row level security;
alter table public.investments enable row level security;

-- POLICIES (Users can only access their own data)
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

create policy "Users can view own budgets" on public.monthly_budgets for select using (auth.uid() = user_id);
create policy "Users can insert own budgets" on public.monthly_budgets for insert with check (auth.uid() = user_id);
create policy "Users can update own budgets" on public.monthly_budgets for update using (auth.uid() = user_id);
create policy "Users can delete own budgets" on public.monthly_budgets for delete using (auth.uid() = user_id);

create policy "Users can view own incomes" on public.incomes for select using (auth.uid() = user_id);
create policy "Users can insert own incomes" on public.incomes for insert with check (auth.uid() = user_id);
create policy "Users can update own incomes" on public.incomes for update using (auth.uid() = user_id);
create policy "Users can delete own incomes" on public.incomes for delete using (auth.uid() = user_id);

create policy "Users can view own expenses" on public.expenses for select using (auth.uid() = user_id);
create policy "Users can insert own expenses" on public.expenses for insert with check (auth.uid() = user_id);
create policy "Users can update own expenses" on public.expenses for update using (auth.uid() = user_id);
create policy "Users can delete own expenses" on public.expenses for delete using (auth.uid() = user_id);

create policy "Users can view own savings" on public.savings_buckets for select using (auth.uid() = user_id);
create policy "Users can insert own savings" on public.savings_buckets for insert with check (auth.uid() = user_id);
create policy "Users can update own savings" on public.savings_buckets for update using (auth.uid() = user_id);
create policy "Users can delete own savings" on public.savings_buckets for delete using (auth.uid() = user_id);

create policy "Users can view own investments" on public.investments for select using (auth.uid() = user_id);
create policy "Users can insert own investments" on public.investments for insert with check (auth.uid() = user_id);
create policy "Users can update own investments" on public.investments for update using (auth.uid() = user_id);
create policy "Users can delete own investments" on public.investments for delete using (auth.uid() = user_id);

-- TRIGGER FOR NEW USER CREATION
-- Automatically creates a profile when a new user signs up in auth.users
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, default_currency)
  values (new.id, new.raw_user_meta_data->>'full_name', 'USD');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
