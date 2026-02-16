const Pagination = ({ currentPage, totalPages, onPageChange, loading }) => {
  if (totalPages <= 1) return null

  const pages = []
  const maxButtons = 5
  let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2))
  let endPage = Math.min(totalPages, startPage + maxButtons - 1)

  if (endPage - startPage < maxButtons - 1) {
    startPage = Math.max(1, endPage - maxButtons + 1)
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i)
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-6 pt-4 border-t border-gray-700">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1 || loading}
        className="btn btn-secondary btn-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Previous
      </button>

      <div className="flex gap-1">
        {startPage > 1 && (
          <>
            <button
              onClick={() => onPageChange(1)}
              disabled={loading}
              className="btn btn-secondary btn-sm disabled:opacity-50"
            >
              1
            </button>
            {startPage > 2 && <span className="text-gray-400 px-2">...</span>}
          </>
        )}

        {pages.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            disabled={loading}
            className={`btn btn-sm disabled:opacity-50 ${
              page === currentPage ? 'btn-primary' : 'btn-secondary'
            }`}
          >
            {page}
          </button>
        ))}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="text-gray-400 px-2">...</span>}
            <button
              onClick={() => onPageChange(totalPages)}
              disabled={loading}
              className="btn btn-secondary btn-sm disabled:opacity-50"
            >
              {totalPages}
            </button>
          </>
        )}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages || loading}
        className="btn btn-secondary btn-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
      </button>

      <span className="text-sm text-gray-400 ml-4">
        Page {currentPage} of {totalPages}
      </span>
    </div>
  )
}

export default Pagination
