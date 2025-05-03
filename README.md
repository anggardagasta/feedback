# Feedback Service
## Overview
This is a feedback management system built with NestJS and GraphQL. The application allows users to submit feedback, administrators to review and update feedback status, and includes notification capabilities for users.

## Features
- User authentication with JWT
- Feedback submission with file attachments
- Feedback categorization (Bug, Feature, General)
- Status tracking (Pending, Reviewed, Resolved)
- Notification system for feedback status updates
- Reminder system for users who haven't submitted feedback

## System Requirements
- Node.js (20+)
- PostgreSQL
- MongoDB

## Installation and Setup
1. Clone the repository
```
git clone <repository-url>
cd feedback
```
2. Copy `.env.example` to `.env` file in the root directory with the following variables:
```
cp .env.example .env
```
3. Modify the values in `.env` as needed for your environment
4. Run Docker Compose:
```
docker-compose up -d
```

## System Design Decisions
### Architecture
The application follows a modular monolith architecture using NestJS modules for separation of concerns:
1. Auth Module : Handles user authentication and authorization
2. User Module : Manages user data and profiles
3. Feedback Module : Core module for feedback submission and management
4. Notification Module : Handles user notifications
5. Upload Module : Manages file uploads for feedback attachments
6. Reminder Module : Sends reminders to users who haven't submitted feedback

### Database Design
The application uses a hybrid database approach:

- PostgreSQL : For structured data (users, feedback, access tokens)

    - Leverages TypeORM for ORM capabilities
    - Uses migrations for schema versioning
- MongoDB : For unstructured data (feedback attachments, notifications)

    - Provides flexibility for document-based storage
    - Better suited for the varying nature of attachments and notifications

### API Design
- GraphQL API : Provides a flexible query language for clients
    - Enables clients to request exactly the data they need
    - Reduces over-fetching and under-fetching of data
    - Playground available for API exploration

### Authentication
- JWT-based authentication
- Role-based access control (Admin/User)

## Evolution to Microservices
The current modular monolith design provides a clear path to microservices evolution:

### Step 1: Service Identification
The existing modules can be transformed into independent microservices:
- Auth Service : Handle authentication and authorization
- User Service : Manage user profiles and data
- Feedback Service : Core service for feedback management
- Notification Service : Handle all notifications
- Upload Service : Manage file uploads and storage
- Reminder Service : Handle scheduled reminders
### Step 2: Database Decomposition
- Each service would maintain its own database
### Step 3: Communication Patterns
- Implement GQL federation
- Use event-driven architecture with message brokers (RabbitMQ/Redpanda)
- Implement synchronous communication via gRPC for critical paths
### Step 4: Deployment Strategy
- Containerize each service with Docker
- Use Kubernetes for orchestration
- Implement CI/CD pipelines for each service
### Step 5: Monitoring and Observability with Datadog
- Implement distributed tracing with Datadog APM to track requests across services
- Set up centralized logging with Datadog Log Management for aggregation and analysis
- Configure Datadog Metrics for real-time performance monitoring and custom dashboards

## Contributing
Please read the contribution guidelines before submitting pull requests.

## License
This project is licensed under the MIT License - see the LICENSE file for details.
