import { render, screen, waitFor } from '@testing-library/react';
import {describe, it, expect, vi, beforeEach} from 'vitest'
import React from 'react';
import * as api from './api';
import App from './App';

vi.mock('./api');

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders profile icon and shows account info in modal', async () => {
    api.getAccounts.mockResolvedValue({ accounts: [{ name: 'Test Account', accountType: 'Primary' }] });
    render(<App />);
    // Wait for profile icon to appear
    await waitFor(() => expect(screen.getByRole('button', { name: /profile/i })).toBeInTheDocument());
    // Open modal
    screen.getByRole('button', { name: /profile/i }).click();
    expect(await screen.findByText(/Account Name: Test Account/i)).toBeInTheDocument();
    expect(screen.getByText(/Type: Primary/i)).toBeInTheDocument();
  });

  it('shows error if no accounts', async () => {
    api.getAccounts.mockResolvedValue({ accounts: [] });
    render(<App />);
    await waitFor(() => expect(screen.getByText(/No accounts found/i)).toBeInTheDocument());
  });

  it('shows error on API failure', async () => {
    api.getAccounts.mockRejectedValue(new Error('API is down'));
    render(<App />);
    await waitFor(() => expect(screen.getByText(/Failed to fetch account/i)).toBeInTheDocument());
  });
});
