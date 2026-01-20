
import { render, screen, waitFor } from '@testing-library/react';
import {describe, it, expect, vi} from 'vitest'
import { Provider } from 'react-redux';
import React from 'react';
import * as api from '../../api';
import Profile from './index';
import store from '../../store';

vi.mock('../../api');
function renderWithRedux(ui) {
  return render(<Provider store={store}>{ui}</Provider>);
}

describe('Profile', () => {
  it.skip('renders profile icon with account info', async () => {
    await api.getAccounts.mockResolvedValue({ accounts: [{ name: 'Test Account', accountType: 'Personal', accountUid: '12345' }] });
    renderWithRedux(<Profile />);
    await waitFor(() => expect(screen.queryByText(/.../i)).not.toBeInTheDocument());
    await waitFor(() => expect(screen.getByRole('button', { name: /profile/i })).toBeInTheDocument());
    screen.getByRole('button', { name: /profile/i }).click();
    expect(await screen.findByText(/Account Name: Test Account/i)).toBeInTheDocument();
    expect(screen.getByText(/Type: Personal/i)).toBeInTheDocument();
  });

  it('shows error on API failure', async () => {
    api.getAccounts.mockRejectedValue(new Error('API is down'));
    renderWithRedux(<Profile />);
    await waitFor(() => expect(screen.getByText(/⚠️/i)).toBeInTheDocument());
  });
});
