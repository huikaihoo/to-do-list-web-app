import React from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';

interface AppbarProps {
  username: string;
  onLoginClick: () => void;
  onSignUpClick: () => void;
  onLogoutClick: () => void;
}

const Appbar: React.FC<AppbarProps> = ({ username, onLoginClick, onSignUpClick, onLogoutClick }) => {
  const isLoggedIn = !!username;

  return (
    <AppBar position="sticky">
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h6">To-Do List</Typography>
        <div>
          {isLoggedIn ? (
            <>
              <span style={{ marginRight: '16px', color: '#fff' }}>Hello, {username}!</span>
              <Button color="inherit" onClick={onLogoutClick} sx={{ backgroundColor: 'darkblue', marginLeft: '8px' }}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button color="inherit" onClick={onLoginClick} sx={{ backgroundColor: 'darkblue', marginLeft: '8px' }}>
                Login
              </Button>
              <Button color="inherit" onClick={onSignUpClick} sx={{ backgroundColor: 'darkblue', marginLeft: '8px' }}>
                Sign Up
              </Button>
            </>
          )}
        </div>
      </Toolbar>
    </AppBar>
  );
};

export default Appbar;
