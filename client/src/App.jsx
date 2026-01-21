import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Profile from './components/Profile';
import TransactionList from './components/Transactions';
import SavingsGoal from './components/Savings-goal';

import styles from './App.module.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getSavingsGoals } from './api';
import { setAccount } from './store/accountSlice';

/**
 * Main application component that renders the Spills app interface.
 * Displays a header with the app title and user controls (Savings Goal and Profile),
 * and conditionally renders the transaction list based on the selected account from Redux state.
 *
 * @returns {JSX.Element} The rendered app component
 */
export default function App() {
  const account = useSelector((state) => state.account.account);
  const dispatch = useDispatch();

  useEffect(() => {
    async function fetchSavingsGoal() {
      // This is to make sure that the savings goal is fetched on app load
      // and set in redux state for TransactionList/Transfer to access
      // Further Enhancement for futre: We can move this fetchSavingsGoal to a hook and that can be referred back to savings goal component as well
      if (account && !account.savingsGoal) {
        try {
          const data = await getSavingsGoals(account.accountUid);
          if (data.savingsGoalList && data.savingsGoalList.length > 0) {
            dispatch(
              setAccount({
                ...account,
                savingsGoal: data.savingsGoalList[0],
              }),
            );
          }
        } catch (e) {
          console.error('Failed to fetch savings goal on app load:', e);
        }
      }
    }
    fetchSavingsGoal();
  }, [account, dispatch]);

  return (
    <>
      <header className={styles.headerBar}>
        <span className={styles.title}>Spills</span>
        <div className={styles.rightIcons}>
          <SavingsGoal />
          <Profile />
        </div>
      </header>
      <main className={styles.body}>
        {account && (
          <TransactionList
            accountUid={account.accountUid}
            categoryUid={account.defaultCategory}
            savingsGoalUid={account.savingsGoal?.savingsGoalUid}
          />
        )}
      </main>
      <ToastContainer position="top-right" autoClose={4000} />
    </>
  );
}
