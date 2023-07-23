import React from 'react';

interface ErrorMessageProps {
  message: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  // Return an empty div when the error message is empty or falsy
  if (!message) {
    return null;
  }

  return <p style={{ color: 'red', margin: '10px 0' }}>{message}</p>;
};

export default ErrorMessage;
