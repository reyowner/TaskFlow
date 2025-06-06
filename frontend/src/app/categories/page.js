"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { FaPlus, FaTimes, FaEdit, FaTrash, FaFolder, FaTasks, FaEye, FaArrowRight, FaSearch } from "react-icons/fa"
import categoryService from "@/services/categoryService"
import { toast } from "react-hot-toast"

// Enhanced color palette using your existing theme
const CATEGORY_COLORS = [
  { value: "#4b5320", label: "Army Green" },
  { value: "#8a9a5b", label: "Olive" },
  { value: "#6b8e23", label: "Forest Green" },
  { value: "#bdb76b", label: "Khaki" },
  { value: "#EF4444", label: "Red" },
  { value: "#F59E0B", label: "Amber" },
  { value: "#3B82F6", label: "Blue" },
  { value: "#8B5CF6", label: "Violet" },
  { value: "#10B981", label: "Emerald" },
  { value: "#F97316", label: "Orange" },
  { value: "#EC4899", label: "Pink" },
  { value: "#6366F1", label: "Indigo" },
  { value: "#84CC16", label: "Lime" },
  { value: "#06B6D4", label: "Cyan" },
  { value: "#8B5A2B", label: "Brown" },
  { value: "#6B7280", label: "Gray" },
  { value: "#7C3AED", label: "Purple" },
  { value: "#059669", label: "Teal" },
  { value: "#DC2626", label: "Crimson" },
  { value: "#4F46E5", label: "Indigo Dark" },
]

