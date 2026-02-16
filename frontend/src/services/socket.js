import { io } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'

class SocketService {
  constructor() {
    this.socket = null
  }

  connect(token) {
    if (this.socket?.connected) return

    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling']
    })

    this.socket.on('connect', () => console.log('Socket connected'))
    this.socket.on('disconnect', () => console.log('Socket disconnected'))
    this.socket.on('error', (error) => console.error('Socket error:', error))
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  joinBoard(boardId) {
    this.socket?.emit('join-board', boardId)
  }

  leaveBoard(boardId) {
    this.socket?.emit('leave-board', boardId)
  }

  emitBoardUpdated(data) {
    this.socket?.emit('board-updated', data)
  }

  onBoardUpdated(callback) {
    this.socket?.on('board-updated', callback)
  }

  emitListCreated(data) {
    this.socket?.emit('list-created', data)
  }

  emitListUpdated(data) {
    this.socket?.emit('list-updated', data)
  }

  emitListDeleted(data) {
    this.socket?.emit('list-deleted', data)
  }

  onListCreated(callback) {
    this.socket?.on('list-created', callback)
  }

  onListUpdated(callback) {
    this.socket?.on('list-updated', callback)
  }

  onListDeleted(callback) {
    this.socket?.on('list-deleted', callback)
  }

  emitTaskCreated(data) {
    this.socket?.emit('task-created', data)
  }

  emitTaskUpdated(data) {
    this.socket?.emit('task-updated', data)
  }

  emitTaskDeleted(data) {
    this.socket?.emit('task-deleted', data)
  }

  emitTaskMoved(data) {
    this.socket?.emit('task-moved', data)
  }

  onTaskCreated(callback) {
    this.socket?.on('task-created', callback)
  }

  onTaskUpdated(callback) {
    this.socket?.on('task-updated', callback)
  }

  onTaskDeleted(callback) {
    this.socket?.on('task-deleted', callback)
  }

  onTaskMoved(callback) {
    this.socket?.on('task-moved', callback)
  }

  emitMemberAdded(data) {
    this.socket?.emit('member-added', data)
  }

  onMemberAdded(callback) {
    this.socket?.on('member-added', callback)
  }

  emitMemberRemoved(data) {
    this.socket?.emit('member-removed', data)
  }

  onMemberRemoved(callback) {
    this.socket?.on('member-removed', callback)
  }

  onActivityLogged(callback) {
    this.socket?.on('activity-logged', callback)
  }

  removeAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners()
    }
  }
}

export default new SocketService()