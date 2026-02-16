const TaskCard = ({ task, onClick, isDragging }) => {
  const getInitials = (name) => {
    return name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?'
  }

  return (
    <div
      onClick={onClick}
      className={`bg-dark-200 border border-gray-700 rounded-lg p-4 cursor-pointer transition-all hover:border-primary-light hover:shadow-lg ${
        isDragging ? 'opacity-50 rotate-2 shadow-2xl' : ''
      }`}
    >
      <h4 className="font-semibold text-white mb-2 line-clamp-2">
        {task.title}
      </h4>

      {task.description && (
        <p className="text-gray-400 text-sm mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      {task.labels && task.labels.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {task.labels.map((label, idx) => (
            <span
              key={idx}
              className="px-2 py-1 rounded text-xs font-semibold text-white"
              style={{ backgroundColor: label.color }}
            >
              {label.text}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-700">
        {task.assignedTo && task.assignedTo.length > 0 && (
          <div className="flex -space-x-2">
            {task.assignedTo.slice(0, 3).map((user) => (
              <div 
                key={user._id} 
                className="avatar avatar-sm"
                title={user.username}
              >
                {getInitials(user.username)}
              </div>
            ))}
            {task.assignedTo.length > 3 && (
              <div className="avatar avatar-sm bg-dark-100">
                +{task.assignedTo.length - 3}
              </div>
            )}
          </div>
        )}

        {task.dueDate && (
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {new Date(task.dueDate).toLocaleDateString()}
          </div>
        )}
      </div>
    </div>
  )
}

export default TaskCard