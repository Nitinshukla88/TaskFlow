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

## Quick Start with Demo Credentials

To quickly test the application without creating accounts:

### Demo Account 1
- **Email**: demo1@example.com
- **Password**: Demo@123

### Demo Account 2
- **Email**: demo2@example.com
- **Password**: Demo@123

**Steps**:
1. Start backend: `cd backend && npm run dev`
2. Start frontend: `cd frontend && npm run dev`
3. Go to http://localhost:3000/login
4. Use demo credentials above
5. Create a board and invite the other demo user

> **Note**: Demo accounts use demo data. New accounts can be created via the Register page.

---

## Architecture

For detailed architecture explanation, data flow diagrams, design patterns, and scalability considerations, see [ARCHITECTURE.md](./ARCHITECTURE.md).

**Quick summary**:
- Frontend: React SPA with Zustand state management
- Backend: Express.js REST API with Socket.IO real-time updates
- Database: MongoDB for persistent storage
- Real-time: WebSocket-based collaboration
- Authentication: JWT-based with bcrypt password hashing

---

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

> **Note**: See `.env.example` for all available configuration options and MongoDB Atlas setup.

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

For comprehensive API documentation including all endpoints, request/response examples, error codes, and WebSocket events, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md).

### Quick API Reference

#### Authentication Endpoints

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
Body: { title, description?, listId, assignedTo? }
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

> **Full documentation**: See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for detailed request/response examples and all error codes.

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

## Assumptions & Trade-offs

### Assumptions

1. **Single Server Deployment**
   - Assumes deployment on single server initially
   - Socket.IO doesn't require Redis adapter yet
   - Suitable for teams up to 100-200 concurrent users

2. **MongoDB Local/Atlas Access**
   - Assumes MongoDB is accessible (local or Atlas)
   - Network access from backend to MongoDB available

3. **Synchronous Activity Logging**
   - Activity logging happens before response sent
   - Ensures consistency but slight latency impact

4. **JWT Token Lifetime**
   - Tokens don't expire by default (configurable)
   - Suitable for internal tools, not multi-tenant

5. **Upload Limits**
   - No file upload feature assumed
   - Only text-based task descriptions
   - Easily extensible with multer

### Trade-offs

#### Performance vs. Simplicity
- **Decision**: Simple Zustand store instead of Redux
- **Pro**: Easier to understand and maintain
- **Con**: Less middleware for complex flows
- **Future**: Can migrate to Redux if needed

#### Real-time vs. Scalability
- **Decision**: Direct Socket.IO broadcast to rooms
- **Pro**: Real-time updates for all users
- **Con**: Doesn't scale beyond single server without Redis
- **Future**: Add Redis adapter for multi-server setup

#### Database Flexibility vs. Strong Typing
- **Decision**: MongoDB with loose schema validation
- **Pro**: Flexible, easy to evolve schema
- **Con**: Requires careful validation at application level
- **Future**: Consider TypeScript for better type safety

#### Paginated Lists vs. Infinite Scroll
- **Decision**: Implemented pagination (20 items/page)
- **Pro**: Better performance, clear navigation
- **Con**: Extra clicks to view more
- **Alternative**: Could implement infinite scroll with load-on-scroll

#### JWT Without Refresh Tokens
- **Decision**: Single JWT token without refresh
- **Pro**: Simpler implementation, fewer DB queries
- **Con**: Can't revoke tokens without blacklist
- **Future**: Add refresh token rotation for security

#### Synchronous Search vs. Full-Text Search
- **Decision**: Basic string matching in MongoDB
- **Pro**: Simple, works for small datasets
- **Con**: Slower with large task counts
- **Future**: Use Elasticsearch for advanced search

#### WebSocket Always-On vs. HTTP Polling
- **Decision**: Persistent WebSocket connection
- **Pro**: Real-time updates, less overhead
- **Con**: Server memory per connection
- **Alternative**: Could use HTTP polling for mobile

#### Activity Logging to DB
- **Decision**: Log all activities to database
- **Pro**: Permanent audit trail
- **Con**: Additional DB writes
- **Optimization**: Could archive old activities

#### No File Uploads
- **Decision**: Text-only tasks and descriptions
- **Pro**: Simpler data model, no storage service needed
- **Con**: Can't attach images to tasks
- **Future**: Add file upload with AWS S3 or Cloudinary

#### No Email Notifications
- **Decision**: Real-time UI updates only
- **Pro**: Simpler, no email service dependency
- **Con**: Users must be online to see updates
- **Future**: Add background job queue (Bull, RabbitMQ)

#### Basic Error Handling
- **Decision**: JSON error responses
- **Pro**: Simple, consistent format
- **Con**: Limited error details for debugging
- **Future**: Add structured logging (Winston, Morgan)

