# Architecture Overview

## System Architecture

This project follows a **modern full-stack architecture** with real-time WebSocket capabilities. It's designed as a **Single Page Application (SPA)** with a **RESTful API backend** and **real-time synchronization** via Socket.IO.

```
┌─────────────────────────────────────────────────────────────┐
│                        USER BROWSER                          │
│  ┌────────────────────────────────────────────────────────┐ │
│  │           React SPA (Frontend)                        │ │
│  │  ┌──────────────────────────────────────────────────┐ │ │
│  │  │ Components (Board, Task, Dashboard, etc.)       │ │ │
│  │  │ ├─ UI Layer (React components)                 │ │ │
│  │  │ ├─ State Management (Zustand store)            │ │ │
│  │  │ └─ Socket Listeners (real-time updates)        │ │ │
│  │  └──────────────────────────────────────────────────┘ │ │
│  │                      |                                 │ │
│  │               HTTP & WebSocket                         │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            |
                ┌───────────┴───────────┐
                |                       |
                | REST API              | WebSocket
                | (HTTP)                | (Socket.IO)
                ▼                       ▼
┌──────────────────────────────────────────────────────┐
│         Express.js Server (Backend)                  │
│  ┌─────────────────────────────────────────────────┐ │
│  │ API Layer (Routes)                              │ │
│  │ ├─ /api/auth     (authentication)              │ │
│  │ ├─ /api/boards   (board management)            │ │
│  │ ├─ /api/lists    (list management)             │ │
│  │ ├─ /api/tasks    (task management)             │ │
│  │ └─ /api/search   (search functionality)        │ │
│  └─────────────────────────────────────────────────┘ │
│               |                                      │
│  ┌────────────┴─────────────────────────────────┐   │
│  │ Middleware & Services                        │   │
│  │ ├─ Authentication (JWT validation)           │   │
│  │ ├─ Authorization (access control)            │   │
│  │ ├─ Activity Logging                          │   │
│  │ └─ Socket.IO Event Management                │   │
│  └────────────┬─────────────────────────────────┘   │
│               |                                      │
│  ┌────────────┴─────────────────────────────────┐   │
│  │ Data Access Layer (Mongoose Models)          │   │
│  │ ├─ User Model                                │   │
│  │ ├─ Board Model                               │   │
│  │ ├─ List Model                                │   │
│  │ ├─ Task Model                                │   │
│  │ └─ Activity Model                            │   │
│  └────────────┬─────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
                |
                | MongoDB Protocol
                ▼
┌──────────────────────────────────────────────────────┐
│         MongoDB Database                            │
│  Collections:                                       │
│  ├─ users      (user accounts)                     │
│  ├─ boards     (board data)                        │
│  ├─ lists      (list data)                         │
│  ├─ tasks      (task data)                         │
│  └─ activities (activity log)                      │
└──────────────────────────────────────────────────────┘
```

## Architectural Layers

### 1. **Presentation Layer (Frontend)**
- **Framework**: React 18
- **Build Tool**: Vite
- **Routing**: React Router v6
- **Styling**: TailwindCSS
- **UI Components**: Modular React components
- **State Management**: Zustand store

**Key Components**:
```
src/components/
├── Auth/
│   ├── Login.jsx         - User login page
│   ├── Register.jsx      - User registration
├── Board/
│   ├── Board.jsx         - Main board view
│   ├── Board.css         - Board styling
│   ├── Dashboard.jsx     - Board list/selection
│   ├── CreateBoardModal.jsx
├── Lists/
│   ├── CreateListModal.jsx
├── Tasks/
│   ├── TaskCard.jsx      - Individual task display
│   ├── CreateTaskModal.jsx
│   ├── TaskDetailModal.jsx
│   ├── UserSelector.jsx  - User assignment dropdown
├── Activity/
│   ├── ActivityPanel.jsx - Activity history modal
│   ├── Pagination.jsx    - Pagination component
├── Members/
│   └── MemberPanel.jsx   - Member management modal
```

### 2. **Business Logic Layer (State Management)**
- **Tool**: Zustand
- **Store Location**: `src/store/store.js`
- **State**: User, boards, lists, tasks, search query, modals

**Store Actions**:
```javascript
{
  // User
  setUser, logout,
  
  // Boards
  setBoards, addBoard, updateBoard, deleteBoard, setCurrentBoard,
  
  // Lists
  setLists, addList, updateList, deleteList,
  
  // Tasks
  setTasks, addTask, updateTask, deleteTask, moveTask, setSearchQuery,
  
  // Real-time sync
  updateTasksFromSocket, addActivityToBoard
}
```

### 3. **Communication Layer**
- **REST API**: HTTP requests via Axios
- **Real-time**: WebSocket via Socket.IO
- **Authentication**: JWT tokens in headers

