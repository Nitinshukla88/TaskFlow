import { useState } from 'react'
import { taskAPI } from '../services/api'
import UserSelector from './UserSelector'
import toast from 'react-hot-toast'

const CreateTaskModal = ({ listId, onClose, onCreated }) => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [assignedTo, setAssignedTo] = useState([])
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data } = await taskAPI.create({
        title,
        description,
        listId,
        assignedTo: assignedTo.map(u => u._id)
      })
      toast.success('Task created!')
      onCreated(data.task)
      onClose()
    } catch (error) {
      toast.error('Failed to create task')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-bold mb-6">Create Task</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">
              Task Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title"
              className="input"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more details..."
              className="input min-h-[120px] resize-y"
              rows="4"
            />
          </div>

          <UserSelector
            selectedUsers={assignedTo}
            onUsersChange={setAssignedTo}
          />

          <div className="flex gap-3 pt-4">
            <button 
              type="submit" 
              className="btn btn-primary flex-1"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner w-5 h-5 border-2" />
                  Creating...
                </>
              ) : (
                'Create Task'
              )}
            </button>
            <button 
              type="button" 
              onClick={onClose}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateTaskModal