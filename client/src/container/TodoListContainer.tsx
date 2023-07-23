import React, { useState, useEffect, useCallback } from 'react';
import { Box, Paper } from '@mui/material';
import TaskInput from '../task/TaskInput';
import TaskList from '../task/TaskList';
import { Task } from '../interface/task';
import axiosInstance from '../connection/axiosInstance';
import _ from 'lodash';

interface TodoListContainerProps {}

const TodoListContainer: React.FC<TodoListContainerProps> = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [prevEndId, setPrevEndId] = useState<string | null>(null); // Add prevEndId state

  const addTask = async (taskContent: string) => {
    try {
      setIsLoading(true);

      const newTask = {
        content: taskContent,
        isCompleted: false,
      };

      // Send a POST request to create the new task
      const response = await axiosInstance.post('v1/task', newTask);

      // Add the new task to the tasks array
      setTasks(prevTasks => [response.data, ...prevTasks]);
    } catch (error) {
      alert(`Error adding task: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMoreTasks = useCallback(
    async (byScroll: boolean) => {
      try {
        console.log('prevEndId:', prevEndId, byScroll);

        if (_.isEmpty(prevEndId) || (byScroll && prevEndId !== 'END')) {
          setIsLoading(true);

          // Fetch more tasks using the prevEndId parameter
          const response = await axiosInstance.get('v1/task', {
            params: {
              take: 10,
              prevEndId, // Set the prevEndId parameter for fetching next tasks
            },
          });

          const { tasks: newTasks, currEndId } = response.data; // Assuming the API response contains the new tasks and currEndId

          if (newTasks.length > 0) {
            if (!_.isEmpty(prevEndId)) {
              setTasks(prevTasks => [...prevTasks, ...newTasks]);
            } else {
              setTasks(newTasks);
            }
          }
          setPrevEndId(currEndId);
        }
      } catch (error) {
        console.error('Error fetching tasks:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [prevEndId]
  );

  useEffect(() => {
    // Initial loading of tasks
    loadMoreTasks(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