**Services**:
```
src/services/
├── api.js      - HTTP client with Axios
│   ├── authAPI    (login, register, search users)
│   ├── boardAPI   (CRUD operations)
│   ├── listAPI    (CRUD operations)
│   ├── taskAPI    (CRUD operations)
│   └── activityAPI (get activities)
│
└── socket.js   - Socket.IO client
    ├── Connection management
    ├── Event listeners
    ├── Real-time sync handlers
```

### 4. **API Layer (Backend)**
- **Framework**: Express.js
- **HTTP Method**: RESTful API (GET, POST, PUT, DELETE)
- **Response Format**: JSON

**Endpoints Structure**:
```
/api/auth      - Authentication endpoints
/api/boards    - Board management
/api/lists     - List management
/api/tasks     - Task management & search
```

### 5. **Data Processing Layer (Middleware)**
- **Authentication**: JWT validation
- **Authorization**: Access control checks
- **Validation**: Input validation with express-validator
- **Logging**: Activity logging on data changes

**Middleware Functions**:
```javascript
- authMiddleware()    - Verify JWT token
- validateInput()     - Validate request body
- errorHandler()      - Centralized error handling
```

### 6. **Persistence Layer (Database)**
- **Database**: MongoDB
- **ODM**: Mongoose
- **Indexing**: On frequently queried fields

**Database Collections**:

#### Users Collection
```javascript
{
  _id: ObjectId,
  username: String (unique),
  email: String (unique),
  password: String (hashed),
  avatar: String,
  createdAt: Date
}
```

#### Boards Collection
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  owner: ObjectId (ref: User),
  members: [ObjectId] (ref: User),
  background: String,
  createdAt: Date,
  updatedAt: Date
}
```

#### Lists Collection
```javascript
{
  _id: ObjectId,
  title: String,
  board: ObjectId (ref: Board),
  position: Number,
  createdAt: Date,
  updatedAt: Date
}
```

#### Tasks Collection
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  list: ObjectId (ref: List),
  board: ObjectId (ref: Board),
  assignedTo: [ObjectId] (ref: User),
  position: Number,
  labels: [{color, text}],
  dueDate: Date,
  completed: Boolean,
  createdBy: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

#### Activities Collection
```javascript
{
  _id: ObjectId,
  board: ObjectId (ref: Board),
  user: ObjectId (ref: User),
  action: String (enum),
  entity: String (enum),
  entityId: ObjectId,
  details: Mixed,
  createdAt: Date
}
```

---

## Design Patterns

### 1. **MVC Pattern (Backend)**
- **Models**: Mongoose schemas (User, Board, List, Task, Activity)
- **Views**: JSON responses via Express
- **Controllers**: Route handlers

### 2. **Component-Based Architecture (Frontend)**
- Modular, reusable React components
- Smart (container) and dumb (presentational) components
- Props-based communication

### 3. **Flux Pattern (State Management)**
- Zustand store maintains single source of truth
- Actions modify state immutably
- Components subscribe to store updates

### 4. **Observer Pattern (Real-time Updates)**
- Socket.IO emits events from server
- Clients listen and update state
- Multiple users see changes in real-time

### 5. **Middleware Pattern (Backend)**
- Express middleware for cross-cutting concerns
- Authentication, validation, logging

### 6. **Repository Pattern (Data Access)**
- Mongoose models as data repositories
- Centralized database access logic

---

## Data Flow

### 1. **User Authentication Flow**
```
User Registration:
1. User fills registration form
2. Frontend sends POST /api/auth/register (plaintext password)
3. Backend validates input
4. Backend hashes password with bcrypt
5. Backend creates user in MongoDB
6. Backend generates JWT token
7. Frontend receives token and stores in localStorage
8. Frontend redirects to dashboard

User Login:
1. User enters credentials
2. Frontend sends POST /api/auth/login
3. Backend queries user by email
4. Backend compares password hash
5. Backend generates JWT if match
6. Frontend stores JWT and sets Authorization header
```

### 2. **Create Task Flow**
```
1. User clicks "Add Task"
2. CreateTaskModal opens
3. User enters title, description, selects users
4. Frontend sends POST /api/tasks
5. Backend validates input
6. Backend creates task in MongoDB
7. Backend logs activity
8. Backend broadcasts 'task-created' event via Socket.IO
9. All connected users receive update
10. Frontend receives Socket event
11. Frontend updates Zustand store
12. Component re-renders with new task
```

### 3. **Drag & Drop Task Flow**
```
1. User drags task card
2. react-beautiful-dnd handles drag
3. On drop, frontend calls taskAPI.moveTask()
4. Backend updates task.list and task.position
5. Backend logs activity
6. Backend broadcasts 'task-moved' event
7. All users see updated board layout
8. Zustand store updates task position
```

### 4. **Real-time Collaboration Flow**
```
User A:
1. Creates a new task
2. Socket event 'task-created' emitted to board room

