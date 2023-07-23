// TaskEditDialog.tsx

import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';
import PrimaryButton from '../component/PrimaryButton';

interface TaskEditDialogProps {
  isOpen: boolean;
  initialText: string;
  onClose: () => void;
  onSave: (text: string) => void;
}

const TaskEditDialog: React.FC<TaskEditDialogProps> = ({ isOpen, initialText, onClose, onSave }) => {
  const [editedTaskText, setEditedTaskText] = useState<string>(initialText);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus on the text box when the dialog is opened
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleSaveTask = () => {
    if (editedTaskText.trim() === '') return;
    onSave(editedTaskText);
    onClose();
  };

  const handleCancelEdit = () => {
    setEditedTaskText(initialText);
    onClose();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    // Handle "Enter" key press event to prevent form submission
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSaveTask();
    }
  };

  const isSaveDisabled = editedTaskText.length <= 0;

  return (
    <Dialog open={isOpen} onClick={e => e.stopPropagation()} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Task</DialogTitle>
      <DialogContent>
        <TextField
          inputRef={inputRef}
          value={editedTaskText}
          onChange={e => setEditedTaskText(e.target.value)}
          fullWidth
          margin="none"
          onKeyDown={handleKeyDown} // Attach the onKeyDown event handler to the TextField
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancelEdit} color="primary">
          Cancel
        </Button>
        <PrimaryButton onClick={handleSaveTask} disabled={isSaveDisabled}>
          Save
        </PrimaryButton>
      </DialogActions>
    </Dialog>
  );
};

export default TaskEditDialog;
