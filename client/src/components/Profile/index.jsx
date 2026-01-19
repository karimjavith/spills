import React, { useEffect, useState } from 'react';
import { getAccounts } from '../../api';
import ProfileIcon from './ProfileIcon';

export default function Profile() {
  const [account, setAccount] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAccounts()
      .then(data => {
        if (data.accounts && data.accounts.length > 0) {
          setAccount(data.accounts[0]);
        } else {
          setError('No accounts found.');
        }
      })
      .catch(e => setError('Failed to fetch account: ' + e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading account...</div>;

  return (
    <>
      <ProfileIcon
        accountName={account?.name || 'Unknown'}
        accountType={account?.accountType}
      />
      {error && <div className="error">{error}</div>}
    </>
  );
}
