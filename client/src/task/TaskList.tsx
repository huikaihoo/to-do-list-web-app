import React, { useState, useEffect, useRef } from 'react';
import { CircularProgress, List, ListItem, ListItemIcon, ListItemText, IconButton, Tooltip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import Checkbox from '@mui/material/Checkbox';
import TaskEditDialog from './TaskEditDialog';
import { Task } from '../interface/task';
import axiosInstance from '../connection/axiosInstance';

interface TaskListProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  onLoadMore: (byScroll: boolean) => void;
  isLoading: boolean;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, setTasks, onLoadMore, isLoading }) => {
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (target.isIntersecting) {
        onLoadMore(true);
      }
    };

    const observer = new IntersectionObserver(handleIntersection, { root: null, rootMargin: '200px' });
    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => {
      if (sentinelRef.current) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        observer.unobserve(sentinelRef.current);
      }
    };
  }, [onLoadMore]);

  const handleEditTask = (taskId: string) => {
    setEditingTaskId(taskId);
  };

  const handleTaskUpdate = async (
    taskId: string,
    updatedContent: string | null = null,
    isCompleted: boolean | null = null
  ) => {
    try {
      if (updatedContent === null && isCompleted === null) return;

      const taskToUpdate = tasks.find(task => task.id === taskId);
      if (!taskToUpdate) return;

      const updatedTaskData = {
        content: updatedContent !== null ? updatedContent : taskToUpdate.content,
        isCompleted: isCompleted !== null ? isCompleted : taskToUpdate.isCompleted,
      };

      const updatedTask = await axiosInstance.post(`v1/task/${taskId}`, updatedTaskData);

      const newTasks = tasks.map(task => (task.id === taskId ? updatedTask.data : task));
      setTasks(newTasks);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleSaveTask = (editedText: string) => {
    if (editingTaskId) {
      handleTaskUpdate(editingTaskId, editedText);
    }
    setEditingTaskId(null);
  };

  const handleCheckboxChange = (taskId: string) => {
    const taskToUpdate = tasks.find(task => task.id === taskId);
    if (!taskToUpdate) return;

    handleTaskUpdate(taskId, null, !taskToUpdate.isCompleted);
  };

  const handleCancelEdit = () => {
    setEditingTaskId(null);
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await axiosInstance.delete(`v1/task/${taskId}`);

      setTasks(prev => prev.filter(task => task.id !== taskId));
    } catch (error) {
      alert(`Error deleting task ${editingTaskId} - ${error}`);
    }
  };

  return (
    <List>
      {tasks.map((task, index) => (
        <ListItem key={task.id} disablePadding>
          <ListItemIcon>
            <Checkbox
              edge="start"
              checked={task.isCompleted}
              tabIndex={-1}
              disableRipple
              onChange={() => handleCheckboxChange(task.id)}
            />
          </ListItemIcon>
          <>
            <ListItemText
              primary={task.content}
              style={{
                textDecoration: task.isCompleted ? 'line-through' : 'none',
                color: task.isCompleted ? 'gray' : 'black',
              }}
            />
            <Tooltip title="Edit task">
              <span>
                <IconButton onClick={() => handleEditTask(task.id)} color="primary">
                  <EditIcon />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Delete task">
              <span>
                <IconButton onClick={() => handleDeleteTask(task.id)} style={{ color: 'red' }}>
                  <DeleteIcon />
                </IconButton>
              </span>
            </Tooltip>
          </>
          {index === tasks.length - 1 && <div ref={sentinelRef} />}
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
