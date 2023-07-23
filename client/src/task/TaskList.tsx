import React, { useState, useEffect, useRef } from 'react';
import { CircularProgress, List, ListItem, ListItemIcon, ListItemText, IconButton, Tooltip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import Checkbox from '@mui/material/Checkbox';
import TaskEditDialog from './TaskEditDialog';
import { Task } from '../interface/task';

interface TaskListProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  onLoadMore: (byScroll: boolean) => void;
  isLoading: boolean;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, setTasks, onLoadMore, isLoading }) => {
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
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
    setTasks(prev => prev.filter(task => task.id !== taskId));
  };

  return (
    <List>
      {tasks.map((task, index) => (
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
