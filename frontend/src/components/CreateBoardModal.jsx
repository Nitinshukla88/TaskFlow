import { useState } from 'react'
import { boardAPI } from '../services/api'
import { useBoardStore } from '../store/store'
import toast from 'react-hot-toast'

const BACKGROUND_COLORS = [
  '#0079bf', '#d29034', '#519839', '#b04632', '#89609e',
  '#cd5a91', '#4bbf6b', '#00aecc', '#838c91', '#172b4d'
]

const CreateBoardModal = ({ onClose, onCreated }) => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [background, setBackground] = useState(BACKGROUND_COLORS[0])
  const [loading, setLoading] = useState(false)
  const addBoard = useBoardStore((state) => state.addBoard)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data } = await boardAPI.create({ title, description, background })
      addBoard(data.board)
      toast.success('Board created successfully!')
      onCreated()
      onClose()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create board')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-bold mb-6">Create Board</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">
              Board Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter board title"
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
              placeholder="What's this board about?"
              className="input min-h-[100px] resize-y"
              rows="3"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
              Background Color
            </label>
            <div className="flex flex-wrap gap-2">
              {BACKGROUND_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setBackground(color)}
                  className="w-12 h-12 rounded-lg transition-all hover:scale-110"
                  style={{
                    backgroundColor: color,
                    border: background === color ? '3px solid white' : '1px solid rgba(255,255,255,0.2)',
                    boxShadow: background === color ? '0 0 0 2px rgba(108, 92, 231, 0.5)' : 'none'
                  }}
                />
              ))}
            </div>
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
                'Create Board'
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

export default CreateBoardModal