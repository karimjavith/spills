export type SavingsGoal = {
  id: string;
  name: string;
  currency: string | undefined;
  target: number;
  totalSaved: number;
};
