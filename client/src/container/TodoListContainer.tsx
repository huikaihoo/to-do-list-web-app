import React, { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Box, Paper } from '@mui/material';
import TaskInput from '../task/TaskInput';
import TaskList from '../task/TaskList';
import { Task } from '../interface/task';

const TodoListContainer: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]); // Use the Task interface in state
  const [isLoading, setIsLoading] = useState(false);

  const addTask = (taskContent: string) => {
    const newTask: Task = {
      id: uuidv4(), // Generate a random UUID for the new task
      content: taskContent,
    };
    setTasks(prevTasks => [newTask, ...prevTasks]);
  };

  const loadMoreTasks = useCallback(() => {
    // Simulate a loading delay to demonstrate lazy loading behavior
    if (tasks.length < 100) {
      setIsLoading(true);
      setTimeout(() => {
        const newTasks = Array.from({ length: 10 }, (_, index) => {
          const id = uuidv4();
          return {
            id, // Generate a random UUID for the new task
            content: `Dummy Task ${id}`,
          };
        });
        setTasks(prevTasks => [...prevTasks, ...newTasks]);
        setIsLoading(false);
      }, 1000);
    }
  }, [tasks]); // Include 'tasks' in the dependency array

  useEffect(() => {
    // Initial loading of tasks
    loadMoreTasks();
  }, [loadMoreTasks]); // Use the 'loadMoreTasks' callback in the dependency array

  return (
    <div>
      <Box mt={4} display="flex" flexDirection="column" alignItems="center">
        <Paper elevation={3} style={{ width: '400px', padding: '20px' }}>
          <TaskInput onAddTask={addTask} />
        </Paper>
        <div style={{ margin: '20px' }}></div>
        <Paper elevation={3} style={{ width: '800px', padding: '20px' }}>
          <TaskList tasks={tasks} setTasks={setTasks} onLoadMore={loadMoreTasks} isLoading={isLoading} />
        </Paper>
      </Box>
    </div>
  );
};

export default TodoListContainer;
