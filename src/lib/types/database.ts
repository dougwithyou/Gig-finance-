export type TransactionType = "income" | "expense";

export interface Transaction {
  id: string;
  user_id: string;
  type: TransactionType;
  amount: number;
  description: string;
  date: string;
  source_platform: string | null;
  category: string | null;
  created_at: string;
}

export interface FixedBill {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  due_day: number;
  is_active: boolean;
  created_at: string;
}

export interface BillPayment {
  id: string;
  fixed_bill_id: string;
  year: number;
  month: number;
  paid_at: string | null;
  transaction_id: string | null;
  created_at: string;
}

/** A fixed bill joined with its current-month payment status, for display. */
export interface FixedBillWithStatus extends FixedBill {
  payment: BillPayment | null;
  is_paid: boolean;
}

export interface WorkDayConfig {
  id: string;
  user_id: string;
  year: number;
  month: number;
  planned_work_days: number;
  created_at: string;
}

export type RecurringFrequency = "daily" | "weekly" | "biweekly";

export interface RecurringExpense {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  frequency: RecurringFrequency;
  is_active: boolean;
  created_at: string;
}

export type WorkedDaySource = "manual" | "inferred_from_income";

export interface WorkedDay {
  id: string;
  user_id: string;
  date: string;
  source: WorkedDaySource;
  created_at: string;
}

export interface PushSubscription {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  created_at: string;
}

export interface NotificationPreferences {
  id: string;
  user_id: string;
  daily_target_reminder_enabled: boolean;
  bill_due_alert_days_before: number;
  low_income_alert_enabled: boolean;
  low_income_alert_threshold_pct: number;
  created_at: string;
}
