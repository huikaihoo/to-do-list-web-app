import React, { useEffect, useState, useCallback } from 'react';
import { Dialog, DialogTitle, DialogContent, Button, DialogActions, TextField } from '@mui/material';
import PrimaryButton from '../component/PrimaryButton';
import PasswordField from '../component/PasswordField';
import axiosInstance from '../connection/axiosInstance';
import Cookies from 'js-cookie';
import ErrorMessage from '../component/ErrorMessage';

interface SignUpDialogProps {
  open: boolean;
  onClose: (reason: string) => void;
}

const SignUpDialog: React.FC<SignUpDialogProps> = ({ open, onClose }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [usernameError, setUsernameError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [confirmPasswordError, setConfirmPasswordError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isFormValid, setIsFormValid] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    if (field === 'username') {
      setUsername(value);
      validateField('username', value);
    } else if (field === 'password') {
      setPassword(value);
      validateField('password', value);
      validateField('confirmPassword', value, confirmPassword); // Validate confirm password when password changes
    } else if (field === 'confirmPassword') {
      setConfirmPassword(value);
      validateField('confirmPassword', password, value);
    }
  };

  const validateField = (field: string, value: string, confirmValue?: string) => {
    if (field === 'username') {
      setUsernameError(value.length > 0 && value.length < 6);
    } else if (field === 'password') {
      setPasswordError(value.length > 0 && value.length < 6);
    } else if (field === 'confirmPassword') {
      setConfirmPasswordError(value !== confirmValue);
    }
  };

  const validateForm = useCallback(() => {
    setIsFormValid(
      !usernameError &&
        !passwordError &&
        !confirmPasswordError &&
        username.length > 0 &&
        password.length > 0 &&
        confirmPassword.length > 0
    );
  }, [usernameError, passwordError, confirmPasswordError, username, password, confirmPassword]);

  useEffect(() => {
    validateForm();
  }, [validateForm]);

  const handleSignUp = async () => {
    try {
      // Call the server to perform sign-up using axios
      await axiosInstance.post('v1/user', { username, password });

      // Call the server to perform login authentication using axios
      const { data } = await axiosInstance.post('v1/auth/login', { username, password });

      // Extract the token from the response and save it to cookies
      const token = data.token;
      Cookies.set('token', token, { expires: 7 });

      // Sign-up successful
      onClose('signup');
    } catch (error) {
      // Failed sign-up
      setErrorMessage('Failed to sign up. Please try again.');
    }
  };
  return (
    <Dialog open={open} onClick={e => e.stopPropagation()}>
      <DialogTitle>Sign Up</DialogTitle>
      <DialogContent>
        <TextField
          label="Username"
          fullWidth
          margin="normal"
          value={username}
          onChange={e => handleInputChange('username', e.target.value)}
          error={usernameError}
          helperText={usernameError && 'Username must be at least 6 characters'}
        />
        <PasswordField
          label="Password"
          value={password}
          onChange={value => handleInputChange('password', value)}
          error={passwordError}
          helperText={passwordError && 'Password must be at least 6 characters'}
        />
        <PasswordField
          label="Confirm Password"
          value={confirmPassword}
          onChange={value => handleInputChange('confirmPassword', value)}
          error={confirmPasswordError}
          helperText={confirmPasswordError && 'Passwords do not match'}
        />
        <ErrorMessage message={errorMessage} />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose('cancel')}>Cancel</Button>
        <PrimaryButton onClick={handleSignUp} disabled={!isFormValid}>
          Sign Up
        </PrimaryButton>
      </DialogActions>
    </Dialog>
  );
};

export default SignUpDialog;
