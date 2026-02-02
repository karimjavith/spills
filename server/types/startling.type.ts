// services/starling.types.ts

export type IsoDateTime = string;

export interface StarlingAmount {
  currency: string;
  minorUnits: number;
}

export interface StarlingAccount {
  accountUid: string;
  name?: string;
  defaultCategory: string;
  currency?: string;
  accountType: string;
}

export interface StarlingFeedItem {
  feedItemUid: string;
  direction: 'IN' | 'OUT';
  status: string;
  counterPartyName?: string;
  reference?: string;
  spendingCategory?: string;
  amount: StarlingAmount;
  transactionTime?: IsoDateTime;
  source?: string;
}

export interface StarlingSavingsGoal {
  savingsGoalUid: string;
  name: string;
  state?: string;
  target?: StarlingAmount;
  totalSaved?: StarlingAmount;
}

export interface StarlingAccountsResponse {
  accounts: StarlingAccount[];
}

export interface StarlingFeedResponse {
  feedItems: StarlingFeedItem[];
}

export interface StarlingSavingsGoalsResponse {
  savingsGoalList: StarlingSavingsGoal[];
}

export interface StarlingCreateSavingsGoalResponse {
  savingsGoalUid: string;
  success?: boolean;
  errors?: unknown[];
}

export interface StarlingTransferResponse {
  transferUid?: string;
  success?: boolean;
  errors?: unknown[];
}

// OAuth token refresh response
export interface StarlingTokenResponse {
  access_token: string;
  refresh_token?: string;
  token_type?: string;
  expires_in?: number;
}
