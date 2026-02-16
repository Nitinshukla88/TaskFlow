import { useState } from 'react'
import { boardAPI, authAPI } from '../services/api'
import toast from 'react-hot-toast'

const MemberPanel = ({ board, isOpen, onClose, onMemberAdded, onMemberRemoved }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [adding, setAdding] = useState(false)

  const searchUsers = async (query) => {
    if (query.length < 1) {
      setSearchResults([])
      return
    }

    setLoading(true)
    try {
      const { data } = await authAPI.searchUsers(query)
      const filtered = data.users.filter(
        user => !board.members.some(m => m._id === user._id)
      )
      setSearchResults(filtered)
    } catch (error) {
      toast.error('Failed to search users')
    } finally {
      setLoading(false)
    }
  }

  const handleSearchChange = (e) => {
    const value = e.target.value
    setSearchTerm(value)
    searchUsers(value)
  }

  const handleAddMember = async (userId) => {
    setAdding(true)
    try {
      const { data } = await boardAPI.addMember(board._id, userId)
      toast.success('Member added!')
      onMemberAdded(data.board.members)
      setSearchTerm('')
      setSearchResults([])
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to add member')
    } finally {
      setAdding(false)
    }
  }

  const handleRemoveMember = async (userId) => {
    if (!confirm('Remove this member from the board?')) return

    try {
      const { data } = await boardAPI.removeMember(board._id, userId)
      toast.success('Member removed!')
      onMemberRemoved(data.board.members)
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to remove member')
    }
  }

  const getInitials = (name) => {
    return name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'U'
  }

  const isOwner = (userId) => board.owner._id === userId

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center">
      <div className="bg-dark-200 rounded-xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col border border-gray-700">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold">Board Members</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
              Add Members
            </h3>
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="input w-full"
            />

            {searchResults.length > 0 && (
              <div className="bg-dark-100 border border-gray-700 rounded-lg max-h-48 overflow-y-auto">
                {searchResults.map((user) => (
                  <div
                    key={user._id}
                    className="flex items-center justify-between p-3 border-b border-gray-700 last:border-b-0 hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="avatar avatar-sm flex-shrink-0">
                        {getInitials(user.username)}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm text-gray-300 truncate">{user.username}</div>
                        <div className="text-xs text-gray-500 truncate">{user.email}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAddMember(user._id)}
                      disabled={adding}
                      className="btn btn-primary btn-sm flex-shrink-0"
                    >
                      Add
                    </button>
                  </div>
                ))}
              </div>
            )}
            {loading && (
              <div className="flex items-center justify-center py-4">
                <div className="spinner" />
              </div>
            )}
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
              Current Members ({board.members.length})
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {board.members.map((member) => (
                <div
                  key={member._id}
                  className="flex items-center justify-between p-3 bg-white/5 border border-gray-700 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="avatar avatar-sm">
                      {getInitials(member.username)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-gray-300 truncate">{member.username}</div>
                      {isOwner(member._id) && (
                        <div className="text-xs text-primary font-semibold">Owner</div>
                      )}
                    </div>
                  </div>
                  {!isOwner(member._id) && (
                    <button
                      onClick={() => handleRemoveMember(member._id)}
                      className="text-gray-400 hover:text-red-400 p-2 hover:bg-red-400/10 rounded transition-colors"
                      title="Remove member"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MemberPanel
