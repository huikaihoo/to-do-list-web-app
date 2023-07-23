import React from 'react';
import SelfImprovementIcon from '@mui/icons-material/SelfImprovement';

const WelcomeContainer = () => {
  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <SelfImprovementIcon style={{ fontSize: '128px', color: '#ccc' }} />
      <h1>Welcome to Your To-Do List</h1>
      <p>Please login or sign up to start organizing your tasks!</p>
    </div>
  );
};

export default WelcomeContainer;
