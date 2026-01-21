import React, { useEffect, useState } from 'react';
import { getAccounts } from '../../api';
import ProfileIcon from './ProfileIcon';
import { useDispatch, useSelector } from 'react-redux';
import { setAccount } from '../../store/accountSlice';

/**
 * Fetches the user's accounts on mount, selects the first account,
 * and dispatches it to the Redux store. Renders a profile icon displaying account information.
 *
 * @returns {JSX.Element} The rendered profile component
 */
export default function Profile() {
  const dispatch = useDispatch();
  const account = useSelector((state) => state.account.account);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAccounts()
      .then((data) => {
        if (data && data.length > 0) {
          dispatch(setAccount(data[0])); // This is intentional for this testing/demo app. We can fetch multiple accounts later if required.
        } else {
          console.log('No accounts found in response:', data);
        }
      })
      .catch((e) => {
        setError('Failed to fetch account: ' + e.message);
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
