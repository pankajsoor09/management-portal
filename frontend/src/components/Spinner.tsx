import React from 'react';
import './Spinner.css';

interface SpinnerProps {
  size?: 'small' | 'medium' | 'large';
}

const Spinner: React.FC<SpinnerProps> = ({ size = 'medium' }) => {
  return (
    <div className={`spinner-wrapper spinner-${size}`}>
      <div className="loading-spinner"></div>
    </div>
  );
};

export default Spinner;
