import React, { useEffect, useState } from 'react';
import { getAccounts } from '../../api';
import ProfileIcon from './ProfileIcon';
import { useDispatch, useSelector } from 'react-redux';
import { setAccount } from '../../store/accountSlice';


export default function Profile() {
  const dispatch = useDispatch();
  const account = useSelector((state) => state.account.account);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAccounts()
      .then(data => {
        if (data.accounts && data.accounts.length > 0) {
          dispatch(setAccount(data.accounts[0]));
        } else {
          console.log('No accounts found in response:', data);
        }
      })
      .catch((e) => {
        setError('Failed to fetch account: ' + e.message)
        console.error('Error fetching accounts:', e);
      })
      .finally(() => setLoading(false));
  }, [dispatch]);

  if (loading) return <div className="loading">...</div>;

  return (
    <>
      <ProfileIcon
        accountName={account?.name || 'Unknown'}
        accountType={account?.accountType}
      />
      {error && <div className="error">⚠️</div>}
    </>
  );
}
