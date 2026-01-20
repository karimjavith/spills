import React from 'react';
import Profile from './components/Profile';
import TransactionList from './components/Transactions';
import { Provider, useSelector } from 'react-redux';

import styles from './App.module.css';

export default function App() {

  const account = useSelector((state) => state.account.account);


  return (
    <>
      <header className={styles.headerBar}>
        <span className={styles.title}>Spills</span>
        <Profile />
      </header>
      <main className={styles.body}>
        {account && (
          <TransactionList
            accountUid={account.accountUid}
            categoryUid={account.defaultCategory}
          />
        )}
      </main>
    </>
  );
}
