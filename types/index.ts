export type ExpenseType = 'Need' | 'Want' | 'Other'

export interface Profile {
  id: string
  full_name: string | null
  default_currency: string
  created_at: string
}

export interface MonthlyBudget {
  id: string
  user_id: string
  month_year: string
  currency: string
  total_income: number
  total_expenses: number
  created_at: string
}

export interface Expense {
  id: string
  monthly_budget_id: string
  user_id: string
  amount: number
  currency: string
  converted_amount: number | null
  converted_currency: string | null
  fx_rate: number | null
  fx_date: string | null
  date: string
  category: string
  sub_category: string | null
  type: ExpenseType
  note: string | null
  payment_mode: string | null
}

export interface Income {
  id: string
  monthly_budget_id: string
  user_id: string
  source_name: string
  amount: number
  currency: string
  converted_amount: number | null
  converted_currency: string | null
  fx_rate: number | null
  fx_date: string | null
  date: string
  category: string | null
  note: string | null
}

export const EXPENSE_CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Housing',
  'Utilities',
  'Shopping',
  'Entertainment',
  'Health & Fitness',
  'Education',
  'Travel',
  'Personal Care',
  'Subscriptions',
  'Insurance',
  'Other',
] as const

export const INCOME_CATEGORIES = [
  'Salary',
  'Freelance',
  'Crypto Profit',
  'Staking Rewards',
  'Investments',
  'Business',
  'Other',
] as const

export const PAYMENT_MODES = [
  'Cash',
  'Credit Card',
  'Debit Card',
  'Bank Transfer',
  'UPI',
  'Crypto',
  'Other',
] as const

export const SUPPORTED_CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'USDT', symbol: '₮', name: 'Tether USD' },
  { code: 'USDC', symbol: '$', name: 'USD Coin' },
] as const
