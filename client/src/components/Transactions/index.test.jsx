import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import * as api from '../../api';
import { Provider } from 'react-redux';
import store from '../../store';
import { resetRoundedUp } from '../../store/roundedUpSlice';
import TransactionList from './index';
import { ToastContainer } from 'react-toastify';

vi.mock('../../api');

const mockTxs = {
  currency: 'GBP',
  totalRoundUp: 1.45,
  transactions: [
    {
      feedItemUid: '1',
      amount: { minorUnits: 435, currency: 'GBP' },
      reference: 'Coffee',
      transactionTime: '2026-01-01T10:00:00Z',
    },
    {
      feedItemUid: '2',
      amount: { minorUnits: 520, currency: 'GBP' },
      reference: 'Groceries',
      transactionTime: '2026-01-02T12:00:00Z',
    },
  ],
};

function renderwithRedux(ui) {
  return render(
    <Provider store={store}>
      <>
        {ui}
        <ToastContainer />
      </>
    </Provider>,
  );
}

describe('TransactionList', () => {
  beforeEach(() => {
    store.dispatch(resetRoundedUp());
    vi.clearAllMocks();
  });

  it('renders transactions and calculates round up', async () => {
    api.getTransactions.mockResolvedValue(mockTxs);
    renderwithRedux(
      <TransactionList
        accountUid="198-0923"
        categoryUid="200-220"
        savingsGoalUid="200-201"
      />,
    );
    const coffeeRows = await screen.findAllByText(/Coffee/);
    expect(coffeeRows.length).toBeGreaterThan(0);
    expect(await screen.findByText(/Groceries/)).toBeInTheDocument();
    expect(
      await screen.findByText(/Total amount available for round up: GBP1.45/),
    ).toBeInTheDocument();
  });

  it('marks transactions as rounded up after submitting for transfer to savings goal', async () => {
    api.getTransactions.mockResolvedValue(mockTxs);
    renderwithRedux(
      <TransactionList
        accountUid="198-0923"
        categoryUid="200-220"
        savingsGoalUid="200-201"
      />,
    );
    await waitFor(() =>
      expect(
        screen.getByText(/Total amount available for round up: GBP1.45/),
      ).toBeInTheDocument(),
    );
    const transferButton = await screen.findAllByRole('button', {
      name: /Transfer to Savings Goal/i,
    });
    // click the Transfer button
    fireEvent.click(transferButton[0]);

    // Wait for the toast to appear
    expect(
      await screen.findByText(/Successfully transferred to savings goal!/),
    ).toBeInTheDocument();
  });

  it('shows toast error if transfer fails', async () => {
    api.getTransactions.mockResolvedValue(mockTxs);
    api.transferToSavingsGoal.mockRejectedValue(new Error('API is down'));

    renderwithRedux(
      <TransactionList
        accountUid="198-0923"
        categoryUid="200-220"
        savingsGoalUid="goal-1"
      />,
    );
    await screen.findAllByText(/Total amount available for round up:/);

    // Click the Transfer button
    const transferButtons = await screen.findAllByRole('button', {
      name: /Transfer to Savings Goal/i,
    });
    fireEvent.click(transferButtons[0]);

    // Wait for the toast to appear
    expect(
      await screen.findByText(/Failed to transfer to savings goal/i),
    ).toBeInTheDocument();
  });

  it('shows error on API failure', async () => {
    api.getTransactions.mockRejectedValue(new Error('{message: API is down}'));
    renderwithRedux(
      <TransactionList accountUid="198-0923" categoryUid="200-220" />,
    );
    await waitFor(() =>
      expect(
        screen.getByText(/Failed to fetch transactions/i),
      ).toBeInTheDocument(),
    );
  });
});
