import { useState, useEffect } from 'react'
import { boardAPI } from '../services/api'
import Pagination from './Pagination'
import toast from 'react-hot-toast'

const ActivityPanel = ({ boardId, isOpen, onClose }) => {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    if (isOpen) {
      loadActivities()
    }
  }, [boardId, isOpen, currentPage])

  const loadActivities = async () => {
    try {
      setLoading(true)
      const { data } = await boardAPI.getActivities(boardId, { page: currentPage, limit: 20 })
      setActivities(data.activities)
      setTotalPages(data.totalPages)
    } catch (error) {
      toast.error('Failed to load activities')
    } finally {
      setLoading(false)
    }
  }

  const getActionLabel = (action) => {
    const labels = {
      board_created: 'Created board',
      board_updated: 'Updated board',
      board_deleted: 'Deleted board',
      list_created: 'Created list',
      list_updated: 'Updated list',
      list_deleted: 'Deleted list',
      task_created: 'Created task',
      task_updated: 'Updated task',
      task_deleted: 'Deleted task',
      task_moved: 'Moved task',
      member_added: 'Added member',
      member_removed: 'Removed member'
    }
    return labels[action] || action
  }

  const getActionIcon = (action) => {
    const icons = {
      board_created: '📋',
      board_updated: '✏️',
      board_deleted: '🗑️',
      list_created: '📝',
      list_updated: '✏️',
      list_deleted: '🗑️',
      task_created: '✨',
      task_updated: '📝',
      task_deleted: '❌',
      task_moved: '🔄',
      member_added: '👤',
      member_removed: '👥'
    }
    return icons[action] || '•'
  }

  const getInitials = (name) => {
    return name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'U'
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center">
      <div className="bg-dark-200 rounded-xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col border border-gray-700">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold">Activity History</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="spinner" />
            </div>
          ) : activities.length > 0 ? (
            <div className="space-y-4">
              {activities.map((activity) => (
                <div
                  key={activity._id}
                  className="flex gap-4 p-4 bg-white/5 border border-gray-700 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <div className="text-2xl flex-shrink-0">
                    {getActionIcon(activity.action)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-white">
                            {activity.user?.username || 'Unknown'}
                          </span>
                          <span className="text-gray-400">
                            {getActionLabel(activity.action)}
                          </span>
                        </div>
                        {activity.details?.title && (
                          <div className="text-sm text-gray-400 mt-1 break-words">
                            <span className="text-white font-medium">{activity.details.title}</span>
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 flex-shrink-0">
                        {formatTime(activity.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <div className="text-4xl mb-4">📭</div>
              <p>No activity yet</p>
            </div>
          )}
        </div>

        {activities.length > 0 && (
          <div className="border-t border-gray-700 p-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              loading={loading}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default ActivityPanel
