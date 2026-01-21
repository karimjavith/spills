import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Provider } from 'react-redux';
import * as api from './api';
import App from './App';
import store from './store';

vi.mock('./api');
function renderWithRedux(ui) {
  store.dispatch({
    type: 'account/setAccount',
    payload: {
      accountUid: '198-200',
      name: 'Test Account',
      accountType: 'Primary',
    },
  });
  return render(<Provider store={store}>{ui}</Provider>);
}

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders profile icon and shows account info in modal', async () => {
    api.getAccounts.mockResolvedValue({
      accounts: [{ name: 'Test Account', accountType: 'Primary' }],
    });

    renderWithRedux(<App />);
    // Wait for profile icon to appear
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: /profile/i }),
      ).toBeInTheDocument(),
    );
    // Open modal
    screen.getByRole('button', { name: /profile/i }).click();
    expect(
      await screen.findByText(/Account Name: Test Account/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/Type: Primary/i)).toBeInTheDocument();
  });
});
