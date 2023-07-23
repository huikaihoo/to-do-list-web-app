import './App.css';
import { useState, useEffect } from 'react';
import Appbar from './Appbar';
import LoginDialog from './user/LoginDialog';
import SignUpDialog from './user/SignUpDialog';
import Cookies from 'js-cookie';
import axiosInstance from './connection/axiosInstance';
import _ from 'lodash';
import TodoListContainer from './container/TodoListContainer';
import WelcomeContainer from './container/WelcomeContainer';

function App() {
  const [loginOpen, setLoginOpen] = useState(false);
  const [signUpOpen, setSignUpOpen] = useState(false);
  const [username, setUsername] = useState('');

  // Function to check login status and get user details (username)
  const checkLoginStatus = async () => {
    try {
      const token = Cookies.get('token');
      if (!token) {
        // If the token is not present, set username to an empty string (user is not logged in)
        setUsername('');
        return;
      }

      const response = await axiosInstance.get('v1/user');
      const userDetails = response.data;
      if (!_.isEmpty(userDetails.username)) {
        setUsername(userDetails.username);
      } else {
        setUsername('');
      }
    } catch (error) {
      // if failed, remove cookies
      Cookies.remove('token');
      setUsername('');
    }
  };

  // Check the login status on component mount
  useEffect(() => {
    checkLoginStatus();
  }, []);

  const handleDialogToggle = (dialogType: string, dialogState: boolean) => {
    if (dialogType === 'login') {
      setLoginOpen(dialogState);
    } else if (dialogType === 'signup') {
      setSignUpOpen(dialogState);
    }

    // Call checkLoginStatus to update user login status after closing the dialogs
    if (dialogState === false) {
      checkLoginStatus();
    }
  };

  const handleLogout = () => {
    // Clear the token from cookies when logging out
    Cookies.remove('token');
    setUsername('');
  };

  return (
    <div className="App">
      <Appbar
        username={username}
        onLogoutClick={handleLogout}
        onLoginClick={() => handleDialogToggle('login', true)}
        onSignUpClick={() => handleDialogToggle('signup', true)}
      />
      {username ? <TodoListContainer /> : <WelcomeContainer />}
      <LoginDialog open={loginOpen} onClose={() => handleDialogToggle('login', false)} />
      <SignUpDialog open={signUpOpen} onClose={() => handleDialogToggle('signup', false)} />
    </div>
  );
}

export default App;
