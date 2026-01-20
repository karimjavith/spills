import React from 'react';
import { Provider, useSelector } from 'react-redux';
import Profile from './components/Profile';
import TransactionList from './components/Transactions';
import SavingsGoal from './components/Savings-goal';

import styles from './App.module.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

/**
 * Main application component that renders the Spills app interface.
 * Displays a header with the app title and user controls (Savings Goal and Profile),
 * and conditionally renders the transaction list based on the selected account from Redux state.
 *
 * @returns {JSX.Element} The rendered app component
 */
export default function App() {
  const account = useSelector((state) => state.account.account);

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
