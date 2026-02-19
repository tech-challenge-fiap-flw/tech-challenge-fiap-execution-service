import { EventTypes } from '../EventTypes';

describe('EventTypes', () => {
  it('should have all expected event types', () => {
    expect(EventTypes.REPAIR_STARTED).toBe('execution.repair-started');
    expect(EventTypes.REPAIR_FINISHED).toBe('execution.repair-finished');
    expect(EventTypes.DELIVERED).toBe('execution.delivered');
    expect(EventTypes.OS_BUDGET_APPROVED).toBe('os.budget-approved');
    expect(EventTypes.OS_STATUS_CHANGED).toBe('os.status-changed');
    expect(EventTypes.PAYMENT_CONFIRMED).toBe('billing.payment-confirmed');
    expect(EventTypes.PAYMENT_FAILED).toBe('billing.payment-failed');
  });
});
