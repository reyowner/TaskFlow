"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  FaPlus,
  FaArrowLeft,
  FaTrash,
  FaCheck,
  FaFilter,
  FaEye,
  FaEdit,
  FaClock,
  FaHourglass,
  FaEllipsisV,
  FaFolder,
  FaTasks,
  FaCheckCircle,
  FaExclamationCircle,
  FaTimes,
  FaBars,
} from "react-icons/fa"
import { useAuth } from "@/contexts/AuthContext"
import { DndProvider, useDrag, useDrop } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import { TouchBackend } from "react-dnd-touch-backend"
import { MouseTransition, TouchTransition } from "dnd-multi-backend"
import { MultiBackend } from "react-dnd-multi-backend"
import categoryService from "@/services/categoryService"
import taskService from "@/services/taskService"
import { toast } from "react-hot-toast"

const PRIORITY_TAGS = [
  { name: "High", color: "#EF4444", bgColor: "#FEE2E2", lightBg: "bg-red-50", darkBg: "bg-red-100" },
  { name: "Medium", color: "#F59E0B", bgColor: "#FEF3C7", lightBg: "bg-amber-50", darkBg: "bg-amber-100" },
  { name: "Low", color: "#10B981", bgColor: "#D1FAE5", lightBg: "bg-emerald-50", darkBg: "bg-emerald-100" },
]

const PRIORITY_ORDER = {
  High: 0,
  Medium: 1,
  Low: 2,
}

// Detect if device supports touch
const isTouchDevice = () => {
  return "ontouchstart" in window || navigator.maxTouchPoints > 0
}

// Configure the multi-backend
const backendConfig = {
  backends: [
    {
      backend: HTML5Backend,
      transition: MouseTransition,
    },
    {
      backend: TouchBackend,
      options: { enableMouseEvents: true },
      transition: TouchTransition,
    },
  ],
}

