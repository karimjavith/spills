import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import {describe, it, expect, vi, beforeEach} from 'vitest'
import React from 'react';
import * as api from '../../api';
import { Provider } from 'react-redux';
import store from '../../store';
import TransactionList from './index';

vi.mock('../../api');

const mockTxs = [
  { feedItemUid: '1', amount: {minorUnits: 435, currency: 'GBP'}, reference: 'Coffee', transactionTime: '2026-01-01T10:00:00Z' },
  { feedItemUid: '2', amount: {minorUnits: 520, currency: 'GBP'}, reference: 'Groceries', transactionTime: '2026-01-02T12:00:00Z' }
];

function renderwithRedux(ui) {
  return render(<Provider store={store}>{ui}</Provider>);
}

describe('TransactionList', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('renders transactions and calculates round up', async () => {
    api.getTransactions.mockResolvedValue({ feedItems: mockTxs });
    renderwithRedux(<TransactionList accountUid="198-0923" categoryUid="200-220" />);
    const coffeeRows = await screen.findAllByText(/Coffee/);
    expect(coffeeRows.length).toBeGreaterThan(0);
    expect(await screen.findByText(/Groceries/)).toBeInTheDocument();
    expect(await screen.findByText(/Total amount available for round up: GBP1.45/)).toBeInTheDocument();

  });

  it('marks transactions as rounded up and persists', async () => {
    api.getTransactions.mockResolvedValue({ feedItems: mockTxs });
    renderwithRedux(<TransactionList accountUid="198-0923" categoryUid="200-220" />);
    await waitFor(() => expect(screen.getByText(/Total amount available for round up: GBP1.45/)).toBeInTheDocument());
    const transferButtons = await screen.findAllByRole('button', { name: /Transfer/i });
    fireEvent.click(transferButtons[0]);
    expect((await screen.findAllByText(/Total amount available for round up: GBP0.00/)).length).toBeGreaterThan(0);
    // Should persist in localStorage
    const ids = JSON.parse(localStorage.getItem('roundedUpTxIds'));
    expect(ids).toContain('1');
    expect(ids).toContain('2');

  });

  it('shows error on API failure', async () => {
    api.getTransactions.mockRejectedValue(new Error("{message: API is down}"));
    renderwithRedux(<TransactionList accountUid="198-0923" categoryUid="200-220" />);
    await waitFor(() => expect(screen.getByText(/Failed to fetch transactions/i)).toBeInTheDocument());
  });
});
