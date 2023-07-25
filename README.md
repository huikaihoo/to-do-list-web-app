# To-Do List Web App

---

# Documentation

## Introduction

Welcome to the documentation for the To-Do List web application! This repository contains the source code for the application, which consists of both the Frontend and Backend components. The application can be containerized for easy deployment. Let's take a closer look at each component:

## Frontend

The frontend of the To-Do List application is located in the `client/` directory and is based on the Create React App framework. The user interface provides a login and signup feature for new users. After creating an account, users can log in to access their own to-do list.

### Features

- **Login and Signup**: Users can create an account or log in using their credentials.
- **View Tasks**: Once logged in, users can view their to-do list, which displays tasks in descending order based on their creation time.
- **Task Management**: Users can edit task content, mark tasks as completed, and delete individual records.
- **Lazy Loading**: The tasks are lazily loaded from the server. Only a portion of the tasks is initially fetched, and more items are loaded as the user scrolls down, optimizing performance by reducing the initial data load.

## Backend

The backend of the To-Do List application is located in the `server/` directory and is built on the NestJS framework. It uses TypeORM to interact with a PostgreSQL database for data storage and Redis for caching. Pino is used to log the request, and Fastify is used as the server engine.

### Resources

The backend is composed of the following resources:

1. **Auth**: Responsible for generating JSON Web Tokens (JWT) for authenticated routes.
2. **User**: Handles user management, including user registration and login.
3. **Task**: Manages tasks and their interactions.

### Database and Cache

Data is stored in PostgreSQL via TypeORM, providing a reliable and efficient storage solution for user and task-related data.

For enhanced performance, the backend utilizes Redis as a caching mechanism. When querying for tasks, the tasks are cached in Redis, and subsequent requests for the same data will be served directly from the cache until the cache timeout is reached.

The cache is based on user-specific data, ensuring that each user's task data is stored separately. When a user's tasks are updated or deleted, the corresponding task cache for that user will be invalidated, ensuring that users always receive up-to-date task information.

This caching strategy helps to reduce the load on the PostgreSQL database and significantly improves the overall response time of the application.

### Testing

Unit tests and end-to-end (E2E) tests are included in the backend.

- **Unit Tests**: Each service and controller has unit tests, with external modules mocked to isolate test cases and ensure test stability.
- **E2E Tests**: E2E tests are categorized by controller and simulate real user interactions. For E2E testing, a separate set of databases and Redis instances are used, which are reset for each test case to provide a clean environment for testing.

## Containers

The project includes Dockerfiles and Docker Compose files to facilitate containerization and easy deployment.

### Docker Compose

- **Local Deployment**: The primary Docker Compose file allows building and running the frontend and backend containers locally.
- **Testing Deployment**: An additional Docker Compose file is provided for running server-side unit tests and E2E tests. This enables smooth integration into the pipeline for automated testing during the development process.

---

# Manual

## Prerequisites

Before you begin, ensure you have the following prerequisites installed on your system:

- docker
- yarn
- nvm

## Port and URL for Services Running Locally

Make a note of the following ports and URLs for services running in the local environment:

### Ports

- Redis: `6379`
- PostgreSQL: `5432`
- Server: `3001`
- Client: `3000`

### URLs

- Server: [http://localhost:3001/](http://localhost:3001/)
- Server (Swagger): [http://localhost:3001/api](http://localhost:3001/api)
- Client: [http://localhost:3000/](http://localhost:3000/)

## Commands for Development and Build

### Initialize Project for Local Development

```sh
nvm use
yarn install
```

### Start PostgreSQL Database & Redis

```sh
docker compose up -d postgres redis
```

### Start Server and Client for Development

Before starting the server and client, make sure to modify the configurations if necessary.

- Server: Modify the [.env.development](.env.development) file.
- Client: Modify the [client/public/env.js](client/public/env.js) file.

```sh
yarn server start:dev
yarn client start:dev
```

### Check Dependencies and Lint Source Code

```sh
yarn lint
```

### Build Server and Client Binary in Local

```sh
yarn server build
yarn client build
```

### Build Docker Image of Server and Client

```sh
docker compose build
```

### Start All Services in Docker Container

Before starting all services, make sure to create the `.env` file in the root folder based on the [.env.sample](.env.sample) template. If needed, create the `env.js` based on [client/public/env.js](client/public/env.js) and mount it to `/app/env.js` within the client docker image.

```sh
docker compose up -d --build
```

### Close the Services

```sh
docker compose -f docker-compose.t.yml down
```

## Running Server Tests

Before running server tests, modify the [.env.test](.env.test) file if needed.

### Run Server Tests

```sh
docker compose -f docker-compose.t.yml up -d --build
docker compose -f docker-compose.t.yml exec server-t sh

# Run inside the server container
yarn test # Run all unit tests
yarn test:cov # Run all unit tests with coverage
yarn test:e2e # Run E2E tests
```

### Close the Servers for Testing

```sh
docker compose -f docker-compose.t.yml down
```
