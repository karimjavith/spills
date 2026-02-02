import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import SavingsGoal from './index';
import { Provider } from 'react-redux';
import store from '../../store';
import * as api from '../../api';
import { ToastContainer } from 'react-toastify';

vi.mock('../../api');

const mockGoal = {
  name: 'Adventure Fund',
  savingsGoalUid: 'goal-123',
  totalSaved: 12345,
  target: 50000,
  currency: 'GBP',
};

function renderWithRedux(ui) {
  store.dispatch({
    type: 'account/setAccount',
    payload: { id: '198-200', name: 'Test Account', type: 'Primary' },
  });
  return render(
    <Provider store={store}>
      <>
        {ui}
        <ToastContainer />{' '}
      </>
    </Provider>,
  );
}

describe('SavingsGoal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows modal and existing savings goal', async () => {
    api.getSavingsGoals.mockResolvedValue([mockGoal]);
    renderWithRedux(<SavingsGoal />);
    fireEvent.click(screen.getByRole('button', { name: /savings-goal/i }));
    expect(await screen.findByText(/Adventure Fund/)).toBeInTheDocument();
    expect(screen.getByText(/123.45/)).toBeInTheDocument();
    expect(screen.getByText(/saved/)).toBeInTheDocument();
    expect(screen.getByText(/24.69% of target/)).toBeInTheDocument();
  });

  it('shows create goal UI if no goal exists and creates goal with amount', async () => {
    api.getSavingsGoals.mockResolvedValue({ savingsGoalList: [] });
    renderWithRedux(<SavingsGoal />);
    fireEvent.click(
      screen.getAllByRole('button', { name: /savings-goal/i })[0],
    );
    expect(
      await screen.findByText(/No savings goal found/),
    ).toBeInTheDocument();
    fireEvent.change(screen.getByTestId('goal-name'), {
      target: { value: 'Trip' },
    });
    fireEvent.change(screen.getByTestId('goal-amount'), {
      target: { value: '200' },
    });
    api.createSavingsGoal.mockResolvedValue({ savingsGoalUid: 'goal-456' });
    fireEvent.click(screen.getByTestId('create-goal'));
    expect(await screen.findByText(/Trip/)).toBeInTheDocument();
  });

  it('shows error toast if API fails', async () => {
    api.getSavingsGoals.mockRejectedValue(new Error('API is down'));
    renderWithRedux(<SavingsGoal />);
    fireEvent.click(
      screen.getAllByRole('button', { name: /savings-goal/i })[0],
    );
    expect(
      await screen.findByText(/Failed to fetch savings goal: API is down/),
    ).toBeInTheDocument();
  });
});