User B (same board):
1. Receives 'task-created' event from Socket.IO
2. Socket listener in socket.js triggers
3. Updates Zustand store with new task
4. Component automatically re-renders
5. Sees the new task instantly
```

---

## Real-time Communication

### Socket.IO Board Rooms
```javascript
// User joins board
socket.emit('join-board', { boardId: '123' })
// Server adds user to room: 'board-123'

// Broadcast to all users in board
io.to(`board-${boardId}`).emit('task-created', data)

// User leaves board
socket.emit('leave-board', { boardId: '123' })
```

### Event Flow
```
Frontend → Backend (Client emits):
- join-board
- leave-board

Backend → Frontend (Server broadcasts):
- activity-logged       (activity history updated)
- member-added          (member joined board)
- member-removed        (member left board)
- task-moved           (task position changed)
- (Others propagated via store updates)
```

---

## Authentication & Security

### JWT Token Flow
```
1. User registers/logs in
2. Backend generates JWT: header.payload.signature
3. Frontend stores JWT in localStorage
4. On each API request, Frontend includes: "Authorization: Bearer <token>"
5. Backend authMiddleware verifies token signature
6. If valid, route handler executes
7. If invalid, returns 401 Unauthorized
```

### Security Features
- **Password Hashing**: bcryptjs (salt rounds: 10)
- **JWT Expiration**: Configurable per deployment
- **Input Validation**: express-validator on all routes
- **CORS Configuration**: Allows frontend domain only
- **XSS Protection**: React escapes all rendered data

---

## Scalability Considerations

### Current Architecture
- Single Express server (stateless)
- Direct JWT validation
- In-memory Socket.IO storage

### Future Scalability Options
```
1. Database Optimization
   - Add MongoDB indexes on frequently queried fields
   - Implement query optimization
   - Connection pooling

2. Caching Layer
   - Redis for session management
   - Cache frequently accessed data (boards, user lists)

3. API Rate Limiting
   - Implement rate limiter middleware
   - Prevent abuse and DDoS

4. Load Balancing
   - Run multiple Express instances
   - Socket.IO adapter for distributed systems (Redis)
   - Sticky sessions for Socket.IO

5. Monitoring & Logging
   - Add winston/morgan for logging
   - APM tools (New Relic, DataDog)
   - Error tracking (Sentry)

6. CDN for Static Assets
   - Serve frontend build from CDN
   - Reduce server load

7. Search Optimization
   - Elasticsearch for advanced search
   - Full-text search capabilities
```

---

## Performance Optimization

1. **Frontend Optimization**
   - Code splitting with React.lazy
   - Pagination (20 tasks per page)
   - Debounced search (300ms)
   - Memoization where needed

2. **Backend Optimization**
   - Database indexing on `_id`, `board`, `user`, `email`
   - Query population selective
   - Pagination on search endpoint
   - Activity logging asynchronous

3. **Network Optimization**
   - Vite bundling for optimal build
   - Gzip compression (Express)
   - WebSocket reduces overhead vs HTTP polling

4. **Real-time Optimization**
   - Socket.IO room-based messaging (not broadcast all)
   - Only relevant users get updates
   - Automatic reconnection with exponential backoff

---

## Error Handling

### Frontend
- Try-catch in async functions
- Toast notifications for user feedback
- Error state in modals
- Fallback UI on errors

### Backend
- Express error middleware catches errors
- Validation errors return 400
- Auth errors return 401
- Not found errors return 404
- Server errors return 500
- Structured error responses

---

## Testing

### Unit Testing
- API endpoint testing with Supertest
- Model validation testing
- Input validation testing

### Integration Testing
- Full flow testing (create board → list → task)
- Member management testing
- Search functionality testing

### Coverage
- 30+ comprehensive test cases
- Core API endpoints covered
- Real-time synchronization tested

---

## Deployment Architecture

### Development
```
Frontend: localhost:3000 (Vite dev server)
Backend: localhost:5000 (Node.js)
Database: MongoDB local instance
```

### Production
```
Frontend: Built files served by CDN or Express static
Backend: Node.js on production server
Database: MongoDB Atlas or self-managed
SSL/TLS: Enable HTTPS
Environment: Separate .env configuration
```

---

## Summary

This architecture provides:
- ✅ **Real-time collaboration** via Socket.IO
- ✅ **Scalable design** with stateless API
- ✅ **Secure authentication** with JWT
- ✅ **Responsive frontend** with Zustand state
- ✅ **Persistent storage** with MongoDB
- ✅ **Comprehensive testing** of core functionality
- ✅ **Modular components** for maintainability
- ✅ **Activity logging** for audit trail

The system is production-ready and can handle concurrent users with real-time synchronization.
