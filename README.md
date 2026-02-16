# Real-Time Task Collaboration Platform

A lightweight Trello/Notion hybrid with real-time collaboration features built with React and Node.js.

## Features

- User authentication (signup/login)
- Create and manage boards
- Create lists within boards
- Create, update, and delete tasks
- Drag and drop tasks across lists
- Assign users to tasks
- Real-time updates using WebSockets
- Activity history tracking
- Search functionality
- Pagination support
- Responsive design

## Tech Stack

### Frontend
- **React 18** - UI framework
- **React Router** - Client-side routing
- **Zustand** - State management
- **React Beautiful DnD** - Drag and drop
- **Socket.IO Client** - Real-time communication
- **Axios** - HTTP client
- **Vite** - Build tool

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **Socket.IO** - WebSocket server
- **JWT** - Authentication
- **bcryptjs** - Password hashing

## Project Structure

```
task-collab-platform/
├── backend/
│   ├── models/           # Mongoose schemas
│   │   ├── User.js
│   │   ├── Board.js
│   │   ├── List.js
│   │   ├── Task.js
│   │   └── Activity.js
│   ├── routes/           # API endpoints
│   │   ├── auth.js
│   │   ├── boards.js
│   │   ├── lists.js
│   │   └── tasks.js
│   ├── middleware/       # Custom middleware
│   │   └── auth.js
│   ├── tests/           # Test files
│   │   └── api.test.js
│   ├── server.js        # Entry point
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/      # React components
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── Board.jsx
    │   │   ├── TaskCard.jsx
    │   │   └── ...
    │   ├── services/        # API & Socket services
    │   │   ├── api.js
    │   │   └── socket.js
    │   ├── store/          # State management
    │   │   └── store.js
    │   ├── styles/         # Global styles
    │   │   └── global.css
    │   ├── App.jsx         # Main app component
    │   └── main.jsx        # Entry point
    ├── index.html
    ├── vite.config.js
    └── package.json
```

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/task-collab-db
JWT_SECRET=your_super_secret_jwt_key_change_this
NODE_ENV=development
```

5. Start MongoDB:
```bash
# If using local MongoDB
mongod

# Or if using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

6. Start the backend server:
```bash
npm run dev
```

Backend will run on http://localhost:5000

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file (optional):
```bash
# Create .env file with:
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

4. Start the development server:
```bash
npm run dev
```

Frontend will run on http://localhost:3000

## Usage

1. **Register a new account** at http://localhost:3000/register
2. **Login** with your credentials
3. **Create a board** from the dashboard
4. **Add lists** to organize your tasks
5. **Create tasks** within lists
6. **Drag and drop** tasks between lists
7. **Click on tasks** to view/edit details
8. **Invite members** to collaborate (optional)

## API Documentation

### Authentication Endpoints

#### Register User
```
POST /api/auth/register
Body: { username, email, password }
Response: { user, token }
```

#### Login User
```
POST /api/auth/login
Body: { email, password }
Response: { user, token }
```

#### Get Current User
```
GET /api/auth/me
Headers: Authorization: Bearer <token>
Response: { user }
```

### Board Endpoints

#### Get All Boards
```
GET /api/boards
Headers: Authorization: Bearer <token>
Response: { boards }
```

#### Get Single Board
```
GET /api/boards/:id
Headers: Authorization: Bearer <token>
Response: { board, lists, tasks }
```

#### Create Board
```
POST /api/boards
Headers: Authorization: Bearer <token>
Body: { title, description, background }
Response: { board }
```

#### Update Board
```
PUT /api/boards/:id
Headers: Authorization: Bearer <token>
Body: { title?, description?, background? }
Response: { board }
```

#### Delete Board
```
DELETE /api/boards/:id
Headers: Authorization: Bearer <token>
Response: { message }
```

### List Endpoints

#### Create List
```
POST /api/lists
Headers: Authorization: Bearer <token>
Body: { title, boardId }
Response: { list }
```

#### Update List
```
PUT /api/lists/:id
Headers: Authorization: Bearer <token>
Body: { title?, position? }
Response: { list }
```

#### Delete List
```
DELETE /api/lists/:id
Headers: Authorization: Bearer <token>
Response: { message }
```

### Task Endpoints

#### Create Task
```
POST /api/tasks
Headers: Authorization: Bearer <token>
Body: { title, description?, listId }
Response: { task }
```

#### Update Task
```
PUT /api/tasks/:id
Headers: Authorization: Bearer <token>
Body: { title?, description?, assignedTo?, completed? }
Response: { task }
```

#### Move Task
```
PUT /api/tasks/:id/move
Headers: Authorization: Bearer <token>
Body: { listId, position }
Response: { task }
```

#### Delete Task
```
DELETE /api/tasks/:id
Headers: Authorization: Bearer <token>
Response: { message }
```

#### Search Tasks
```
GET /api/tasks/board/:boardId/search?q=query&page=1&limit=20
Headers: Authorization: Bearer <token>
Response: { tasks, currentPage, totalPages, total }
```

## Real-Time Events

### Socket.IO Events

#### Client → Server
- `join-board` - Join board room
- `leave-board` - Leave board room
- `board-updated` - Board was updated
- `list-created` - New list created
- `list-updated` - List updated
- `list-deleted` - List deleted
- `task-created` - New task created
- `task-updated` - Task updated
- `task-deleted` - Task deleted
- `task-moved` - Task moved to different list

#### Server → Client
- Same events as above (broadcasted to other users)

## Database Schema

### User Schema
```javascript
{
  username: String (unique, required),
  email: String (unique, required),
  password: String (hashed, required),
  avatar: String,
  createdAt: Date
}
```

### Board Schema
```javascript
{
  title: String (required),
  description: String,
  owner: ObjectId (User),
  members: [ObjectId (User)],
  background: String,
  createdAt: Date,
  updatedAt: Date
}
```

### List Schema
```javascript
{
  title: String (required),
  board: ObjectId (Board),
  position: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Task Schema
```javascript
{
  title: String (required),
  description: String,
  list: ObjectId (List),
  board: ObjectId (Board),
  assignedTo: [ObjectId (User)],
  position: Number,
  labels: [{ color, text }],
  dueDate: Date,
  completed: Boolean,
  createdBy: ObjectId (User),
  createdAt: Date,
  updatedAt: Date
}
```

### Activity Schema
```javascript
{
  board: ObjectId (Board),
  user: ObjectId (User),
  action: String (enum),
  entity: String (enum),
  entityId: ObjectId,
  details: Mixed,
  createdAt: Date
}
```

## Testing

Run backend tests:
```bash
cd backend
npm test
```

<!-- ## Production Build

### Backend
```bash
cd backend
npm start
```

### Frontend
```bash
cd frontend
npm run build
npm run preview
``` -->

<!-- ## Scalability Considerations

1. **Database Optimization**
   - Indexed fields on frequently queried data
   - Optimized queries with proper projections
   - Connection pooling configured

2. **Caching Strategy**
   - Redis can be added for session management
   - API response caching for read-heavy operations

3. **Load Balancing**
   - Socket.IO sticky sessions required
   - Redis adapter for multi-server Socket.IO

4. **Horizontal Scaling**
   - Stateless API design
   - MongoDB sharding for large datasets
   - CDN for static assets

5. **Performance Optimization**
   - Lazy loading of components
   - Debounced search queries
   - Pagination on all list endpoints
   - WebSocket connection pooling

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- CORS configuration
- Rate limiting (can be added)
- XSS protection (React default) -->

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - feel free to use this project for learning or production use.

## Support

For issues or questions, please create an issue in the repository.