#### No Multi-language Support
- **Decision**: English only
- **Pro**: Reduces complexity
- **Con**: Limited geographical reach
- **Future**: Add i18n for international users

#### In-Memory Store vs. Redis Session Store
- **Decision**: In-memory user sessions
- **Pro**: No external dependency
- **Con**: Sessions lost on server restart
- **Future**: Use Redis for production

#### Drag-Drop only UI
- **Decision**: Drag-drop as primary task organization
- **Pro**: Intuitive, visual
- **Con**: Mobile users need different UX
- **Future**: Add mobile app or responsive drag-drop

---

## Scalability Roadmap

### Phase 1 (Current - Small Teams)
- ✅ Single server deployment
- ✅ MongoDB single instance
- ✅ Direct Socket.IO broadcast
- ✅ In-memory sessions

### Phase 2 (Growing Teams - 100+ users)
- 🔄 Add Redis for caching
- 🔄 Implement refresh tokens
- 🔄 Add rate limiting
- 🔄 Optimize MongoDB queries

### Phase 3 (Large Organizations - 500+ users)
- 🔄 Multi-server deployment with load balancer
- 🔄 Redis adapter for Socket.IO
- 🔄 MongoDB replication/sharding
- 🔄 Elasticsearch for search
- 🔄 CDN for frontend assets

### Phase 4 (Enterprise)
- 🔄 Kubernetes deployment
- 🔄 Message queue (RabbitMQ/Kafka)
- 🔄 Microservices architecture
- 🔄 Advanced monitoring and logging

---

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

## Deployment & Git

### Pushing to Git Repository

1. **Initialize Git** (if not already done):
```bash
git init
```

2. **Add remote repository**:
```bash
git remote add origin https://github.com/yourusername/task-collab-platform.git
```

3. **Commit changes**:
```bash
git add .
git commit -m "Initial commit: Complete task collaboration platform"
```

4. **Push to repository**:
```bash
git branch -M main
git push -u origin main
```

### Repository Structure for Submission

Ensure your Git repository contains:
```
task-collab-platform/
├── backend/               # Complete backend code
│   ├── src/
│   ├── tests/
│   ├── .env.example      # Environment template
│   ├── package.json
│   └── README.md (optional)
├── frontend/              # Complete frontend code
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── README.md (optional)
├── README.md              # Main project README
├── ARCHITECTURE.md        # Architecture explanation
├── API_DOCUMENTATION.md   # Detailed API docs
├── IMPLEMENTATION_SUMMARY.md (optional) # Implementation details
├── .gitignore             # Git ignore patterns
└── .git/                  # Git repository
```

### Git Best Practices

1. **Create .gitignore to exclude**:
```
node_modules/
.env
.DS_Store
dist/
build/
*.log
```

2. **Use meaningful commit messages**:
```git
✓ Good: git commit -m "feat: add user assignment to tasks"
✗ Bad:  git commit -m "fix stuff"
```

3. **Create meaningful branches** for features:
```bash
git checkout -b feature/user-assignment
git checkout -b fix/search-not-working
```

### Deployment Options

#### Option 1: Heroku (Free tier available)

**Backend Deployment**:
```bash
# Install Heroku CLI
heroku login
heroku create your-app-name
git push heroku main
heroku config:set JWT_SECRET=your_secret_key
heroku config:set MONGODB_URI=your_mongodb_uri
```

**Frontend Deployment** (build and serve):
```bash
# Build frontend
cd frontend && npm run build

# Deploy to Vercel, Netlify, or GitHub Pages
```

#### Option 2: AWS (EC2 + RDS)

**Backend**:
- EC2 instance with Node.js
- Environment variables in `.env`
- PM2 for process management

**Frontend**:
- S3 for static hosting
- CloudFront CDN
- Deploy with: `npm run build` then upload to S3

#### Option 3: Docker + Docker Compose

**Create Dockerfile** for backend:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

**Create docker-compose.yml**:
```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - MONGODB_URI=mongodb://mongo:27017/task-collab-db
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
  mongo:
    image: mongo:5
    ports:
      - "27017:27017"
```

Deploy:
```bash
docker-compose up -d
```

#### Option 4: Railway.app (Simple & Free)

1. Push to GitHub
2. Connect Railway to repository
3. Set environment variables
4. Deploy

---

## Documentation Files

This project includes comprehensive documentation:

| File | Purpose |
|------|---------|
| [README.md](./README.md) | Main project overview and setup |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System design, data flow, patterns |
| [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) | Complete API reference |
| [backend/.env.example](./backend/.env.example) | Environment variables template |

---

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