export default function CategoriesPage() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState("")
  const [color, setColor] = useState(CATEGORY_COLORS[0].value)
  const [selectedColorObj, setSelectedColorObj] = useState(CATEGORY_COLORS[0])
  const [editingCategory, setEditingCategory] = useState(null)
  const [buttonLoading, setButtonLoading] = useState(false)
  const [showConfirmDelete, setShowConfirmDelete] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")

  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }
    loadCategories()
  }, [user, router])

  const loadCategories = async () => {
    try {
      setLoading(true)
      const data = await categoryService.getCategories()
      setCategories(data)
      setError("")
    } catch (err) {
      toast.error("Failed to load categories. Please try again.")
      console.error(err)
      setCategories([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setButtonLoading(true)

    if (!name.trim()) {
      toast.error("Category name is required")
      setButtonLoading(false)
      return
    }

    try {
      const categoryData = { name, color }
      let data

      if (editingCategory) {
        data = await categoryService.updateCategory(editingCategory.id, categoryData)
        setCategories(categories.map((cat) => (cat.id === editingCategory.id ? data : cat)))
        toast.success("Category updated successfully")
      } else {
        data = await categoryService.createCategory(categoryData)
        setCategories([...categories, data])
        toast.success("Category created successfully")
      }

      resetForm()
    } catch (err) {
      toast.error("Failed to save category. Please try again.")
      console.error(err)
    } finally {
      setButtonLoading(false)
    }
  }

  const handleEditCategory = (category) => {
    setName(category.name)
    setColor(category.color)
    const colorObj = CATEGORY_COLORS.find((c) => c.value === category.color) || CATEGORY_COLORS[0]
    setSelectedColorObj(colorObj)
    setEditingCategory(category)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleDeleteCategory = async (categoryId) => {
    try {
      await categoryService.deleteCategory(categoryId)
      setCategories(categories.filter((cat) => cat.id !== categoryId))
      setShowConfirmDelete(null)
      toast.success("Category deleted successfully")
    } catch (err) {
      toast.error("Failed to delete category. Please try again.")
      console.error(err)
    }
  }

  const resetForm = () => {
    setName("")
    setColor(CATEGORY_COLORS[0].value)
    setSelectedColorObj(CATEGORY_COLORS[0])
    setEditingCategory(null)
    setShowForm(false)
    setError("")
  }

  const handleColorSelect = (colorObj) => {
    setColor(colorObj.value)
    setSelectedColorObj(colorObj)
  }

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const totalTasks = categories.reduce((sum, cat) => sum + (cat.task_count || 0), 0)
  const completedTasks = categories.reduce((sum, cat) => sum + (cat.completed_tasks || 0), 0)
  const totalCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  return (
    <div className="min-h-screen bg-army-light">
      {/* Mobile-First Header Section */}
      <div className="backdrop-blur-sm border-b border-gray-200/50 top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
            <div className="flex-1">
              {/* Title Section - Mobile Optimized */}
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 sm:p-3 bg-gradient-to-r from-army-green-800 to-army-green-700 rounded-xl sm:rounded-2xl shadow-lg">
                  <FaFolder className="text-xl sm:text-2xl text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-2xl sm:text-3xl font-bold text-army-dark truncate">My Categories</h1>
                  <p className="text-sm sm:text-base text-gray-600 mt-1">
                    Organize your tasks into meaningful categories
                  </p>
                </div>
              </div>

              {/* Stats Cards - Mobile Responsive Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4">
                <div className="bg-white/80 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-200/50">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-1.5 sm:p-2 bg-army-light rounded-lg">
                      <FaFolder className="text-sm sm:text-base text-army-green-800" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm text-gray-600">Total Categories</p>
                      <p className="text-lg sm:text-2xl font-bold text-army-dark">{categories.length}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-200/50">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-1.5 sm:p-2 bg-green-100 rounded-lg">
                      <FaTasks className="text-sm sm:text-base text-army-green-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm text-gray-600">Total Tasks</p>
                      <p className="text-lg sm:text-2xl font-bold text-army-dark">{totalTasks}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-200/50">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="relative w-8 h-8 sm:w-12 sm:h-12">
                      <svg className="w-8 h-8 sm:w-12 sm:h-12" viewBox="0 0 36 36">
                        <path
                          d="M18 2.0845
                            a 15.9155 15.9155 0 0 1 0 31.831
                            a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#E5E7EB"
                          strokeWidth="3"
                        />
                        <path
                          d="M18 2.0845
                            a 15.9155 15.9155 0 0 1 0 31.831
                            a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#4b5320"
                          strokeWidth="3"
                          strokeDasharray={`${totalCompletionRate}, 100`}
                          className="transition-all duration-500 ease-in-out"
                        />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm text-gray-600">Completion Rate</p>
                      <p className="text-lg sm:text-2xl font-bold text-army-dark">{totalCompletionRate}%</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Search and New Category Button - Mobile Optimized */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search categories..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-army-green-500 focus:border-transparent transition-all text-sm sm:text-base"
                  />
                </div>
                <button
                  className={`flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-medium transition-all transform whitespace-nowrap ${
                    showForm
                      ? "bg-gray-200 hover:bg-gray-300 text-gray-700"
                      : "bg-gradient-to-r from-army-green-800 to-army-green-700 text-white font-medium shadow-lg hover:shadow-xl hover:shadow-army-green-800/30 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5 hover:brightness-110 relative overflow-hidden group"
                  }`}
                  onClick={() => {
                    if (showForm) resetForm()
                    setShowForm(!showForm)
                  }}
                  disabled={buttonLoading}
                >
                  {showForm ? (
                    <>
                      <FaTimes className="text-sm sm:text-base" />
                      <span className="hidden sm:inline">Cancel</span>
                    </>
                  ) : (
                    <>
                      <FaPlus className="text-sm sm:text-lg" />
                      <span className="hidden sm:inline">New Category</span>
                      <span className="sm:hidden">New</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Category Form Modal - Mobile Optimized */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-start sm:items-center p-2 sm:p-4 overflow-y-auto">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden mt-4 sm:mt-0 max-h-[95vh] sm:max-h-none overflow-y-auto">
              <div
                className="px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center"
                style={{
                  background: `linear-gradient(135deg, ${selectedColorObj.value}dd, ${selectedColorObj.value})`,
                }}
              >
                <h2 className="text-lg sm:text-xl font-semibold text-white flex items-center gap-2">
                  <FaFolder className="text-sm sm:text-base" />
                  <span className="truncate">{editingCategory ? "Edit Category" : "Create New Category"}</span>
                </h2>
                <button onClick={resetForm} className="text-white/80 hover:text-white transition-colors p-1">
                  <FaTimes className="text-sm sm:text-base" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-4 sm:p-6">
                <div className="space-y-4 sm:space-y-6">
                  <div>
                    <label className="block text-army-dark text-sm font-medium mb-2 sm:mb-3" htmlFor="name">
                      Category Name
                    </label>
                    <input
                      id="name"
                      type="text"
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-army-green-500 focus:border-transparent transition-all text-sm sm:text-base"
                      placeholder="Enter category name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      maxLength={50}
                    />
                    <p className="text-xs text-gray-500 mt-1">{name.length}/50 characters</p>
                  </div>
                  <div>
                    <label className="block text-army-dark text-sm font-medium mb-2 sm:mb-3">Category Color</label>
                    <div className="space-y-3 sm:space-y-4">
                      {/* Preset Colors - Mobile Grid */}
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Choose from presets:</p>
                        <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
                          {CATEGORY_COLORS.map((colorOption) => (
                            <button
                              key={colorOption.value}
                              type="button"
                              onClick={() => handleColorSelect(colorOption)}
                              className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg transition-all hover:scale-110 ${
                                color === colorOption.value
                                  ? "ring-2 ring-offset-2 ring-army-green-500 shadow-md"
                                  : "hover:shadow-md"
                              }`}
                              style={{ backgroundColor: colorOption.value }}
                              title={colorOption.label}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Custom Color Picker - Mobile Layout */}
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Or choose a custom color:</p>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                          <div className="flex items-center gap-3 w-full sm:w-auto">
                            <input
                              type="color"
                              value={color}
                              onChange={(e) => {
                                const customColor = { value: e.target.value, label: "Custom" }
                                handleColorSelect(customColor)
                              }}
                              className="w-12 h-12 rounded-lg border-2 border-gray-200 cursor-pointer hover:border-army-green-500 transition-colors"
                              title="Pick custom color"
                            />
                            <div
                              className="w-12 h-12 rounded-lg border-2 border-gray-200 shadow-sm"
                              style={{ backgroundColor: color }}
                              title="Color preview"
                            />
                          </div>
                          <div className="flex-1 w-full sm:w-auto">
                            <input
                              type="text"
                              value={color}
                              onChange={(e) => {
                                const customColor = { value: e.target.value, label: "Custom" }
                                handleColorSelect(customColor)
                              }}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-army-green-500 focus:border-transparent transition-all text-sm font-mono"
                              placeholder="#000000"
                              pattern="^#[0-9A-Fa-f]{6}$"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6 pt-4 sm:pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg sm:rounded-xl font-medium transition-all order-2 sm:order-1"
                    onClick={resetForm}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-army-green-800 to-army-green-700 text-white rounded-lg sm:rounded-xl font-medium transition-all transform hover:scale-[1.02] hover:-translate-y-0.5 hover:brightness-110 shadow-lg hover:shadow-xl hover:shadow-army-green-800/30 disabled:opacity-50 order-1 sm:order-2"
                    disabled={buttonLoading}
                  >
                    {buttonLoading ? "Saving..." : editingCategory ? "Update Category" : "Create Category"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Categories Grid - Mobile Responsive */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-army-light border-t-army-green-800 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 font-medium text-sm sm:text-base">Loading your categories...</p>
            </div>
          </div>
        ) : filteredCategories.length === 0 ? (
          // Empty state - Mobile Optimized
          <div className="text-center py-12 sm:py-16">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-8 sm:p-12 max-w-md mx-auto border border-gray-200/50">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-army-light rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <FaFolder className="text-2xl sm:text-3xl text-army-green-800" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-army-dark mb-2">
                {searchTerm ? "No categories found" : "No categories yet"}
              </h3>
              <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
                {searchTerm
                  ? `No categories match "${searchTerm}"`
                  : "Create your first category to start organizing your tasks!"}
              </p>
              {!searchTerm && (
                <div className="flex justify-center">
                  <button
                    className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-army-green-800 to-army-green-700 text-white rounded-lg sm:rounded-xl font-medium transition-all transform hover:scale-[1.02] hover:-translate-y-0.5 hover:brightness-110 shadow-lg hover:shadow-xl hover:shadow-army-green-800/30 flex items-center gap-2 text-sm sm:text-base"
                    onClick={() => setShowForm(true)}
                  >
                    <FaPlus className="text-sm sm:text-lg" /> Create Category
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredCategories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                onEdit={handleEditCategory}
                onDelete={(id) => setShowConfirmDelete(id)}
                onView={(id) => router.push(`/dashboard/${id}`)}
              />
            ))}
          </div>
        )}

        {/* Delete Confirmation Modal - Mobile Optimized */}
        {showConfirmDelete && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
              <div className="bg-gradient-to-r from-red-500 to-red-600 px-4 sm:px-6 py-3 sm:py-4">
                <h3 className="text-base sm:text-lg font-semibold text-white">Confirm Deletion</h3>
              </div>
              <div className="p-4 sm:p-6">
                <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
                  Are you sure you want to delete this category? This action cannot be undone and will remove all
                  associated tasks.
                </p>
                <div className="flex flex-col sm:flex-row justify-end gap-3">
                  <button
                    className="w-full sm:w-auto px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-all order-2 sm:order-1"
                    onClick={() => setShowConfirmDelete(null)}
                  >
                    Cancel
                  </button>
                  <button
                    className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 hover:brightness-110 text-white rounded-lg font-medium transition-all order-1 sm:order-2"
                    onClick={() => handleDeleteCategory(showConfirmDelete)}
                  >
                    Delete Category
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Mobile-Optimized CategoryCard component
function CategoryCard({ category, onEdit, onDelete, onView }) {
  const [isHovered, setIsHovered] = useState(false)

  const colorObj = CATEGORY_COLORS.find((c) => c.value === category.color) || CATEGORY_COLORS[0]
  const inProgressTasks = category.task_count > 0 ? category.in_progress_tasks || 0 : 0
  const inProgressRate = category.task_count > 0 ? Math.round((inProgressTasks / category.task_count) * 100) : 0
  const completionRate =
    category.task_count > 0 ? Math.round(((category.completed_tasks || 0) / category.task_count) * 100) : 0

  // Format the date
  const formattedDate = new Date(category.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })

  // Function to truncate text with word break
  const truncateText = (text, maxLength) => {
    if (!text) return ""
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + "..."
  }

  return (
    <div
      className="group bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl border border-gray-200/50 overflow-hidden transition-all duration-300 transform hover:-translate-y-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header with gradient - Mobile Optimized */}
      <div
        className="h-20 sm:h-24 bg-gradient-to-r relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${category.color}dd, ${category.color})`,
        }}
      >
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative p-3 sm:p-4 flex items-center justify-between h-full">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div className="p-1.5 sm:p-2 bg-white/20 backdrop-blur-sm rounded-lg flex-shrink-0">
              <FaFolder className="text-white text-base sm:text-lg" />
            </div>
            <div className="min-w-0 flex-1">
              <h3
                className="text-white font-semibold text-sm sm:text-lg break-words leading-tight"
                style={{
                  wordBreak: "break-word",
                  overflowWrap: "break-word",
                  hyphens: "auto",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
                title={category.name}
              >
                {category.name}
              </h3>
              <p className="text-white/80 text-xs sm:text-sm truncate">{formattedDate}</p>
            </div>
          </div>

          {/* Action buttons - Always visible on mobile, hover on desktop */}
          <div
            className={`flex gap-1 transition-opacity duration-200 flex-shrink-0 ${
              isHovered ? "opacity-100" : "sm:opacity-0 opacity-100"
            }`}
          >
            <button
              onClick={(e) => {
                e.stopPropagation()
                onEdit(category)
              }}
              className="p-1.5 sm:p-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-lg transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white/50"
              title="Edit category"
              aria-label="Edit category"
            >
              <FaEdit className="text-white text-xs sm:text-sm" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete(category.id)
              }}
              className="p-1.5 sm:p-2 bg-white/20 backdrop-blur-sm hover:bg-red-500/80 rounded-lg transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-red-500/50"
              title="Delete category"
              aria-label="Delete category"
            >
              <FaTrash className="text-white text-xs sm:text-sm" />
            </button>
          </div>
        </div>
      </div>

      {/* Content - Mobile Optimized */}
      <div className="p-4 sm:p-6">
        {/* Stats - Mobile Grid */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
          <div className="text-center">
            <p className="text-xl sm:text-2xl font-bold text-army-dark">{category.task_count || 0}</p>
            <p className="text-xs sm:text-sm text-gray-600">Total Tasks</p>
          </div>
          <div className="text-center">
            <div className="relative w-12 h-12 sm:w-16 sm:h-16 mx-auto">
              <svg className="w-12 h-12 sm:w-16 sm:h-16" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#E5E7EB"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke={category.color}
                  strokeWidth="3"
                  strokeDasharray={`${completionRate}, 100`}
                  className="transition-all duration-500 ease-in-out"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs sm:text-sm font-bold text-army-dark">{completionRate}%</span>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 mt-1 sm:mt-2">Completed</p>
          </div>
        </div>

        {/* Progress bar for In Progress tasks - Mobile Optimized */}
        <div className="mb-3 sm:mb-4">
          <div className="flex justify-between text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">
            <span>In Progress</span>
            <span>
              {inProgressTasks}/{category.task_count || 0}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
            <div
              className="h-1.5 sm:h-2 rounded-full transition-all duration-500"
              style={{
                width: `${inProgressRate}%`,
                background: `linear-gradient(90deg, ${category.color}dd, ${category.color})`,
              }}
            />
          </div>
        </div>

        {/* View button - Mobile Optimized */}
        <button
          onClick={() => onView(category.id)}
          className="w-full flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 hover:bg-army-light text-army-dark rounded-lg sm:rounded-xl font-medium transition-all group-hover:bg-army-light group-hover:text-army-green-800 hover:brightness-105 focus:outline-none focus:ring-2 focus:ring-army-green-500 text-sm sm:text-base"
        >
          <FaEye className="text-sm" />
          View Tasks
          <FaArrowRight className="text-xs sm:text-sm transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  )
}
