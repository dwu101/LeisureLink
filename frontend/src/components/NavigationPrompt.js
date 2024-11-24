// Create a new component in your components folder called NavigationPrompt.js
import React from 'react';

const NavigationPrompt = ({ when, message, onOK, onCancel }) => {
  const handleWindowClose = (e) => {
    if (when) {
      e.preventDefault();
      e.returnValue = message;
      return message;
    }
  };

  React.useEffect(() => {
    if (when) {
      window.addEventListener('beforeunload', handleWindowClose);
      return () => {
        window.removeEventListener('beforeunload', handleWindowClose);
      };
    }
  }, [when, message]);

  return (
    when && (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <div
          style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            maxWidth: '400px',
            width: '90%'
          }}
        >
          <h3 style={{ marginBottom: '15px' }}>Unsaved Changes</h3>
          <p style={{ marginBottom: '20px' }}>{message}</p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              onClick={onCancel}
              className="search-button"
              style={{ backgroundColor: '#6B7280' }}
            >
              Stay
            </button>
            <button
              onClick={onOK}
              className="search-button"
            >
              Leave
            </button>
          </div>
        </div>
      </div>
    )
  );
};

export default NavigationPrompt;