import { useState } from 'react'
import { listAPI } from '../services/api'
import toast from 'react-hot-toast'

const CreateListModal = ({ boardId, onClose, onCreated }) => {
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data } = await listAPI.create({ title, boardId })
      toast.success('List created!')
      onCreated(data.list)
      onClose()
    } catch (error) {
      toast.error('Failed to create list')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-bold mb-6">Create List</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">
              List Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter list title"
              className="input"
              required
              autoFocus
            />
          </div>

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
                'Create List'
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

export default CreateListModal