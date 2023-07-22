import React, { useState, useEffect } from 'react';
import { CircularProgress, List, ListItem, ListItemIcon, ListItemText, IconButton, Tooltip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import Checkbox from '@mui/material/Checkbox';
import TaskEditDialog from './TaskEditDialog';
import { Task } from '../interface/task';

interface TaskListProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  onLoadMore: () => void;
  isLoading: boolean;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, setTasks, onLoadMore, isLoading }) => {
  const [isFetching, setIsFetching] = useState(false);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  useEffect(() => {
    function handleScroll() {
      if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 200) {
        setIsFetching(true);
      }
    }

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!isFetching || isLoading) return;

    onLoadMore();
    setIsFetching(false);
  }, [isFetching, isLoading, onLoadMore]);

  const handleCheckboxChange = (taskId: string) => {
    if (completedTasks.includes(taskId)) {
      setCompletedTasks(prev => prev.filter(item => item !== taskId));
    } else {
      setCompletedTasks(prev => [...prev, taskId]);
    }
  };

  const handleEditTask = (taskId: string) => {
    setEditingTaskId(taskId);
  };

  const handleSaveTask = (editedText: string) => {
    const newTasks = tasks.map(task => (task.id === editingTaskId ? { ...task, content: editedText } : task));
    setTasks(newTasks);

    setEditingTaskId(null);
  };

  const handleCancelEdit = () => {
    setEditingTaskId(null);
  };

  const handleDeleteTask = (taskId: string) => {
    // setCompletedTasks(prev => prev.filter(item => item !== taskId));
    // remove the task from the tasks array
    setTasks(prev => prev.filter(task => task.id !== taskId));
  };

  return (
    <List>
      {tasks.map(task => (
        <ListItem key={task.id} disablePadding>
          <ListItemIcon>
            <Checkbox
              edge="start"
              checked={completedTasks.includes(task.id)}
              tabIndex={-1}
              disableRipple
              onChange={() => handleCheckboxChange(task.id)}
            />
          </ListItemIcon>
          <>
            <ListItemText
              primary={task.content}
              style={{
                textDecoration: completedTasks.includes(task.id) ? 'line-through' : 'none',
                color: completedTasks.includes(task.id) ? 'gray' : 'black',
              }}
            />
            <Tooltip title="Edit task">
              <IconButton onClick={() => handleEditTask(task.id)} color="primary">
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete task">
              <IconButton onClick={() => handleDeleteTask(task.id)} style={{ color: 'red' }}>
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </>
        </ListItem>
      ))}
      {isLoading && <CircularProgress />}
      {editingTaskId !== null && (
        <TaskEditDialog
          isOpen={editingTaskId !== null}
          initialText={tasks.find(task => task.id === editingTaskId)?.content || ''}
          onClose={handleCancelEdit}
          onSave={handleSaveTask}
        />
      )}
    </List>
  );
};

export default TaskList;
