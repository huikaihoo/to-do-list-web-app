import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { Dialog, DialogTitle, DialogContent, TextField, Button, DialogActions } from '@mui/material';
import PrimaryButton from '../component/PrimaryButton';
import PasswordField from '../component/PasswordField';
import axiosInstance from '../connection/axiosInstance';
import ErrorMessage from '../component/ErrorMessage';

interface LoginDialogProps {
  open: boolean;
  onClose: (reason: string) => void;
}

const LoginDialog: React.FC<LoginDialogProps> = ({ open, onClose }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Reset password and error message when the dialog is closed
  useEffect(() => {
    if (!open) {
      setPassword('');
      setErrorMessage('');
    }
  }, [open]);

  const handleClick = (reason: string) => {
    onClose(reason);
  };

  const handleLogin = async () => {
    try {
      // Call the server to perform login authentication using axios
      const { data } = await axiosInstance.post('v1/auth/login', { username, password });

      // Extract the token from the response and save it to cookies
      const token = data.token;
      Cookies.set('token', token, { expires: 7 });

      // Successful login
      onClose('login');
    } catch (error) {
      // Handle the error and set the error message state
      console.error('Error during login:', error);
      setErrorMessage('Invalid username or password');
    }
  };

  // Disable login button if username or password has fewer than 6 characters
  const isLoginDisabled = username.length < 6 || password.length < 6;

  return (
    <Dialog open={open} onClick={e => e.stopPropagation()}>
      <DialogTitle>Login</DialogTitle>
      <DialogContent>
        <TextField
          label="Username"
          fullWidth
          margin="normal"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />
        <PasswordField label="Password" value={password} onChange={value => setPassword(value)} />
        <ErrorMessage message={errorMessage} />
      </DialogContent>
      <DialogActions>
        <Button color="primary" onClick={() => handleClick('cancel')}>
          Cancel
        </Button>
        <PrimaryButton onClick={handleLogin} disabled={isLoginDisabled}>
          Login
        </PrimaryButton>
      </DialogActions>
    </Dialog>
  );
};

export default LoginDialog;
