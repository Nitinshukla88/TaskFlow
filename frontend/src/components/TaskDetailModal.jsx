import { useState, useEffect } from 'react'
import { taskAPI } from '../services/api'
import UserSelector from './UserSelector'
import toast from 'react-hot-toast'

const TaskDetailModal = ({ taskId, onClose, onUpdated, onDeleted }) => {
  const [task, setTask] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editingAssignment, setEditingAssignment] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [assignedUsers, setAssignedUsers] = useState([])

  useEffect(() => {
    loadTask()
  }, [taskId])

  const loadTask = async () => {
    try {
      const { data } = await taskAPI.getOne(taskId)
      setTask(data.task)
      setTitle(data.task.title)
      setDescription(data.task.description || '')
      setAssignedUsers(data.task.assignedTo || [])
    } catch (error) {
      toast.error('Failed to load task')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async () => {
    try {
      const { data } = await taskAPI.update(taskId, { title, description })
      setTask(data.task)
      onUpdated(data.task)
      setEditing(false)
      toast.success('Task updated!')
    } catch (error) {
      toast.error('Failed to update task')
    }
  }

  const handleUpdateAssignment = async () => {
    try {
      const { data } = await taskAPI.update(taskId, {
        assignedTo: assignedUsers.map(u => u._id)
      })
      setTask(data.task)
      onUpdated(data.task)
      setEditingAssignment(false)
      toast.success('Assignment updated!')
    } catch (error) {
      toast.error('Failed to update assignment')
    }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this task?')) return

    try {
      await taskAPI.delete(taskId)
      onDeleted(taskId)
      toast.success('Task deleted!')
      onClose()
    } catch (error) {
      toast.error('Failed to delete task')
    }
  }

  const getInitials = (name) => {
    return name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?'
  }

  if (loading) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
          <div className="spinner" />
        </div>
      </div>
    )
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal max-w-2xl" onClick={(e) => e.stopPropagation()}>
        {editingAssignment ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">Assign Users</h3>
              <button
                onClick={() => setEditingAssignment(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <UserSelector
              selectedUsers={assignedUsers}
              onUsersChange={setAssignedUsers}
            />

            <div className="flex gap-3">
              <button
                onClick={handleUpdateAssignment}
                className="btn btn-primary flex-1"
              >
                Save
              </button>
              <button
                onClick={() => setEditingAssignment(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : editing ? (
          <div className="space-y-6">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input text-2xl font-bold"
              placeholder="Task title"
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add description..."
              className="input min-h-[150px] resize-y"
              rows="6"
            />
            <div className="flex gap-3">
              <button onClick={handleUpdate} className="btn btn-primary flex-1">
                Save Changes
              </button>
              <button onClick={() => setEditing(false)} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <h2 className="text-2xl font-bold text-white flex-1 break-words">
                {task.title}
              </h2>
              <div className="flex gap-2 ml-4">
                <button 
                  onClick={() => setEditing(true)}
                  className="btn btn-secondary btn-sm"
                >
                  Edit
                </button>
                <button 
                  onClick={handleDelete}
                  className="btn btn-danger btn-sm"
                >
                  Delete
                </button>
              </div>
            </div>

            {task.description && (
              <div className="pb-6 border-b border-gray-700">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
                  Description
                </h3>
                <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {task.description}
                </p>
              </div>
            )}

            {task.assignedTo && task.assignedTo.length > 0 && (
              <div className="pb-6 border-b border-gray-700">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
                    Assigned To
                  </h3>
                  <button
                    onClick={() => setEditingAssignment(true)}
                    className="text-xs text-gray-400 hover:text-white transition-colors"
                  >
                    Edit
                  </button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {task.assignedTo.map((user) => (
                    <div
                      key={user._id}
                      className="flex items-center gap-2 px-3 py-2 bg-dark-100 border border-gray-700 rounded-lg"
                    >
                      <div className="avatar avatar-sm">
                        {getInitials(user.username)}
                      </div>
                      <span className="text-gray-300">{user.username}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!task.assignedTo || task.assignedTo.length === 0 && (
              <div className="pb-6 border-b border-gray-700">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
                    Assigned To
                  </h3>
                  <button
                    onClick={() => setEditingAssignment(true)}
                    className="text-xs text-primary hover:text-secondary transition-colors"
                  >
                    Add users
                  </button>
                </div>
                <p className="text-sm text-gray-500">No one assigned</p>
              </div>
            )}

            {task.labels && task.labels.length > 0 && (
              <div className="pb-6 border-b border-gray-700">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
                  Labels
                </h3>
                <div className="flex flex-wrap gap-2">
                  {task.labels.map((label, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-full text-sm font-semibold text-white"
                      style={{ backgroundColor: label.color }}
                    >
                      {label.text}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {task.dueDate && (
              <div className="pb-6 border-b border-gray-700">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
                  Due Date
                </h3>
                <div className="flex items-center gap-2 text-gray-300">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {new Date(task.dueDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>
            )}

            {task.createdBy && (
              <div className="pt-6 border-t border-gray-700">
                <p className="text-sm text-gray-400">
                  Created by <span className="text-gray-300 font-semibold">{task.createdBy.username}</span> on{' '}
                  {new Date(task.createdAt).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default TaskDetailModal