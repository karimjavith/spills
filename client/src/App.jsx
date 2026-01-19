import React from 'react';
import Profile from './components/Profile';
import styles from './App.module.css';

export default function App() {
  return (
    <>
     <header className={styles.headerBar}>
        <span className={styles.title}>Spills</span>
        <Profile />
      </header>
      <main className={styles.body}>
        {/* Main content goes here */}
      </main>
    </>
  );
}
