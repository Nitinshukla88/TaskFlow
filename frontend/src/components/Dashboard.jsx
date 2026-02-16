import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { boardAPI } from '../services/api'
import { useBoardStore, useAuthStore } from '../store/store'
import toast from 'react-hot-toast'
import CreateBoardModal from './CreateBoardModal'

const Dashboard = () => {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { boards, setBoards } = useBoardStore()
  const { user, logout } = useAuthStore()

  useEffect(() => {
    loadBoards()
  }, [])

  const loadBoards = async () => {
    try {
      const { data } = await boardAPI.getAll()
      setBoards(data.boards)
    } catch (error) {
      toast.error('Failed to load boards')
    } finally {
      setLoading(false)
    }
  }

  const handleBoardClick = (boardId) => {
    navigate(`/board/${boardId}`)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const getInitials = (name) => {
    return name?.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2) || 'U'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="bg-dark-200 border-b border-gray-700 px-6 py-4 sticky top-0 z-50 backdrop-blur-lg bg-dark-200/90">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              TaskFlow
            </span>
          </h2>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="avatar">
                {getInitials(user?.username)}
              </div>
              <span className="text-gray-300 font-medium hidden sm:block">
                {user?.username}
              </span>
            </div>
            <button 
              onClick={handleLogout} 
              className="btn btn-secondary btn-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Your Boards</h1>
            <p className="text-gray-400">Organize and collaborate on your projects</p>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary"
          >
            <span className="text-xl">+</span>
            Create Board
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {boards.map((board) => (
            <div
              key={board._id}
              onClick={() => handleBoardClick(board._id)}
              className="relative overflow-hidden rounded-xl p-6 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl min-h-[180px] flex flex-col"
              style={{ 
                background: `linear-gradient(135deg, ${board.background}dd 0%, ${board.background}88 100%)` 
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              
              <div className="relative z-10 flex-1">
                <h3 className="text-xl font-bold text-white mb-2 drop-shadow-lg">
                  {board.title}
                </h3>
                {board.description && (
                  <p className="text-white/90 text-sm line-clamp-2 drop-shadow">
                    {board.description}
                  </p>
                )}
              </div>

              <div className="relative z-10 flex items-center mt-4">
                <div className="flex -space-x-2">
                  {board.members.slice(0, 3).map((member) => (
                    <div 
                      key={member._id} 
                      className="avatar avatar-sm border-2 border-white/20 shadow-lg"
                      title={member.username}
                    >
                      {getInitials(member.username)}
                    </div>
                  ))}
                  {board.members.length > 3 && (
                    <div className="avatar avatar-sm border-2 border-white/20 shadow-lg bg-dark-100">
                      +{board.members.length - 3}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {boards.length === 0 && (
            <div className="col-span-full">
              <div className="card text-center py-16 border-2 border-dashed border-gray-700">
                <div className="text-6xl mb-4 opacity-50">📋</div>
                <h3 className="text-xl font-semibold mb-2">No boards yet</h3>
                <p className="text-gray-400 mb-6">Create your first board to get started</p>
                <button 
                  onClick={() => setShowCreateModal(true)}
                  className="btn btn-primary"
                >
                  Create Board
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {showCreateModal && (
        <CreateBoardModal
          onClose={() => setShowCreateModal(false)}
          onCreated={loadBoards}
        />
      )}
    </div>
  )
}

export default Dashboard