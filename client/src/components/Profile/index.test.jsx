import { render, screen, waitFor } from '@testing-library/react';
import {describe, it, expect, vi} from 'vitest'
import React from 'react';
import * as api from '../../api';
import Profile from './index';

vi.mock('../../api');

describe('Profile', () => {
  it('renders profile icon with account info', async () => {
    await api.getAccounts.mockResolvedValue({ accounts: [{ name: 'Test Account', accountType: 'Primary' }] });
    render(<Profile />);
    await waitFor(() => expect(screen.getByRole('button', { name: /profile/i })).toBeInTheDocument());
    screen.getByRole('button', { name: /profile/i }).click();
    expect(await screen.findByText(/Account Name: Test Account/i)).toBeInTheDocument();
    expect(screen.getByText(/Type: Primary/i)).toBeInTheDocument();
  });

  it('shows error if no accounts', async () => {
    api.getAccounts.mockResolvedValue({ accounts: [] });
    render(<Profile />);
    await waitFor(() => expect(screen.getByText(/No accounts found/i)).toBeInTheDocument());
  });

  it('shows error on API failure', async () => {
    api.getAccounts.mockRejectedValue(new Error('API is down'));
    render(<Profile />);
    await waitFor(() => expect(screen.getByText(/Failed to fetch account/i)).toBeInTheDocument());
  });
});
