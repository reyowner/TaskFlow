import { useState } from 'react'
import { 
  FaStickyNote, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaSave, 
  FaTimes, 
  FaChevronLeft, 
  FaChevronRight,
  FaEllipsisV,
  FaExpand,
  FaCompress,
  FaSearch,
  FaFilter
} from 'react-icons/fa'

const EnhancedStickyNotesSection = ({
  reminders,
  setReminders,
  reminderInput,
  setReminderInput,
  editingId,
  setEditingId,
  editingContent,
  setEditingContent,
  handleAddReminder,
  handleDeleteReminder,
  handleEditReminder,
  handleSaveEdit,
  handleCancelEdit
}) => {
  // Pagination and display states
  const [currentPage, setCurrentPage] = useState(1)
  const [notesPerPage, setNotesPerPage] = useState(6)
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'
  const [isExpanded, setIsExpanded] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('newest') // 'newest', 'oldest', 'alphabetical'
  const [showActions, setShowActions] = useState({})

  // Filter and sort reminders
  const filteredReminders = reminders
    .filter(reminder => 
      reminder.content.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.created_at) - new Date(b.created_at)
        case 'alphabetical':
          return a.content.localeCompare(b.content)
        case 'newest':
        default:
          return new Date(b.created_at) - new Date(a.created_at)
      }
    })

  // Pagination logic
  const totalPages = Math.ceil(filteredReminders.length / notesPerPage)
  const startIndex = (currentPage - 1) * notesPerPage
  const currentReminders = filteredReminders.slice(startIndex, startIndex + notesPerPage)

  // Handle page changes
  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  // Toggle actions menu
  const toggleActions = (id) => {
    setShowActions(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  // Color variations for sticky notes
  const noteColors = [
    { bg: 'bg-yellow-100', border: 'border-yellow-300', shadow: 'shadow-yellow-200' },
    { bg: 'bg-pink-100', border: 'border-pink-300', shadow: 'shadow-pink-200' },
    { bg: 'bg-blue-100', border: 'border-blue-300', shadow: 'shadow-blue-200' },
    { bg: 'bg-green-100', border: 'border-green-300', shadow: 'shadow-green-200' },
    { bg: 'bg-purple-100', border: 'border-purple-300', shadow: 'shadow-purple-200' },
    { bg: 'bg-orange-100', border: 'border-orange-300', shadow: 'shadow-orange-200' },
  ]

  const getRandomColor = (index) => noteColors[index % noteColors.length]

  return (
    <div className="mb-6 sm:mb-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
        <div className="flex items-center gap-3 mb-3 sm:mb-0">
          <div className="p-2 bg-yellow-100 rounded-lg">
            <FaStickyNote className="text-yellow-600 text-xl" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-yellow-700">
              Sticky Notes
            </h2>
            <p className="text-sm text-yellow-600">
              {filteredReminders.length} {filteredReminders.length === 1 ? 'note' : 'notes'}
            </p>
          </div>
        </div>

        {/* Controls and Filter */}
        <div className="flex items-center gap-2">
          {reminders.length > 6 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded-lg transition-all"
              title={isExpanded ? 'Collapse view' : 'Expand view'}
            >
              {isExpanded ? <FaCompress /> : <FaExpand />}
            </button>
          )}
          <div className="flex items-center gap-1 bg-yellow-50 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded transition-all ${
                viewMode === 'grid' 
                  ? 'bg-yellow-200 text-yellow-800' 
                  : 'text-yellow-600 hover:bg-yellow-100'
              }`}
              title="Grid view"
            >
              <div className="w-3 h-3 grid grid-cols-2 gap-0.5">
                <div className="bg-current rounded-sm"></div>
                <div className="bg-current rounded-sm"></div>
                <div className="bg-current rounded-sm"></div>
                <div className="bg-current rounded-sm"></div>
              </div>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded transition-all ${
                viewMode === 'list' 
                  ? 'bg-yellow-200 text-yellow-800' 
                  : 'text-yellow-600 hover:bg-yellow-100'
              }`}
              title="List view"
            >
              <div className="w-3 h-3 flex flex-col gap-0.5">
                <div className="bg-current h-0.5 rounded-sm"></div>
                <div className="bg-current h-0.5 rounded-sm"></div>
                <div className="bg-current h-0.5 rounded-sm"></div>
              </div>
            </button>
          </div>
          {/* Filter Dropdown */}
          <div className="flex items-center gap-2">
            <FaFilter className="text-yellow-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-900 focus:outline-none focus:ring-2 focus:ring-yellow-300"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="alphabetical">A-Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Add New Note Form */}
      <form onSubmit={handleAddReminder} className="mb-6">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <textarea
              className="w-full px-4 py-3 pr-16 rounded-xl border-2 border-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent bg-yellow-50 text-yellow-900 placeholder-yellow-500 resize-none transition-all"
              placeholder="Write your reminder note here..."
              value={reminderInput}
              onChange={(e) => setReminderInput(e.target.value)}
              maxLength={300}
              rows={2}
            />
            <div className="absolute bottom-2 right-2 text-xs text-yellow-500">
              {reminderInput.length}/300
            </div>
          </div>
          <button
            type="submit"
            disabled={!reminderInput.trim()}
            className="self-start w-12 h-12 flex items-center justify-center bg-yellow-400 hover:bg-yellow-500 disabled:bg-yellow-200 disabled:cursor-not-allowed text-yellow-900 font-bold rounded-xl transition-all shadow-lg hover:shadow-xl disabled:shadow-none"
            title="Add note"
          >
            <FaPlus />
          </button>
        </div>
      </form>

      {/* Notes Display */}
      <div className="space-y-4 max-h-[350px] overflow-y-auto p-2">
        {filteredReminders.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaStickyNote className="text-yellow-400 text-2xl" />
            </div>
            <h3 className="text-lg font-medium text-yellow-700 mb-2">
              No sticky notes yet
            </h3>
            <p className="text-yellow-600 mb-4">
              Add your first reminder note to get started!
            </p>
          </div>
        ) : (
          <>
            {/* Notes Grid/List */}
            <div className={
              viewMode === 'grid'
                ? `grid gap-3 ${
                    isExpanded 
                      ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                      : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                  }`
                : 'space-y-2'
            }>
              {currentReminders.map((reminder, index) => {
                const colorScheme = getRandomColor(startIndex + index)
                
                return (
                  <div
                    key={reminder.id}
                    className={`relative group ${
                      viewMode === 'grid' 
                        ? `${colorScheme.bg} ${colorScheme.border} min-h-[120px] rounded-xl border-2 p-3 shadow-lg hover:shadow-xl transform hover:-rotate-1 transition-all duration-200`
                        : `${colorScheme.bg} ${colorScheme.border} rounded-lg border-2 p-3 shadow-md hover:shadow-lg transition-all`
                    }`}
                    style={viewMode === 'grid' ? {
                      boxShadow: `4px 4px 0 ${colorScheme.shadow.replace('shadow-', '#')}, 0 2px 8px rgba(0,0,0,0.1)`
                    } : {}}
                  >
                    {editingId === reminder.id ? (
                      <div className="space-y-2">
                        <textarea
                          className="w-full p-2 rounded-lg bg-white/70 border border-current/20 text-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-current/30"
                          value={editingContent}
                          onChange={(e) => setEditingContent(e.target.value)}
                          maxLength={300}
                          rows={viewMode === 'grid' ? 3 : 2}
                        />
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-600">
                            {editingContent.length}/300
                          </span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSaveEdit(reminder.id)}
                              className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all"
                              title="Save changes"
                            >
                              <FaSave className="text-sm" />
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="p-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-all"
                              title="Cancel editing"
                            >
                              <FaTimes className="text-sm" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* Note Content */}
                        <div className={`${viewMode === 'grid' ? 'mb-2' : 'mb-2'}`}>
                          <div className={`whitespace-pre-wrap break-words text-gray-800 font-medium leading-relaxed ${
                            viewMode === 'grid' ? 'text-sm' : 'text-base'
                          }`}>
                            {reminder.content}
                          </div>
                        </div>

                        {/* Note Footer */}
                        <div className="flex justify-between items-end text-xs text-gray-600 mt-2">
                          <span className="flex items-center gap-1">
                            <div className="w-1.5 h-1.5 bg-current rounded-full opacity-50"></div>
                            {new Date(reminder.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: new Date(reminder.created_at).getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
                            })}
                          </span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditReminder(reminder.id, reminder.content)}
                              className="p-2 bg-yellow-300 hover:bg-yellow-400 text-yellow-900 rounded-full transition-all"
                              title="Edit"
                            >
                              <FaEdit className="text-xs" />
                            </button>
                            <button
                              onClick={() => handleDeleteReminder(reminder.id)}
                              className="p-2 bg-red-200 hover:bg-red-400 text-red-700 rounded-full transition-all"
                              title="Delete"
                            >
                              <FaTrash className="text-xs" />
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-yellow-200">
                <div className="text-sm text-yellow-700">
                  Showing {startIndex + 1}-{Math.min(startIndex + notesPerPage, filteredReminders.length)} of {filteredReminders.length} notes
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 border border-yellow-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-yellow-50 transition-all"
                    title="Previous page"
                  >
                    <FaChevronLeft className="text-sm text-yellow-700" />
                  </button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum
                      if (totalPages <= 5) {
                        pageNum = i + 1
                      } else if (currentPage <= 3) {
                        pageNum = i + 1
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i
                      } else {
                        pageNum = currentPage - 2 + i
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => goToPage(pageNum)}
                          className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                            currentPage === pageNum
                              ? 'bg-yellow-400 text-yellow-900'
                              : 'border border-yellow-300 text-yellow-700 hover:bg-yellow-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      )
                    })}
                  </div>
                  
                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 border border-yellow-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-yellow-50 transition-all"
                    title="Next page"
                  >
                    <FaChevronRight className="text-sm text-yellow-700" />
                  </button>
                </div>
                
                <div className="flex items-center gap-2">
                  <label className="text-sm text-yellow-700">Notes per page:</label>
                  <select
                    value={notesPerPage}
                    onChange={(e) => {
                      setNotesPerPage(Number(e.target.value))
                      setCurrentPage(1)
                    }}
                    className="px-2 py-1 border border-yellow-300 rounded text-sm text-yellow-900 bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  >
                    <option value={6}>6</option>
                    <option value={12}>12</option>
                    <option value={24}>24</option>
                  </select>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default EnhancedStickyNotesSection 