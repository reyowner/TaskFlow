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
} from "react-icons/fa"
import { useAuth } from "@/contexts/AuthContext"
import { DndProvider, useDrag, useDrop } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
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
          <div className="w-16 h-16 border-4 border-army-light border-t-army-green-800 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading tasks...</p>
        </div>
      </div>
    )
  }

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-army-light">
        <div className="text-center bg-white/90 backdrop-blur-sm rounded-2xl p-12 max-w-md mx-auto border border-gray-200/50 shadow-lg">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaExclamationCircle className="text-3xl text-red-500" />
          </div>
          <h1 className="text-2xl font-semibold text-army-dark mb-4">Category not found</h1>
          <button
            onClick={() => router.push("/categories")}
            className="px-6 py-3 bg-gradient-to-r from-army-green-800 to-army-green-700 hover:from-army-green-700 hover:to-army-green-600 text-white rounded-xl font-medium transition-all transform hover:scale-105 shadow-lg"
          >
            <FaArrowLeft className="mr-2 inline" /> Go back to categories
          </button>
        </div>
      </div>
    )
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-army-light">
        {/* Header Section */}
        <div className="backdrop-blur-sm sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <button
                    onClick={() => router.push("/categories")}
                    className="p-3 rounded-xl shadow-sm hover:bg-army-light transition-colors"
                    aria-label="Go back to categories"
                  >
                    <FaArrowLeft className="text-army-dark" />
                  </button>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-xl shadow-sm flex items-center justify-center"
                      style={{ backgroundColor: category.color }}
                    >
                      <FaFolder className="text-white text-xl" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold text-army-dark">{category.name}</h1>
                      <p className="text-gray-600 mt-1">
                        {tasks.length} {tasks.length === 1 ? "task" : "tasks"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Priority Filter */}
                <div className="mb-6 backdrop-blur-sm rounded-xl p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex items-center gap-2">
                      <FaFilter className="text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">Filter by Priority:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setPriorityFilter("All")}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                          priorityFilter === "All" ? "bg-army-green-800 text-white shadow-sm" : "text-gray-700"
                        }`}
                      >
                        All
                      </button>
                      {PRIORITY_TAGS.map((tag) => (
                        <button
                          key={tag.name}
                          onClick={() => setPriorityFilter(tag.name)}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
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

                {/* Stats Cards - Removed redundant completion rate */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-army-light rounded-lg">
                        <FaTasks className="text-army-green-800" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Tasks</p>
                        <p className="text-2xl font-bold text-army-dark">{totalTasks}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <FaClock className="text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">In Progress</p>
                        <p className="text-2xl font-bold text-army-dark">{inProgressTasks}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <FaCheckCircle className="text-army-green-500" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Completed</p>
                        <p className="text-2xl font-bold text-army-dark">{completedTasks}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div>
                <button
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all transform ${
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
                      <FaTimes /> Cancel
                    </>
                  ) : (
                    <>
                      <FaPlus className="text-lg" /> New Task
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          {/* Task Form Modal */}
          {showForm && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center p-4">
              <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden">
                <div
                  className="px-6 py-4 flex justify-between items-center"
                  style={{
                    background: `linear-gradient(135deg, ${category.color}dd, ${category.color})`,
                  }}
                >
                  <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <FaTasks />
                    {editingTask ? "Edit Task" : "Create New Task"}
                  </h2>
                  <button onClick={resetForm} className="text-white/80 hover:text-white transition-colors">
                    <FaTimes />
                  </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-army-dark text-sm font-medium mb-3" htmlFor="title">
                        Task Title
                      </label>
                      <input
                        id="title"
                        type="text"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-army-green-500 focus:border-transparent transition-all"
                        placeholder="Enter task title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-army-dark text-sm font-medium mb-3">Priority</label>
                      <div className="flex gap-3">
                        {PRIORITY_TAGS.map((tag) => (
                          <button
                            key={tag.name}
                            type="button"
                            onClick={() => setSelectedPriority(tag)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
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
                  <div className="mt-6">
                    <label className="block text-army-dark text-sm font-medium mb-3" htmlFor="description">
                      Task Description
                    </label>
                    <textarea
                      id="description"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-army-green-500 focus:border-transparent transition-all min-h-32"
                      placeholder="Enter task details"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={6}
                    />
                  </div>
                  <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all"
                      onClick={resetForm}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-3 bg-gradient-to-r from-army-green-800 to-army-green-700 text-white rounded-xl font-medium transition-all transform hover:scale-[1.02] hover:-translate-y-0.5 hover:brightness-110 shadow-lg hover:shadow-xl hover:shadow-army-green-800/30 disabled:opacity-50"
                      disabled={buttonLoading}
                    >
                      {buttonLoading ? "Saving..." : editingTask ? "Update Task" : "Create Task"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Task Columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

          {/* Task Viewing Modal */}
          {viewingTask && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center p-4">
              <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-auto">
                <div className="bg-gradient-to-r from-army-green-800 to-army-green-700 px-6 py-4 flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-white">Task Details</h3>
                  <button
                    className="text-white/80 hover:text-white transition-colors"
                    onClick={() => setViewingTask(null)}
                  >
                    <FaTimes />
                  </button>
                </div>
                <div className="p-6">
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span
                      className={`text-sm font-medium px-3 py-1 rounded-full ${
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
                      className="text-sm font-medium px-3 py-1 rounded-full"
                      style={{
                        backgroundColor: PRIORITY_TAGS.find((p) => p.name === viewingTask.priority)?.bgColor,
                        color: PRIORITY_TAGS.find((p) => p.name === viewingTask.priority)?.color,
                      }}
                    >
                      {viewingTask.priority}
                    </span>
                  </div>
                  <h2 className="text-2xl font-semibold text-army-dark mb-4">{viewingTask.title}</h2>
                  {viewingTask.description ? (
                    <div className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-xl border border-gray-100">
                      {viewingTask.description}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">No description provided</p>
                  )}
                </div>
                <div className="border-t border-gray-200 p-4 flex justify-end gap-3">
                  <button
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-all"
                    onClick={() => setViewingTask(null)}
                  >
                    Close
                  </button>
                  <button
                    className="px-4 py-2 bg-gradient-to-r from-army-green-800 to-army-green-700 text-white rounded-lg font-medium transition-all transform hover:scale-[1.02] hover:-translate-y-0.5 hover:brightness-110 shadow-lg hover:shadow-xl hover:shadow-army-green-800/30 flex items-center gap-2"
                    onClick={() => {
                      handleEditTask(viewingTask)
                      setViewingTask(null)
                    }}
                  >
                    <FaEdit /> Edit
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {showConfirmDelete && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center p-4">
              <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
                <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4">
                  <h3 className="text-lg font-semibold text-white">Confirm Deletion</h3>
                </div>
                <div className="p-6">
                  <p className="text-gray-600 mb-6">
                    Are you sure you want to delete this task? This action cannot be undone.
                  </p>
                  <div className="flex justify-end gap-3">
                    <button
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-all"
                      onClick={() => setShowConfirmDelete(null)}
                    >
                      Cancel
                    </button>
                    <button
                      className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg font-medium transition-all"
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
      className={`rounded-xl border ${colors.border} ${
        isOver ? "ring-2 ring-army-green-500" : ""
      } transition-all h-full flex flex-col bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md`}
    >
      <div className={`p-4 ${colors.bg} rounded-t-xl border-b ${colors.border}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon}
            <h2 className={`text-lg font-medium ${colors.text}`}>{status}</h2>
          </div>
          <span className="bg-white/80 backdrop-blur-sm text-sm py-1 px-3 rounded-full shadow-sm">{tasks.length}</span>
        </div>
      </div>
      <div className="p-3 flex-grow">
        {tasks && tasks.length > 0 ? (
          <div className="space-y-3">
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
          <div className="text-center py-8 text-gray-400">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
              {icon}
            </div>
            <p className="font-medium">No tasks in this column</p>
            <p className="text-sm mt-1">Drag and drop tasks here</p>
          </div>
        )}
      </div>
    </div>
  )
}

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
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 })
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
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      const viewportHeight = window.innerHeight
      const menuHeight = 120 // Approximate menu height

      let top = rect.bottom + window.scrollY + 5
      let left = rect.right - 150

      // Adjust if menu would go off screen
      if (rect.bottom + menuHeight > viewportHeight) {
        top = rect.top + window.scrollY - menuHeight - 5
      }

      if (left < 10) {
        left = 10
      }

      setMenuPosition({ top, left })
    }
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

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [showStatusMenu])

  const priorityTag = PRIORITY_TAGS.find((p) => p.name === task.priority) || PRIORITY_TAGS[0]

  return (
    <div
      ref={drag}
      className={`p-4 bg-white rounded-lg shadow-sm mb-3 border-l-4 ${getBorderColor(task.status)} 
        ${isDragging ? "opacity-50" : ""} hover:shadow-md transition-shadow cursor-grab relative group`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => {
        setShowActions(false)
        if (!showStatusMenu) setShowStatusMenu(false)
      }}
    >
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1">
          <h3
            className="font-medium truncate cursor-pointer hover:text-army-green-800 transition-colors"
            onClick={() => onViewTask(task)}
          >
            {task.title}
          </h3>
          <p className="text-xs text-gray-500 mt-1">{formattedDate}</p>
        </div>
        <button
          ref={buttonRef}
          onClick={toggleStatusMenu}
          className="p-1.5 text-sm rounded-md text-gray-600 hover:bg-gray-100 transition-all hover:scale-110"
          title="Change status"
        >
          <FaEllipsisV />
        </button>
      </div>

      {task.description && <p className="text-sm text-gray-600 mt-1 line-clamp-2">{task.description}</p>}

      <div className="mt-2">
        <span
          className="text-xs font-medium px-2 py-1 rounded-full"
          style={{
            backgroundColor: priorityTag.bgColor,
            color: priorityTag.color,
          }}
        >
          {task.priority}
        </span>
      </div>

      {/* Status Menu */}
      {showStatusMenu && (
        <div
          ref={menuRef}
          className="fixed bg-white rounded-lg shadow-xl border border-gray-200 z-[9999] min-w-[150px] overflow-hidden"
          style={{
            top: `${menuPosition.top}px`,
            left: `${menuPosition.left}px`,
          }}
        >
          <div className="py-1">
            <button
              onClick={() => handleStatusChange("Pending")}
              className="w-full px-4 py-2 text-black text-left text-sm hover:bg-yellow-50 flex items-center gap-2 transition-colors"
            >
              <FaHourglass className="text-yellow-500" />
              Move to Pending
            </button>
            <button
              onClick={() => handleStatusChange("In Progress")}
              className="w-full px-4 py-2 text-black text-left text-sm hover:bg-blue-50 flex items-center gap-2 transition-colors"
            >
              <FaClock className="text-blue-500" />
              Move to In Progress
            </button>
            <button
              onClick={() => handleStatusChange("Completed")}
              className="w-full px-4 py-2 text-black text-left text-sm hover:bg-green-50 flex items-center gap-2 transition-colors"
            >
              <FaCheck className="text-green-500" />
              Move to Completed
            </button>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div
        className={`mt-3 flex justify-end gap-1 transition-opacity duration-200 ${
          showActions ? "opacity-100" : "opacity-0"
        }`}
      >
        <button
          onClick={() => onViewTask(task)}
          className="p-1.5 text-sm rounded-md text-gray-600 hover:bg-gray-100 transition-all hover:scale-110"
          title="View task"
        >
          <FaEye />
        </button>
        <button
          onClick={() => onEditTask(task)}
          className="p-1.5 text-sm rounded-md text-gray-600 hover:bg-gray-100 transition-all hover:scale-110"
          title="Edit task"
        >
          <FaEdit />
        </button>
        <button
          onClick={() => onDeleteTask(task.id)}
          className="p-1.5 text-sm rounded-md text-gray-600 hover:bg-red-100 hover:text-red-600 transition-all hover:scale-110"
          title="Delete task"
        >
          <FaTrash />
        </button>
      </div>
    </div>
  )
}
