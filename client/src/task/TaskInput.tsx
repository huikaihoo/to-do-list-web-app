import React, { useState } from 'react';
import { TextField, IconButton, Tooltip } from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';

interface TaskInputProps {
  onAddTask: (task: string) => void;
}

const TaskInput: React.FC<TaskInputProps> = ({ onAddTask }) => {
  const [newTaskText, setNewTaskText] = useState<string>('');

  const SubmitButton = () => (
    <Tooltip title="Add new task">
      <span>
        <IconButton
          onClick={handleAddTask}
          disabled={!newTaskText.trim()}
          style={{ color: newTaskText.trim() ? 'green' : 'gray' }}
        >
          <AddCircleIcon />
        </IconButton>
      </span>
    </Tooltip>
  );

  const handleAddTask = () => {
    if (newTaskText.trim() === '') return;
    onAddTask(newTaskText);
    setNewTaskText('');
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleAddTask();
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <TextField
        label="New Task"
        variant="outlined"
        fullWidth
        value={newTaskText}
        onChange={e => setNewTaskText(e.target.value)}
        onKeyDown={handleKeyDown} // Handle "Enter" key press event
        InputProps={{ endAdornment: <SubmitButton /> }}
      />
    </div>
  );
};

export default TaskInput;
