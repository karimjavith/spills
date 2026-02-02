import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { getSavingsGoals, createSavingsGoal } from '../../api';
import styles from './SavingsGoal.module.css';
import { setAccount } from '../../store/accountSlice';

/**
 * Modal interface for viewing and creating savings goals.
 * Displays existing savings goals with progress bars, or allows creation of new goals.
 * Integrates with Redux to update the account state when goals are fetched or created.
 *
 * @returns {JSX.Element} The rendered savings goal component
 */
export default function SavingsGoal() {
  const dispatch = useDispatch();
  const account = useSelector((state) => state.account.account);
  const [open, setOpen] = useState(false);
  const [goal, setGoal] = useState(null);
  const [goalName, setGoalName] = useState('');
  const [goalAmount, setGoalAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleOpen = async () => {
    setOpen(true);
    setLoading(true);
    setError('');
    try {
      const data = await getSavingsGoals(account?.id || '');
      console.log('Fetched savings goals:', data);
      if (data && data.length > 0) {
        setGoal(data[0]);
        dispatch(
          setAccount({
            ...account,
            savingsGoal: data[0],
          }),
        );
      } else {
        setGoal(null);
      }
    } catch (e) {
      toast.error(`Failed to fetch savings goal: ${e.message || ''}`);
      setError('Failed to fetch savings goal');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    setLoading(true);
    setError('');
    try {
      const amountMinorUnits = Math.round(Number(goalAmount) * 100);
      const data = await createSavingsGoal(
        account.id,
        goalName,
        'GBP', // Hardcoded currency for simplicity, I would expect this to come from account settings as default currency
        amountMinorUnits,
      );
      setGoal({
        name: goalName,
        savingsGoalUid: data.savingsGoalUid,
        totalSaved: { minorUnits: 0, currency: 'GBP' },
        target: { minorUnits: amountMinorUnits, currency: 'GBP' },
      });
      // set the savings goal in redux state
      // This is needed so that TransactionList can access it
      dispatch(
        setAccount({
          ...account,
          savingsGoal: {
            name: goalName,
            savingsGoalUid: data.savingsGoalUid,
            totalSaved: { minorUnits: 0, currency: 'GBP' },
            target: { minorUnits: amountMinorUnits, currency: 'GBP' },
          },
        }),
      );
      toast.success('Savings goal created successfully!');
    } catch (e) {
      toast.error(`Failed to create savings goal: ${e.message}`);
      setError('Failed to create savings goal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        aria-label="savings-goal"
        className={styles.iconBtn}
        onClick={handleOpen}
        title="Savings Goal"
      >
        💰
        <span className={styles.iconname}>Savings Goal</span>
      </button>
      {open && (
        <div className={styles.backdrop} role="dialog" aria-modal="true">
          <div className={styles.modalCard}>
            <span className={styles.avatar}>Savings Goal 💰</span>
            {loading && <div>Loading...</div>}
            {!loading && !error && !goal && (
              <>
                <div style={{ marginBottom: 12 }}>No savings goal found.</div>
                <input
                  type="text"
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  placeholder="Goal Name"
                  className={styles.input}
                  data-testid="goal-name"
                />
                <input
                  type="number"
                  value={goalAmount}
                  onChange={(e) => setGoalAmount(e.target.value)}
                  placeholder="Goal Amount (£)"
                  className={styles.input}
                  data-testid="goal-amount"
                  min="0"
                  step="0.01"
                />
                <button
                  className={styles.createBtn}
                  onClick={handleCreate}
                  disabled={
                    !goalName ||
                    !goalAmount ||
                    isNaN(Number(goalAmount)) ||
                    Number(goalAmount) <= 0
                  }
                  data-testid="create-goal"
                >
                  Create Savings Goal
                </button>
              </>
            )}
            {!loading && !error && goal && (
              <>
                <div className={styles.goalName}>{goal.name}</div>
                <div className={styles.savingsRow}>
                  <span className={styles.savingsAmount}>
                    {((goal.totalSaved || 0) / 100).toFixed(2)}
                  </span>
                  <span className={styles.savingsLabel}>saved</span>
                  <span className={styles.targetAmount}>
                    {goal.target
                      ? `of ${goal.currency} ${(goal.target / 100).toFixed(2)} target`
                      : 'No target set'}
                  </span>
                </div>
                <div className={styles.progressBarWrapper}>
                  <div className={styles.progressBarBg}>
                    <div
                      className={styles.progressBarFill}
                      style={{
                        width: `${Math.min(
                          100,
                          ((goal.totalSaved || 0) / (goal.target || 1)) * 100,
                        )}%`,
                      }}
                    />
                  </div>
                  <span className={styles.progressLabel}>
                    {goal.target
                      ? `${Math.min(
                          100,
                          ((goal.totalSaved || 0) / (goal.target || 1)) * 100,
                        ).toFixed(2)}% of target`
                      : ''}
                  </span>
                </div>
              </>
            )}
            <button
              className={styles.closeBtn}
              onClick={() => setOpen(false)}
              aria-label="close"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
