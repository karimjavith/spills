import React, { useState } from 'react';
import styles from './ProfileIcon.module.css';
import modalStyles from './ProfileModal.module.css';

// Profile modal contains account details and preferences.
// Here I marked it as ON by default and disabled. In actual prod,
// I would like this be managed via API and user settings.
function ProfileModal({ open, onClose, accountName, accountType }) {
  if (!open) return null;
  return (
    <div className={modalStyles.backdrop} role="dialog" aria-modal="true">
      <div className={modalStyles.modalCard}>
        <span className={modalStyles.avatar}>Profile 👤</span>
        <div className={modalStyles.headerRow}>
          <span className={modalStyles.accountName}>
            Account name: {accountName || 'Account Name'}
          </span>
          <span className={modalStyles.accountType}>
            Type: {accountType || 'Personal'}
          </span>
        </div>
        <div className={modalStyles.preference}>
          <p>Preferences</p>
          <ul className={modalStyles.prefList}>
            <li className={modalStyles.prefItem}>
              <label className={modalStyles['toggle-switch']}>
                <input
                  type="checkbox"
                  checked
                  disabled
                  aria-label="Savings Goal"
                />
                <span className={modalStyles['toggle-slider']}></span>
              </label>
              <span>Savings Goal</span>
            </li>
            <li className={modalStyles.prefItem}>
              <label className={modalStyles['toggle-switch']}>
                <input type="checkbox" checked disabled aria-label="Round Up" />
                <span className={modalStyles['toggle-slider']}></span>
              </label>
              <span>Round Up</span>
            </li>
          </ul>
        </div>

        <button
          className={modalStyles.closeBtn}
          onClick={onClose}
          aria-label="close"
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default function ProfileIcon({ accountName, accountType }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        aria-label="profile"
        className={styles['profile-btn']}
        onClick={() => setOpen(true)}
      >
        👤
        <p className={styles.iconname}>Profile</p>
      </button>
      <ProfileModal
        open={open}
        onClose={() => setOpen(false)}
        accountName={accountName}
        accountType={accountType}
      />
    </>
  );
}
