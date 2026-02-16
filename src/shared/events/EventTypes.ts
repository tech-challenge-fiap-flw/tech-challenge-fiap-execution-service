export const EventTypes = {
  REPAIR_STARTED: 'execution.repair-started',
  REPAIR_FINISHED: 'execution.repair-finished',
  DELIVERED: 'execution.delivered',

  OS_BUDGET_APPROVED: 'os.budget-approved',
  OS_STATUS_CHANGED: 'os.status-changed',

  PAYMENT_CONFIRMED: 'billing.payment-confirmed',
  PAYMENT_FAILED: 'billing.payment-failed',
} as const;
