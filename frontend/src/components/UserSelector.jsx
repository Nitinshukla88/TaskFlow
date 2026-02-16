import { useState, useEffect, useRef } from 'react'
import { authAPI } from '../services/api'

const UserSelector = ({ selectedUsers = [], onUsersChange, boardMembers = [] }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [users, setUsers] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const containerRef = useRef(null)

  // Search for users when typing
  useEffect(() => {
    const searchUsers = async () => {
      if (searchTerm.length < 1) {
        setUsers([])
        return
      }

      setLoading(true)
      try {
        const { data } = await authAPI.searchUsers(searchTerm)
        setUsers(data.users || [])
      } catch (error) {
        console.error('Search error:', error)
        setUsers([])
      } finally {
        setLoading(false)
      }
    }

    const timer = setTimeout(searchUsers, 300)
    return () => clearTimeout(timer)
  }, [searchTerm])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const getInitials = (name) => {
    return name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?'
  }

  const toggleUser = (user) => {
    const isSelected = selectedUsers.some(u => u._id === user._id)
    if (isSelected) {
      onUsersChange(selectedUsers.filter(u => u._id !== user._id))
    } else {
      onUsersChange([...selectedUsers, user])
    }
  }

  const removeUser = (userId) => {
    onUsersChange(selectedUsers.filter(u => u._id !== userId))
  }

  const isUserSelected = (userId) => selectedUsers.some(u => u._id === userId)

  // Filter out already selected users and board members not in results
  const availableUsers = users.filter(u => !isUserSelected(u._id))

  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-gray-400 uppercase tracking-wide">
        Assign Users (Optional)
      </label>

      {/* Selected Users */}
      {selectedUsers.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3 p-3 bg-dark-100 rounded-lg border border-gray-700">
          {selectedUsers.map((user) => (
            <div
              key={user._id}
              className="flex items-center gap-2 px-3 py-2 bg-primary/20 border border-primary rounded-lg text-sm"
            >
              <div className="avatar avatar-xs">
                {getInitials(user.username)}
              </div>
              <span className="text-gray-300">{user.username}</span>
              <button
                type="button"
                onClick={() => removeUser(user._id)}
                className="ml-1 text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Dropdown */}
      <div className="relative" ref={containerRef}>
        <input
          type="text"
          placeholder="Search users to assign..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          className="input w-full"
        />

        {isOpen && (searchTerm.length > 0 || availableUsers.length > 0) && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-dark-200 border border-gray-700 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-400">
                <div className="spinner" />
                Searching...
              </div>
            ) : availableUsers.length > 0 ? (
              availableUsers.map((user) => (
                <button
                  key={user._id}
                  type="button"
                  onClick={() => {
                    toggleUser(user)
                    setSearchTerm('')
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-dark-100 border-b border-gray-700 last:border-b-0 transition-colors flex items-center gap-3"
                >
                  <div className="avatar avatar-sm">
                    {getInitials(user.username)}
                  </div>
                  <div className="flex-1">
                    <div className="text-gray-300 font-medium">{user.username}</div>
                    <div className="text-xs text-gray-500">{user.email}</div>
                  </div>
                  {isUserSelected(user._id) && (
                    <span className="text-primary">✓</span>
                  )}
                </button>
              ))
            ) : searchTerm.length > 0 ? (
              <div className="p-4 text-center text-gray-400">
                No users found
              </div>
            ) : null}
          </div>
        )}
      </div>

      <p className="text-xs text-gray-500">
        Search and select users to assign this task to them
      </p>
    </div>
  )
}

export default UserSelector