export default function CategoryDashboard() {
  const { categoryId } = useParams()
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [category, setCategory] = useState(null)
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [selectedPriority, setSelectedPriority] = useState(PRIORITY_TAGS[0])
  const [editingTask, setEditingTask] = useState(null)
  const [buttonLoading, setButtonLoading] = useState(false)
  const [viewingTask, setViewingTask] = useState(null)
  const [showConfirmDelete, setShowConfirmDelete] = useState(null)
  const [priorityFilter, setPriorityFilter] = useState("All")
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    const fetchData = async () => {
      try {
        const [categoryData, tasksData] = await Promise.all([
          categoryService.getCategory(categoryId),
          taskService.getTasks(categoryId),
        ])
        setCategory(categoryData)
        setTasks(tasksData)
      } catch (error) {
        console.error("Error fetching data:", error)
        toast.error("Failed to load category and tasks")
        if (error.response?.status === 401) {
          router.push("/login")
        }
      } finally {
        setLoading(false)
      }
    }

    if (categoryId) {
      fetchData()
    }
  }, [categoryId, router, isAuthenticated])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setButtonLoading(true)

    if (!title.trim()) {
      toast.error("Title is required")
      setButtonLoading(false)
      return
    }

    try {
      if (editingTask) {
        const updatedTask = await taskService.updateTask(editingTask.id, {
          title,
          description,
          status: editingTask.status,
          priority: selectedPriority.name,
        })
        if (updatedTask) {
          setTasks(tasks.map((task) => (task.id === editingTask.id ? updatedTask : task)))
          toast.success("Task updated successfully")
        }
      } else {
        const newTask = await taskService.createTask({
          title,
          description,
          status: "Pending",
          category_id: Number.parseInt(categoryId),
          priority: selectedPriority.name,
        })
        if (newTask) {
          setTasks([...tasks, newTask])
          toast.success("Task created successfully")
        }
      }
      resetForm()
    } catch (err) {
      toast.error("Failed to save task. Please try again.")
      console.error(err)
    } finally {
      setButtonLoading(false)
    }
  }

  const handleEditTask = (task) => {
    setTitle(task.title)
    setDescription(task.description || "")
    setSelectedPriority(PRIORITY_TAGS.find((p) => p.name === task.priority) || PRIORITY_TAGS[0])
    setEditingTask(task)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleDeleteTask = async (taskId) => {
    try {
      await taskService.deleteTask(taskId)
      setTasks(tasks.filter((task) => task.id !== taskId))
      setShowConfirmDelete(null)
      toast.success("Task deleted successfully")
    } catch (err) {
      toast.error("Failed to delete task. Please try again.")
      console.error(err)
    }
  }

  const handleViewTask = (task) => {
    setViewingTask(task)
  }

  const resetForm = () => {
    setTitle("")
    setDescription("")
    setSelectedPriority(PRIORITY_TAGS[0])
    setEditingTask(null)
    setShowForm(false)
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "Pending":
        return <FaHourglass className="text-yellow-500" />
      case "In Progress":
        return <FaClock className="text-blue-500" />
      case "Completed":
        return <FaCheck className="text-green-500" />
      default:
        return null
    }
  }

  const filteredTasks = tasks
    .filter((task) => priorityFilter === "All" || task.priority === priorityFilter)
    .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority])

  const totalTasks = tasks.length
  const completedTasks = tasks.filter((task) => task.status === "Completed").length
  const inProgressTasks = tasks.filter((task) => task.status === "In Progress").length

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-army-light">
        <div className="text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-army-light border-t-army-green-800 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium text-sm sm:text-base">Loading tasks...</p>
        </div>
      </div>
    )
  }

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-army-light p-4">
        <div className="text-center bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl p-8 sm:p-12 max-w-md mx-auto border border-gray-200/50 shadow-lg">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <FaExclamationCircle className="text-2xl sm:text-3xl text-red-500" />
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold text-army-dark mb-3 sm:mb-4">Category not found</h1>
          <button
            onClick={() => router.push("/categories")}
            className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-army-green-800 to-army-green-700 hover:from-army-green-700 hover:to-army-green-600 text-white rounded-lg sm:rounded-xl font-medium transition-all transform hover:scale-105 shadow-lg text-sm sm:text-base"
          >
            <FaArrowLeft className="mr-2 inline" /> Go back to categories
          </button>
        </div>
      </div>
    )
  }

  return (
    <DndProvider backend={MultiBackend} options={backendConfig}>
      <div className="min-h-screen bg-army-light">
        {/* Mobile-First Header Section - FIXED */}
        <div className="backdrop-blur-sm top-0 z-40">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
              <div className="flex-1">
                {/* Back Button and Title - COMPLETELY REDESIGNED FOR MOBILE */}
                <div className="mb-4">
                  {/* Mobile Layout - Stacked */}
                  <div className="block sm:hidden">
                    {/* Back Button Row - Full width on mobile */}
                    <div className="flex items-center mb-3">
                      <button
                        onClick={() => router.push("/categories")}
                        className="flex items-center gap-2 px-3 py-2 backdrop-blur-sm rounded-lg hover:bg-white transition-colors text-army-dark font-medium text-sm"
                        aria-label="Go back to categories"
                      >
                        <FaArrowLeft className="text-sm" />
                        <span>Back to Categories</span>
                      </button>
                    </div>

                    {/* Category Info Row - Full width on mobile */}
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-xl shadow-sm flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: category.color }}
                      >
                        <FaFolder className="text-white text-lg" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h1
                          className="text-lg font-bold text-army-dark leading-tight"
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
                        </h1>
                        <p className="text-gray-600 text-sm">
                          {tasks.length} {tasks.length === 1 ? "task" : "tasks"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Desktop Layout - Horizontal */}
                  <div className="hidden sm:flex items-center gap-4">
                    <button
                      onClick={() => router.push("/categories")}
                      className="p-3 rounded-xl shadow-sm hover:bg-army-light transition-colors flex-shrink-0 bg-white/90 backdrop-blur-sm border border-gray-200/50"
                      aria-label="Go back to categories"
                    >
                      <FaArrowLeft className="text-army-dark text-base" />
                    </button>
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div
                        className="w-12 h-12 rounded-xl shadow-sm flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: category.color }}
                      >
                        <FaFolder className="text-white text-xl" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h1 className="text-3xl font-bold text-army-dark truncate">{category.name}</h1>
                        <p className="text-gray-600 mt-1 text-base">
                          {tasks.length} {tasks.length === 1 ? "task" : "tasks"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mobile Priority Filter Toggle */}
                <div className="mb-4 sm:mb-6">
                  <div className="flex items-center justify-between sm:hidden">
                    <button
                      onClick={() => setShowMobileFilters(!showMobileFilters)}
                      className="flex items-center gap-2 px-3 py-2 bg-white/90 backdrop-blur-sm rounded-lg border border-gray-200 text-sm font-medium text-gray-700"
                    >
                      <FaFilter className="text-xs" />
                      Filter ({priorityFilter})
                      <FaBars className="text-xs" />
                    </button>
                  </div>

                  {/* Priority Filter - Desktop and Mobile Expanded */}
                  <div
                    className={`${showMobileFilters ? "block" : "hidden"} sm:block backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 mt-2 sm:mt-0 bg-white/90 sm:bg-transparent border border-gray-200 sm:border-none`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                      <div className="flex items-center gap-2">
                        <FaFilter className="text-gray-500 text-sm" />
                        <span className="text-sm font-medium text-gray-700">Filter by Priority:</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => {
                            setPriorityFilter("All")
                            setShowMobileFilters(false)
                          }}
                          className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${
                            priorityFilter === "All"
                              ? "bg-army-green-800 text-white shadow-sm"
                              : "text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          All
                        </button>
                        {PRIORITY_TAGS.map((tag) => (
                          <button
                            key={tag.name}
                            onClick={() => {
                              setPriorityFilter(tag.name)
                              setShowMobileFilters(false)
                            }}
                            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${
                              priorityFilter === tag.name
                                ? "ring-2 ring-offset-2 ring-army-green-500 shadow-sm"
                                : "hover:bg-gray-100"
                            }`}
                            style={{
                              backgroundColor: priorityFilter === tag.name ? tag.bgColor : "transparent",
                              color: priorityFilter === tag.name ? tag.color : "inherit",
                            }}
                          >
                            {tag.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats Cards - Mobile Responsive Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <div className="bg-white/80 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-200/50">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="p-1.5 sm:p-2 bg-army-light rounded-lg">
                        <FaTasks className="text-army-green-800 text-sm sm:text-base" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm text-gray-600">Total Tasks</p>
                        <p className="text-lg sm:text-2xl font-bold text-army-dark">{totalTasks}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white/80 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-200/50">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg">
                        <FaClock className="text-blue-600 text-sm sm:text-base" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm text-gray-600">In Progress</p>
                        <p className="text-lg sm:text-2xl font-bold text-army-dark">{inProgressTasks}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white/80 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-200/50">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="p-1.5 sm:p-2 bg-green-100 rounded-lg">
                        <FaCheckCircle className="text-army-green-500 text-sm sm:text-base" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm text-gray-600">Completed</p>
                        <p className="text-lg sm:text-2xl font-bold text-army-dark">{completedTasks}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button - Mobile Optimized */}
              <div className="flex justify-end">
                <button
                  className={`flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-medium transition-all transform ${
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
                      <span className="hidden sm:inline">New Task</span>
                      <span className="sm:hidden">New</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pb-4 sm:pb-8">
          {/* Task Form Modal - Mobile Optimized */}
          {showForm && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-start sm:items-center p-2 sm:p-4 overflow-y-auto">
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden mt-4 sm:mt-0 max-h-[95vh] sm:max-h-none overflow-y-auto">
                <div
                  className="px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center"
                  style={{
                    background: `linear-gradient(135deg, ${category.color}dd, ${category.color})`,
                  }}
                >
                  <h2 className="text-lg sm:text-xl font-semibold text-white flex items-center gap-2">
                    <FaTasks className="text-sm sm:text-base" />
                    <span className="truncate">{editingTask ? "Edit Task" : "Create New Task"}</span>
                  </h2>
                  <button onClick={resetForm} className="text-white/80 hover:text-white transition-colors p-1">
                    <FaTimes className="text-sm sm:text-base" />
                  </button>
                </div>
                <form onSubmit={handleSubmit} className="p-4 sm:p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    <div className="lg:col-span-1">
                      <label className="block text-army-dark text-sm font-medium mb-2 sm:mb-3" htmlFor="title">
                        Task Title
                      </label>
                      <input
                        id="title"
                        type="text"
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-army-green-500 focus:border-transparent transition-all text-sm sm:text-base"
                        placeholder="Enter task title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                      />
                    </div>
                    <div className="lg:col-span-1">
                      <label className="block text-army-dark text-sm font-medium mb-2 sm:mb-3">Priority</label>
                      <div className="flex gap-2 sm:gap-3">
                        {PRIORITY_TAGS.map((tag) => (
                          <button
                            key={tag.name}
                            type="button"
                            onClick={() => setSelectedPriority(tag)}
                            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${
                              selectedPriority.name === tag.name
                                ? "ring-2 ring-offset-2 ring-army-green-500 shadow-sm"
                                : "hover:bg-gray-100"
                            }`}
                            style={{
                              backgroundColor: selectedPriority.name === tag.name ? tag.bgColor : "transparent",
                              color: selectedPriority.name === tag.name ? tag.color : "inherit",
                            }}
                          >
                            {tag.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 sm:mt-6 lg:col-span-2">
                    <label className="block text-army-dark text-sm font-medium mb-2 sm:mb-3" htmlFor="description">
                      Task Description
                    </label>
                    <textarea
                      id="description"
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-army-green-500 focus:border-transparent transition-all min-h-24 sm:min-h-32 text-sm sm:text-base"
                      placeholder="Enter task details..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      💡 Tip: Include links in your description - they'll be clickable in the task view!
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row justify-end gap-3 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
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
                      {buttonLoading ? "Saving..." : editingTask ? "Update Task" : "Create Task"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Task Columns - Mobile Responsive */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {["Pending", "In Progress", "Completed"].map((status) => (
              <TaskColumn
                key={status}
                status={status}
                icon={getStatusIcon(status)}
                tasks={filteredTasks.filter((task) => task.status === status)}
                setTasks={setTasks}
                onEditTask={handleEditTask}
                onDeleteTask={(id) => setShowConfirmDelete(id)}
                onViewTask={handleViewTask}
                categoryColor={category.color}
              />
            ))}
          </div>

          {/* Task Viewing Modal - Mobile Optimized */}
          {viewingTask && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-start sm:items-center p-2 sm:p-4 overflow-y-auto">
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-2xl w-full max-h-[95vh] overflow-hidden mt-4 sm:mt-0">
                <div className="bg-gradient-to-r from-army-green-800 to-army-green-700 px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
                  <h3 className="text-base sm:text-lg font-semibold text-white">Task Details</h3>
                  <button
                    className="text-white/80 hover:text-white transition-colors p-1 rounded-md hover:bg-white/10"
                    onClick={() => setViewingTask(null)}
                    aria-label="Close modal"
                  >
                    <FaTimes className="text-sm sm:text-base" />
                  </button>
                </div>
                <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(95vh-120px)]">
                  <div className="flex flex-wrap gap-2 mb-3 sm:mb-4">
                    <span
                      className={`text-xs sm:text-sm font-medium px-2 sm:px-3 py-1 rounded-full ${
                        viewingTask.status === "Pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : viewingTask.status === "In Progress"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                      }`}
                    >
                      {viewingTask.status}
                    </span>
                    <span
                      className="text-xs sm:text-sm font-medium px-2 sm:px-3 py-1 rounded-full"
                      style={{
                        backgroundColor: PRIORITY_TAGS.find((p) => p.name === viewingTask.priority)?.bgColor,
                        color: PRIORITY_TAGS.find((p) => p.name === viewingTask.priority)?.color,
                      }}
                    >
                      {viewingTask.priority}
                    </span>
                  </div>
                  <h2
                    className="text-xl sm:text-2xl font-semibold text-army-dark mb-3 sm:mb-4 break-words"
                    style={{
                      wordBreak: "break-word",
                      overflowWrap: "break-word",
                      hyphens: "auto",
                    }}
                  >
                    {viewingTask.title}
                  </h2>
                  {viewingTask.description ? (
                    <div className="text-gray-700 bg-gray-50 p-3 sm:p-4 rounded-lg sm:rounded-xl border border-gray-100">
                      <div
                        className="whitespace-pre-wrap break-words text-sm sm:text-base"
                        style={{
                          wordBreak: "break-word",
                          overflowWrap: "break-word",
                        }}
                      >
                        {viewingTask.description.split(/(https?:\/\/[^\s]+)/g).map((part, index) => {
                          if (/https?:\/\/[^\s]+/.test(part)) {
                            return (
                              <a
                                key={index}
                                href={part}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 underline break-all inline-block"
                              >
                                {part}
                              </a>
                            )
                          }
                          return <span key={index}>{part}</span>
                        })}
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 italic text-sm sm:text-base">No description provided</p>
                  )}
                </div>
                <div className="border-t border-gray-200 p-3 sm:p-4 flex flex-col sm:flex-row justify-end gap-3">
                  <button
                    className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-all order-2 sm:order-1"
                    onClick={() => setViewingTask(null)}
                  >
                    Close
                  </button>
                  <button
                    className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-gradient-to-r from-army-green-800 to-army-green-700 text-white rounded-lg font-medium transition-all transform hover:scale-[1.02] hover:-translate-y-0.5 hover:brightness-110 shadow-lg hover:shadow-xl hover:shadow-army-green-800/30 flex items-center justify-center gap-2 order-1 sm:order-2"
                    onClick={() => {
                      handleEditTask(viewingTask)
                      setViewingTask(null)
                    }}
                  >
                    <FaEdit className="text-sm" /> Edit
                  </button>
                </div>
              </div>
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
                    Are you sure you want to delete this task? This action cannot be undone.
                  </p>
                  <div className="flex flex-col sm:flex-row justify-end gap-3">
                    <button
                      className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-all order-2 sm:order-1"
                      onClick={() => setShowConfirmDelete(null)}
                    >
                      Cancel
                    </button>
                    <button
                      className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg font-medium transition-all order-1 sm:order-2"
                      onClick={() => handleDeleteTask(showConfirmDelete)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DndProvider>
  )
}

// Mobile-Optimized TaskColumn component
function TaskColumn({ status, tasks, setTasks, onEditTask, onDeleteTask, onViewTask, icon, categoryColor }) {
  const [{ isOver }, drop] = useDrop({
    accept: "TASK",
    drop: (item) => moveTask(item.id, status),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  })

  const moveTask = async (taskId, newStatus) => {
    try {
      const updatedTask = await taskService.updateTask(taskId, { status: newStatus })
      if (updatedTask) {
        setTasks((prevTasks) => prevTasks.map((task) => (task.id === taskId ? updatedTask : task)))
        toast.success(`Task moved to ${newStatus}`)
      }
    } catch (err) {
      console.error("Failed to move task", err)
      toast.error("Failed to update task status")
    }
  }

  const getColumnColor = (status) => {
    switch (status) {
      case "Pending":
        return { bg: "bg-yellow-50/50", border: "border-yellow-200", text: "text-yellow-700" }
      case "In Progress":
        return { bg: "bg-blue-50/50", border: "border-blue-200", text: "text-blue-700" }
      case "Completed":
        return { bg: "bg-green-50/50", border: "border-green-200", text: "text-green-700" }
      default:
        return { bg: "bg-gray-50/50", border: "border-gray-200", text: "text-gray-700" }
    }
  }

  const colors = getColumnColor(status)

  return (
    <div
      ref={drop}
      className={`rounded-lg sm:rounded-xl border ${colors.border} ${
        isOver ? "ring-2 ring-army-green-500" : ""
      } transition-all h-full flex flex-col bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md min-h-[300px] sm:min-h-[400px]`}
    >
      <div className={`p-3 sm:p-4 ${colors.bg} rounded-t-lg sm:rounded-t-xl border-b ${colors.border}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon}
            <h2 className={`text-base sm:text-lg font-medium ${colors.text}`}>{status}</h2>
          </div>
          <span className="bg-white/80 backdrop-blur-sm text-xs sm:text-sm py-1 px-2 sm:px-3 rounded-full shadow-sm">
            {tasks.length}
          </span>
        </div>
      </div>
      <div className="p-2 sm:p-3 flex-grow overflow-y-auto">
        {tasks && tasks.length > 0 ? (
          <div className="space-y-2 sm:space-y-3">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEditTask={onEditTask}
                onDeleteTask={onDeleteTask}
                onViewTask={onViewTask}
                setTasks={setTasks}
                categoryColor={categoryColor}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-6 sm:py-8 text-gray-400">
            <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 rounded-full bg-gray-100 flex items-center justify-center">
              {icon}
            </div>
            <p className="font-medium text-sm sm:text-base">No tasks in this column</p>
            <p className="text-xs sm:text-sm mt-1">Drag and drop tasks here</p>
          </div>
        )}
      </div>
    </div>
  )
}

// Mobile-Optimized TaskCard component
function TaskCard({ task, onEditTask, onDeleteTask, onViewTask, setTasks, categoryColor }) {
  const [{ isDragging }, drag] = useDrag({
    type: "TASK",
    item: { id: task.id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  })

  const [showActions, setShowActions] = useState(false)
  const [showStatusMenu, setShowStatusMenu] = useState(false)
  const buttonRef = useRef(null)
  const menuRef = useRef(null)

  // Format the date
  const formattedDate = new Date(task.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })

  const getBorderColor = (status) => {
    switch (status) {
      case "Pending":
        return "border-yellow-500"
      case "In Progress":
        return "border-blue-500"
      case "Completed":
        return "border-green-500"
      default:
        return "border-gray-300"
    }
  }

  const handleStatusChange = async (newStatus) => {
    try {
      const updatedTask = await taskService.updateTask(task.id, { status: newStatus })
      if (updatedTask) {
        setTasks((prevTasks) => prevTasks.map((t) => (t.id === task.id ? updatedTask : t)))
        toast.success(`Task moved to ${newStatus}`)
      }
    } catch (err) {
      console.error("Failed to update task status", err)
      toast.error("Failed to update task status")
    }
    setShowStatusMenu(false)
  }

  const toggleStatusMenu = (e) => {
    e.stopPropagation()
    setShowStatusMenu(!showStatusMenu)
  }

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setShowStatusMenu(false)
      }
    }

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setShowStatusMenu(false)
      }
    }

    if (showStatusMenu) {
      document.addEventListener("mousedown", handleClickOutside)
      document.addEventListener("keydown", handleEscape)
      return () => {
        document.removeEventListener("mousedown", handleClickOutside)
        document.removeEventListener("keydown", handleEscape)
      }
    }
  }, [showStatusMenu])

  const priorityTag = PRIORITY_TAGS.find((p) => p.name === task.priority) || PRIORITY_TAGS[0]

  // Function to truncate text with word break
  const truncateText = (text, maxLength) => {
    if (!text) return ""
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + "..."
  }

  // Function to detect and render links in text
  const renderTextWithLinks = (text) => {
    if (!text) return null

    const urlRegex = /(https?:\/\/[^\s]+)/g
    const parts = text.split(urlRegex)

    return parts.map((part, index) => {
      if (urlRegex.test(part)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline break-all"
            onClick={(e) => e.stopPropagation()}
          >
            {part.length > 30 ? `${part.substring(0, 30)}...` : part}
          </a>
        )
      }
      return (
        <span key={index} className="break-words">
          {part}
        </span>
      )
    })
  }

  return (
    <div
      ref={drag}
      className={`p-3 sm:p-4 bg-white rounded-lg shadow-sm mb-2 sm:mb-3 border-l-4 ${getBorderColor(task.status)} 
        ${isDragging ? "opacity-50" : ""} hover:shadow-md transition-shadow cursor-grab relative group`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => {
        setShowActions(false)
        if (!showStatusMenu) setShowStatusMenu(false)
      }}
    >
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1 min-w-0">
          <h3
            className="font-medium cursor-pointer hover:text-army-green-800 transition-colors break-words hyphens-auto text-sm sm:text-base"
            onClick={() => onViewTask(task)}
            style={{
              wordBreak: "break-word",
              overflowWrap: "break-word",
              hyphens: "auto",
            }}
            title={task.title}
          >
            {truncateText(task.title, 50)}
          </h3>
          <p className="text-xs text-gray-500 mt-1">{formattedDate}</p>
        </div>
        <div className="flex-shrink-0 relative">
          <button
            ref={buttonRef}
            onClick={toggleStatusMenu}
            className="p-1.5 text-sm rounded-md text-gray-600 hover:bg-gray-100 transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-army-green-500"
            title="More options"
            aria-label="More options"
            aria-expanded={showStatusMenu}
            aria-haspopup="true"
          >
            <FaEllipsisV />
          </button>

          {/* Enhanced Status Menu - Mobile Optimized */}
          {showStatusMenu && (
            <div
              ref={menuRef}
              className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-xl border border-gray-200 z-[9999] min-w-[180px] overflow-hidden"
              role="menu"
              aria-orientation="vertical"
              aria-labelledby="status-menu"
            >
              <div className="py-1">
                <div className="px-3 sm:px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide border-b border-gray-100">
                  Move to Status
                </div>
                <button
                  onClick={() => handleStatusChange("Pending")}
                  className="w-full px-3 sm:px-4 py-2 text-black text-left text-sm hover:bg-yellow-50 flex items-center gap-2 transition-colors focus:outline-none focus:bg-yellow-50"
                  role="menuitem"
                  disabled={task.status === "Pending"}
                >
                  <FaHourglass className="text-yellow-500" />
                  <span>Pending</span>
                  {task.status === "Pending" && <span className="ml-auto text-xs text-gray-500">Current</span>}
                </button>
                <button
                  onClick={() => handleStatusChange("In Progress")}
                  className="w-full px-3 sm:px-4 py-2 text-black text-left text-sm hover:bg-blue-50 flex items-center gap-2 transition-colors focus:outline-none focus:bg-blue-50"
                  role="menuitem"
                  disabled={task.status === "In Progress"}
                >
                  <FaClock className="text-blue-500" />
                  <span>In Progress</span>
                  {task.status === "In Progress" && <span className="ml-auto text-xs text-gray-500">Current</span>}
                </button>
                <button
                  onClick={() => handleStatusChange("Completed")}
                  className="w-full px-3 sm:px-4 py-2 text-black text-left text-sm hover:bg-green-50 flex items-center gap-2 transition-colors focus:outline-none focus:bg-green-50"
                  role="menuitem"
                  disabled={task.status === "Completed"}
                >
                  <FaCheck className="text-green-500" />
                  <span>Completed</span>
                  {task.status === "Completed" && <span className="ml-auto text-xs text-gray-500">Current</span>}
                </button>
                <div className="border-t border-gray-100 mt-1 pt-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onEditTask(task)
                      setShowStatusMenu(false)
                    }}
                    className="w-full px-3 sm:px-4 py-2 text-black text-left text-sm hover:bg-gray-50 flex items-center gap-2 transition-colors focus:outline-none focus:bg-gray-50"
                    role="menuitem"
                  >
                    <FaEdit className="text-gray-500" />
                    <span>Edit Task</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeleteTask(task.id)
                      setShowStatusMenu(false)
                    }}
                    className="w-full px-3 sm:px-4 py-2 text-red-600 text-left text-sm hover:bg-red-50 flex items-center gap-2 transition-colors focus:outline-none focus:bg-red-50"
                    role="menuitem"
                  >
                    <FaTrash className="text-red-500" />
                    <span>Delete Task</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {task.description && (
        <div
          className="text-xs sm:text-sm text-gray-600 mt-2 break-words"
          style={{ wordBreak: "break-word", overflowWrap: "break-word" }}
        >
          <div className="line-clamp-2">{renderTextWithLinks(truncateText(task.description, 100))}</div>
        </div>
      )}

      <div className="mt-2 flex items-center justify-between">
        <span
          className="text-xs font-medium px-2 py-1 rounded-full"
          style={{
            backgroundColor: priorityTag.bgColor,
            color: priorityTag.color,
          }}
        >
          {task.priority}
        </span>

        {/* Action buttons - Always visible on mobile, hover on desktop */}
        <div
          className={`flex gap-1 transition-opacity duration-200 ${
            showActions ? "opacity-100" : "sm:opacity-0 opacity-100"
          }`}
        >
          <button
            onClick={(e) => {
              e.stopPropagation()
              onViewTask(task)
            }}
            className="p-1.5 text-sm rounded-md text-gray-600 hover:bg-gray-100 transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-army-green-500"
            title="View task"
            aria-label="View task"
          >
            <FaEye />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onEditTask(task)
            }}
            className="p-1.5 text-sm rounded-md text-gray-600 hover:bg-gray-100 transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-army-green-500"
            title="Edit task"
            aria-label="Edit task"
          >
            <FaEdit />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDeleteTask(task.id)
            }}
            className="p-1.5 text-sm rounded-md text-gray-600 hover:bg-red-100 hover:text-red-600 transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-red-500"
            title="Delete task"
            aria-label="Delete task"
          >
            <FaTrash />
          </button>
        </div>
      </div>
    </div>
  )
}
