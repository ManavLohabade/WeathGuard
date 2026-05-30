-- Add FX conversion columns to incomes and expenses
alter table public.incomes
  add column if not exists converted_amount decimal(15,2),
  add column if not exists converted_currency text,
  add column if not exists fx_rate decimal(18,8),
  add column if not exists fx_date date;

alter table public.expenses
  add column if not exists converted_amount decimal(15,2),
  add column if not exists converted_currency text,
  add column if not exists fx_rate decimal(18,8),
  add column if not exists fx_date date;
