import React, { useState, useEffect } from 'react';
import { getTransactions } from '../../api';
import { useSelector, useDispatch } from 'react-redux';
import { markRoundedUp } from '../../store/roundedUpSlice';

import styles from './index.module.css';

function roundUp(amount) {
  const val = Math.abs(amount / 100);
  const rounded = Math.ceil(val) - val;
  return rounded === 1 ? 0 : rounded;
}


export default function TransactionList({ accountUid, categoryUid }) {
  const [from, setFrom] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().slice(0, 10);
  });
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10));
  const [transactions, setTransactions] = useState([]);
  const [openId, setOpenId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const roundedUpIds = useSelector(state => state.roundedUp.roundedUpTxIds);
  const dispatch = useDispatch();

  useEffect(() => {

    const ERROR_MESSAGES_TRANSLATE = {'MIN_TIMESTAMP_MUST_BE_BEFORE_MAX_TIMESTAMP': 'The "from" date must be before the "to" date.'};
    if (accountUid && categoryUid && from && to) {
      const isoFrom = new Date(from).toISOString();
      const isoTo = new Date(to).toISOString();
      getTransactions(accountUid, categoryUid, isoFrom, isoTo)
        .then((data) =>  {setTransactions(data.feedItems || []); setError('');})
        .catch((e) => {
          let errorMessage = '';
          try {
           errorMessage = JSON.parse(e.message) ? JSON.parse(e.message).errors[0].message : e.message;
          }
          catch {
             errorMessage = e.message;
          }
          setError('Failed to fetch transactions: ' + ERROR_MESSAGES_TRANSLATE[errorMessage] || errorMessage);
        })
        .finally(() => setLoading(false));
    }
  }, [accountUid, categoryUid, from, to]);
  const roundUpSum = {
    amount: transactions
    .filter(tx => !roundedUpIds.includes(tx.feedItemUid))
    .reduce((sum, tx) => sum + roundUp(tx.amount.minorUnits), 0),
    currency: transactions[0]?.amount.currency || 'GBP'
  }

  function handleRoundUp() {
    const newIds = [
      ...roundedUpIds,
      ...transactions.filter(tx => !roundedUpIds.includes(tx.feedItemUid)).map(tx => tx.feedItemUid)
    ];
    dispatch(markRoundedUp(newIds));
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.headerRow}>
        <span className={styles.title}>Transactions</span>
        <div className={styles.filters}>
          <label>
            From
            <input type="date" value={from} onChange={e => setFrom(e.target.value)} />
          </label>
          <label>
            To
            <input type="date" value={to} onChange={e => setTo(e.target.value)} />
          </label>
        </div>
      </div>
      <div className={styles.listHolder}>
        {loading && (
          <div className={styles.centeredError}>
            <span className={styles.errorIcon}>⏳</span>
            Loading transactions...
          </div>
        )}
        {error && (
          <div className={styles.centeredError}>
            <span className={styles.errorIcon}>❌</span>
            {error}
          </div>
        )}
        {!loading && !error && transactions.length === 0 && (
          <div className={styles.centeredError}>
            <span className={styles.errorIcon}>📭</span>
            No transactions found for this period.
          </div>
        )}
        {!loading && !error && transactions.length > 0 && (
          <><ul className={styles.list}>
          {transactions.map(tx => (
            <li key={tx.feedItemUid} className={styles.item}>
              <button
                className={styles.accordionBtn}
                onClick={() => setOpenId(openId === tx.feedItemUid ? null : tx.feedItemUid)}
                aria-label="expand"
              >
                <span>
                  {tx.counterPartyName || tx.reference || tx.spendingCategory} - {tx.amount.currency}{(tx.amount.minorUnits / 100).toFixed(2)}
                  {roundedUpIds.includes(tx.feedItemUid) && (
                    <span className={styles.roundedUp}>(Rounded Up)</span>
                  )}
                </span>
                <span>{openId === tx.feedItemUid ? '▲' : '▼'}</span>
              </button>
              {openId === tx.feedItemUid && (
                <div className={styles.details}>
                  <div><strong>Date:</strong> {new Date(tx.transactionTime).toLocaleString()}</div>
                  <div><strong>Description:</strong> {tx.reference}</div>
                  <div><strong>Rounded Up Amount:</strong> £{roundUp(tx.amount.minorUnits).toFixed(2)}</div>
                  {roundedUpIds.includes(tx.feedItemUid) && (
                    <div className={styles.roundedUp}>This transaction has been rounded up.</div>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
        <div className={styles.footerRow}>
           <div className={styles.sum}>
          <span>Total amount available for round up: {roundUpSum.currency}{(roundUpSum.amount).toFixed(2)}</span>
        </div>
        {roundUpSum.amount > 0 && (<><button
          className={styles.roundBtn}
          onClick={handleRoundUp}
          disabled={roundUpSum === 0}
        >
          Transfer
        </button></>)}        </div>
       </>
        )}
      </div>
    </div>
  );
}
