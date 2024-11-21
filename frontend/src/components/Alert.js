// Alert.js
import React, { useState, useEffect } from 'react';

const Alert = ({ show, message, type = 'success', duration = 5000, onClose }) => {
  const [isVisible, setIsVisible] = useState(show);

  useEffect(() => {
    setIsVisible(show);
    
    
    if (show) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  if (!isVisible) return null;

  const styles = {
    alertContainer: {
      position: 'fixed',
      top: '20px',
      right: '20px',
      padding: '16px',
      borderRadius: '4px',
      backgroundColor: type === 'success' ? '#4caf50' : '#f44336',
      color: 'white',
      boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
      zIndex: 1000,
      minWidth: '300px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      animation: 'slideIn 0.5s ease-out'
    },
    closeButton: {
      background: 'none',
      border: 'none',
      color: 'white',
      cursor: 'pointer',
      marginLeft: '10px',
      fontSize: '18px'
    }
  };

  return (
    <>
      <style>
        {`
          @keyframes slideIn {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
        `}
      </style>
      <div style={styles.alertContainer}>
        <span>{message}</span>
        <button 
          style={styles.closeButton}
          onClick={() => {
            setIsVisible(false);
            onClose?.();
          }}
        >
          ×
        </button>
      </div>
    </>
  );
};

export default Alert;