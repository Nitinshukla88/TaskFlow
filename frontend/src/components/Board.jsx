import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { boardAPI, listAPI, taskAPI } from '../services/api'
import { useBoardStore } from '../store/store'
import socketService from '../services/socket'
import toast from 'react-hot-toast'
import TaskCard from './TaskCard'
import CreateListModal from './CreateListModal'
import CreateTaskModal from './CreateTaskModal'
import TaskDetailModal from './TaskDetailModal'

const Board = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [showCreateList, setShowCreateList] = useState(false)
  const [showCreateTask, setShowCreateTask] = useState(false)
  const [selectedListId, setSelectedListId] = useState(null)
  const [selectedTaskId, setSelectedTaskId] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  const { currentBoard, lists, tasks, setBoardData, addList, addTask, updateTask, removeTask, reorderTasks } = useBoardStore()

  useEffect(() => {
    loadBoard()
    socketService.joinBoard(id)
    setupRealtimeListeners()

    return () => {
      socketService.leaveBoard(id)
      socketService.removeAllListeners()
    }
  }, [id])

  const loadBoard = async () => {
    try {
      const { data } = await boardAPI.getOne(id)
      setBoardData(data.board, data.lists, data.tasks)
    } catch (error) {
      toast.error('Failed to load board')
      navigate('/')
    } finally {
      setLoading(false)
    }
  }

  const setupRealtimeListeners = () => {
    socketService.onListCreated((data) => {
      if (data.boardId === id) addList(data.list)
    })

    socketService.onListDeleted((data) => {
      if (data.boardId === id) useBoardStore.getState().removeList(data.listId)
    })

    socketService.onTaskCreated((data) => {
      if (data.boardId === id) addTask(data.task)
    })

    socketService.onTaskUpdated((data) => {
      if (data.boardId === id) updateTask(data.task._id, data.task)
    })

    socketService.onTaskDeleted((data) => {
      if (data.boardId === id) removeTask(data.taskId)
    })

    socketService.onTaskMoved((data) => {
      if (data.boardId === id) {
        useBoardStore.getState().moveTask(data.taskId, data.listId, data.position)
      }
    })
  }

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId, type } = result

    if (!destination) return
    if (destination.droppableId === source.droppableId && destination.index === source.index) return

    if (type === 'task') {
      const sourceListId = source.droppableId
      const destListId = destination.droppableId

      // Optimistic update
      const newTasks = Array.from(tasks)
      const taskIndex = newTasks.findIndex(t => t._id === draggableId)
      const [movedTask] = newTasks.splice(taskIndex, 1)
      
      movedTask.list = destListId
      movedTask.position = destination.index

      const destTasks = newTasks
        .filter(t => t.list === destListId)
        .sort((a, b) => a.position - b.position)
      
      destTasks.splice(destination.index, 0, movedTask)
      destTasks.forEach((task, index) => {
        task.position = index
      })

      reorderTasks(newTasks)

      // Persist to server
      try {
        await taskAPI.move(draggableId, {
          listId: destListId,
          position: destination.index
        })

        socketService.emitTaskMoved({
          boardId: id,
          taskId: draggableId,
          listId: destListId,
          position: destination.index
        })
      } catch (error) {
        toast.error('Failed to move task')
        loadBoard()
      }
    }
  }

  const handleCreateTask = (listId) => {
    setSelectedListId(listId)
    setShowCreateTask(true)
  }

  const handleTaskClick = (taskId) => {
    setSelectedTaskId(taskId)
  }

  const handleDeleteList = async (listId) => {
    if (!confirm('Delete this list and all its tasks?')) return

    try {
      await listAPI.delete(listId)
      useBoardStore.getState().removeList(listId)
      socketService.emitListDeleted({ boardId: id, listId })
      toast.success('List deleted')
    } catch (error) {
      toast.error('Failed to delete list')
    }
  }

  const getTasksByList = (listId) => {
    return tasks
      .filter(task => task.list === listId)
      .sort((a, b) => a.position - b.position)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner" />
      </div>
    )
  }

  return (
    <div 
      className="min-h-screen flex flex-col relative"
      style={{ 
        background: `linear-gradient(135deg, ${currentBoard?.background}dd 0%, ${currentBoard?.background}55 100%)` 
      }}
    >
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Header */}
      <header className="relative z-10 bg-black/20 backdrop-blur-md border-b border-white/10 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/')}
              className="text-white hover:bg-white/10 p-2 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="text-2xl font-bold text-white drop-shadow-lg">
              {currentBoard?.title}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <input
              type="search"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 w-64"
            />
          </div>
        </div>
      </header>

      {/* Board Content */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="relative z-10 flex-1 overflow-x-auto p-6">
          <div className="flex gap-6 min-h-full">
            {/* Lists */}
            {lists.map((list) => (
              <div key={list._id} className="flex-shrink-0 w-80">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4">
                  {/* List Header */}
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/20">
                    <h3 className="font-semibold text-white text-lg">
                      {list.title}
                    </h3>
                    <button
                      onClick={() => handleDeleteList(list._id)}
                      className="text-white/60 hover:text-white hover:bg-white/10 p-1.5 rounded transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>

                  {/* Tasks */}
                  <Droppable droppableId={list._id} type="task">
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`space-y-3 min-h-[100px] rounded-lg p-2 transition-colors ${
                          snapshot.isDraggingOver ? 'bg-white/5' : ''
                        }`}
                      >
                        {getTasksByList(list._id).map((task, index) => (
                          <Draggable key={task._id} draggableId={task._id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                style={provided.draggableProps.style}
                              >
                                <TaskCard
                                  task={task}
                                  onClick={() => handleTaskClick(task._id)}
                                  isDragging={snapshot.isDragging}
                                />
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>

                  {/* Add Task Button */}
                  <button
                    onClick={() => handleCreateTask(list._id)}
                    className="w-full mt-3 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <span className="text-xl">+</span>
                    Add Task
                  </button>
                </div>
              </div>
            ))}

            {/* Add List Button */}
            <div className="flex-shrink-0">
              <button
                onClick={() => setShowCreateList(true)}
                className="w-80 h-full min-h-[120px] bg-white/10 hover:bg-white/20 backdrop-blur-md border-2 border-dashed border-white/30 rounded-xl text-white font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <span className="text-2xl">+</span>
                Add List
              </button>
            </div>
          </div>
        </div>
      </DragDropContext>

      {/* Modals */}
      {showCreateList && (
        <CreateListModal
          boardId={id}
          onClose={() => setShowCreateList(false)}
          onCreated={(list) => {
            addList(list)
            socketService.emitListCreated({ boardId: id, list })
          }}
        />
      )}

      {showCreateTask && (
        <CreateTaskModal
          listId={selectedListId}
          onClose={() => {
            setShowCreateTask(false)
            setSelectedListId(null)
          }}
          onCreated={(task) => {
            addTask(task)
            socketService.emitTaskCreated({ boardId: id, task })
          }}
        />
      )}

      {selectedTaskId && (
        <TaskDetailModal
          taskId={selectedTaskId}
          onClose={() => setSelectedTaskId(null)}
          onUpdated={(task) => {
            updateTask(task._id, task)
            socketService.emitTaskUpdated({ boardId: id, task })
          }}
          onDeleted={(taskId) => {
            removeTask(taskId)
            socketService.emitTaskDeleted({ boardId: id, taskId })
          }}
        />
      )}
    </div>
  )
}

export default Board