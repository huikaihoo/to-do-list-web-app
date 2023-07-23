import React from 'react';
import { Button, ButtonProps } from '@mui/material';

interface PrimaryButtonProps extends ButtonProps {
  // Add any additional props specific to the PrimaryButton component
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({ children, disabled, ...rest }) => {
  const backgroundColor = disabled ? '#bdbdbd' : '#4caf50';

  return (
    <Button
      color="primary"
      variant="contained"
      style={{ backgroundColor, color: 'white' }}
      disabled={disabled}
      {...rest}
    >
      {children}
    </Button>
  );
};

export default PrimaryButton;
