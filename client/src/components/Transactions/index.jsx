import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useSelector, useDispatch } from 'react-redux';
import { markRoundedUp } from '../../store/roundedUpSlice';
import { getTransactions, transferToSavingsGoal } from '../../api';
import { getWeekRange } from '../../utils';

import styles from './index.module.css';

/**
 * Displays a list of transactions with date filtering,
 * round-up amount calculations, and functionality to transfer rounded-up amounts to a savings goal.
 *
 * @param {string} accountUid - The unique identifier of the account
 * @param {string} categoryUid - The unique identifier of the transaction category
 * @param {string} savingsGoalUid - The unique identifier of the savings goal for transfers
 * @returns {JSX.Element} The rendered transaction list component
 */
export default function TransactionList({
  accountUid,
  categoryUid,
  savingsGoalUid,
}) {
  const { startOfWeek: initialFrom, endOfWeek: initialTo } = getWeekRange(
    new Date(),
  );
  const [from, setFrom] = useState(initialFrom);
  const [to, setTo] = useState(initialTo);
  const [feed, setFeed] = useState([]);
  const [openId, setOpenId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const roundedUpIds = useSelector((state) => state.roundedUp.roundedUpTxIds);
  const dispatch = useDispatch();

  useEffect(() => {
    const ERROR_MESSAGES_TRANSLATE = {
      MIN_TIMESTAMP_MUST_BE_BEFORE_MAX_TIMESTAMP:
        'The "from" date must be before the "to" date.',
      'Failed to fetch': 'Server Error',
    };
    if (accountUid && categoryUid && from && to) {
      const isoFrom = new Date(from).toISOString();
      const isoTo = new Date(to).toISOString();
      getTransactions(accountUid, categoryUid, isoFrom, isoTo)
        .then((data) => {
          setFeed(data || []);
          setError('');
        })
        .catch((e) => {
          let errorMessage = '';
          try {
            errorMessage = JSON.parse(e.message)
              ? JSON.parse(e.message).message
              : e.message;
          } catch {
            errorMessage = e?.message || 'Unknown error';
          }
          setError(
            'Failed to fetch transactions: ' +
              (ERROR_MESSAGES_TRANSLATE[errorMessage] || errorMessage),
          );
        })
        .finally(() => setLoading(false));
    }
  }, [accountUid, categoryUid, from, to]);

  function handleRoundUp() {
    const newIds = [
      ...roundedUpIds,
      ...feed.transactions
        .filter((tx) => !roundedUpIds.includes(tx.feedItemUid))
        .map((tx) => tx.feedItemUid),
    ];
    dispatch(markRoundedUp(newIds));
  }

  const handleTransfer = async () => {
    if (!savingsGoalUid) {
      toast.error('No savings goal found. Please create one first.');
      return;
    }
    try {
      setLoading(true);
      await transferToSavingsGoal(
        accountUid,
        savingsGoalUid,
        feed.totalRoundUp,
        feed.currency,
      );
      handleRoundUp(); // Mark as rounded up in Redux/localStorage
      toast.success('Successfully transferred to savings goal!');
    } catch (e) {
      toast.error('Failed to transfer to savings goal: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  // When user picks a date:
  function handleDateChange(date) {
    const { startOfWeek, endOfWeek } = getWeekRange(date);
    setFrom(startOfWeek);
    setTo(endOfWeek);
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.headerRow}>
        <span className={styles.title}>Transactions</span>
        <div className={styles.filters}>
          <label>
            Pick a date to get transaction for a given week
            <input
              type="date"
              className={styles.datePickerInput}
              value={from || ''}
              onChange={(e) => handleDateChange(e.target.value)}
            />
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
        {!loading && !error && feed.transactions.length === 0 && (
          <div className={styles.centeredError}>
            <span className={styles.errorIcon}>📭</span>
            No transactions found for this period.
          </div>
        )}
        {!loading && !error && feed.transactions.length > 0 && (
          <>
            <ul className={styles.list}>
              {feed.transactions.map((tx) => (
                <li key={tx.feedItemUid} className={styles.item}>
                  <button
                    className={styles.accordionBtn}
                    onClick={() =>
                      setOpenId(
                        openId === tx.feedItemUid ? null : tx.feedItemUid,
                      )
                    }
                    aria-label="expand"
                  >
                    <span>
                      {tx.counterPartyName ||
                        tx.reference ||
                        tx.spendingCategory}{' '}
                      - {tx.amount.currency}
                      {(tx.amount.minorUnits / 100).toFixed(2)}
                      {roundedUpIds.includes(tx.feedItemUid) && (
                        <span className={styles.roundedUp}>(Rounded Up)</span>
                      )}
                    </span>
                    <span>{openId === tx.feedItemUid ? '▲' : '▼'}</span>
                  </button>
                  {openId === tx.feedItemUid && (
                    <div className={styles.details}>
                      <div>
                        <strong>Date:</strong>{' '}
                        {new Date(tx.transactionTime).toLocaleString()}
                      </div>
                      <div>
                        <strong>Description:</strong> {tx.reference}
                      </div>
                      <div>
                        <strong>Rounded Up Amount:</strong> £{tx.roundUp}
                      </div>
                      {roundedUpIds.includes(tx.feedItemUid) && (
                        <div className={styles.roundedUp}>
                          This transaction has been rounded up.
                        </div>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
            <div className={styles.footerRow}>
              <div className={styles.sum}>
                <span>
                  Total amount available for round up: {feed.currency}
                  {feed.totalRoundUp}
                </span>
              </div>
              {feed.transactions.filter(
                (tx) => !roundedUpIds.includes(tx.feedItemUid),
              ).length > 0 && (
                <>
                  <button
                    className={styles.roundBtn}
                    onClick={handleTransfer}
                    disabled={feed.totalRoundUp === 0}
                  >
                    Transfer to Savings Goal
                  </button>
                </>
              )}{' '}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
