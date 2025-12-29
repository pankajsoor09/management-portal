import React from 'react';
import './Input.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const Input: React.FC<InputProps> = ({ label, error, id, ...props }) => {
  const inputId = id || label.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="input-group">
      <label htmlFor={inputId} className="input-label">
        {label}
      </label>
      <input
        id={inputId}
        className={`input-field ${error ? 'input-error' : ''}`}
        {...props}
      />
      {error && <span className="error-message">{error}</span>}
    </div>
  );
};

export default Input;
