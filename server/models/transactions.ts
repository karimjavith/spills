export type Transaction = {
  transactionAmount: {
    minorUnits: number;
    currency: string;
  };
  transactionTime: string;
  transactionStatus: string;
  transactionId: string;
  transactionSpendingCategory?: string;
  transactionDirection: 'IN' | 'OUT';
  transactionReference?: string;
  transactionCounterPartyName?: string;
  transactionSource?: string;
};
