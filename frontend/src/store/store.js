import { create } from 'zustand'

export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  
  setAuth: (user, token) => {
    localStorage.setItem('user', JSON.stringify(user))
    localStorage.setItem('token', token)
    set({ user, token, isAuthenticated: true })
  },
  
  logout: () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    set({ user: null, token: null, isAuthenticated: false })
  }
}))

export const useBoardStore = create((set) => ({
  boards: [],
  currentBoard: null,
  lists: [],
  tasks: [],
  loading: false,

  setBoards: (boards) => set({ boards }),
  setCurrentBoard: (board) => set({ currentBoard: board }),
  setBoardData: (board, lists, tasks) => set({ currentBoard: board, lists, tasks }),
  
  addBoard: (board) => set((state) => ({ boards: [board, ...state.boards] })),
  updateBoard: (boardId, updates) => set((state) => ({
    boards: state.boards.map(b => b._id === boardId ? { ...b, ...updates } : b),
    currentBoard: state.currentBoard?._id === boardId ? { ...state.currentBoard, ...updates } : state.currentBoard
  })),
  removeBoard: (boardId) => set((state) => ({
    boards: state.boards.filter(b => b._id !== boardId),
    currentBoard: state.currentBoard?._id === boardId ? null : state.currentBoard
  })),

  addList: (list) => set((state) => ({ lists: [...state.lists, list] })),
  updateList: (listId, updates) => set((state) => ({
    lists: state.lists.map(l => l._id === listId ? { ...l, ...updates } : l)
  })),
  removeList: (listId) => set((state) => ({
    lists: state.lists.filter(l => l._id !== listId),
    tasks: state.tasks.filter(t => t.list !== listId)
  })),

  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
  updateTask: (taskId, updates) => set((state) => ({
    tasks: state.tasks.map(t => t._id === taskId ? { ...t, ...updates } : t)
  })),
  removeTask: (taskId) => set((state) => ({
    tasks: state.tasks.filter(t => t._id !== taskId)
  })),
  moveTask: (taskId, newListId, newPosition) => set((state) => ({
    tasks: state.tasks.map(t => t._id === taskId ? { ...t, list: newListId, position: newPosition } : t)
  })),
  reorderTasks: (newTasks) => set({ tasks: newTasks }),

  setLoading: (loading) => set({ loading })
}))