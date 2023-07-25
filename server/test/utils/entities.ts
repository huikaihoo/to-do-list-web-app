import { Task } from '../../src/tasks/entities/task.entity';
import { User } from '../../src/users/entities/user.entity';
import { CreateTaskDto } from '../../src/tasks/dto/create-task.dto';

const mockUserId = 'b8c3d0cb-1968-4d85-8353-22deb5998a2a';
const mockJwtSecret = 'mock-jwt-secret';
const mockHashedPassword = '$2b$10$qCnA7YCtJv7IrtIbi8uBIeAyR.n1OwvadYsrtg9d8j1DJRDsjW00G'; // from 'testpassword
const mockTaskId = '123';

const mockUser = (id: string = mockUserId, withoutPassword = false) => {
  const user = new User({
    id,
    createdAt: new Date(2023, 1, 1),
    updatedAt: new Date(2023, 1, 1),
    username: 'testuser',
  });

  if (!withoutPassword) {
    user.password = 'testpassword';
  }

  return user;
};

const mockTask = (userId: string, taskId: string, createTaskDto?: CreateTaskDto) => {
  const task = new Task({
    id: taskId,
    createdAt: new Date(2023, 1, 1),
    updatedAt: new Date(2023, 1, 1),
    deletedAt: undefined,
    userId,
    content: createTaskDto?.content ?? 'default content',
    isCompleted: createTaskDto?.isCompleted ?? false,
  });

  return task;
};

export { mockUserId, mockJwtSecret, mockHashedPassword, mockTaskId, mockUser, mockTask };
