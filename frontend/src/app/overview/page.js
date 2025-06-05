"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import Link from "next/link"
import {
  FaPlus,
  FaFolder,
  FaTasks,
  FaCheckCircle,
  FaClock,
  FaHourglass,
  FaArrowRight,
  FaChartLine,
  FaFire,
  FaTrophy,
  FaEye,
} from "react-icons/fa"
import categoryService from "@/services/categoryService"
import taskService from "@/services/taskService"
import { toast } from "react-hot-toast"

export default function OverviewPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalCategories: 0,
    totalTasks: 0,
    pendingTasks: 0,
    inProgressTasks: 0,
    completedTasks: 0,
    completionRate: 0,
  })
  const [recentCategories, setRecentCategories] = useState([])
  const [recentTasks, setRecentTasks] = useState([])
  const [upcomingTasks, setUpcomingTasks] = useState([])
  const [recentActivity, setRecentActivity] = useState([])
  const [weeklyStats, setWeeklyStats] = useState({
    tasksCreated: 0,
    tasksCompleted: 0,
    productivityTrend: 0,
  })

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }
    fetchOverviewData()
  }, [isAuthenticated, router])

  const fetchOverviewData = async () => {
    try {
      setLoading(true)
      const [categoriesData, tasksData] = await Promise.all([categoryService.getCategories(), taskService.getTasks()])

      // Calculate stats
      const totalCategories = categoriesData.length
      const totalTasks = tasksData.length
      const pendingTasks = tasksData.filter((task) => task.status === "Pending").length
      const inProgressTasks = tasksData.filter((task) => task.status === "In Progress").length
      const completedTasks = tasksData.filter((task) => task.status === "Completed").length
      const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

      setStats({
        totalCategories,
        totalTasks,
        pendingTasks,
        inProgressTasks,
        completedTasks,
        completionRate,
      })

      // Get recent categories (last 3)
      const sortedCategories = categoriesData
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 3)
      setRecentCategories(sortedCategories)

      // Get recent tasks (last 5)
      const sortedTasks = tasksData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5)
      setRecentTasks(sortedTasks)

      // Get upcoming tasks with due dates
      const upcomingTasksWithDates = tasksData
        .filter((task) => task.due_date && task.status !== "Completed")
        .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
        .slice(0, 4)
        .map((task) => ({
          ...task,
          daysRemaining: Math.ceil((new Date(task.due_date) - new Date()) / (1000 * 60 * 60 * 24)),
        }))
      setUpcomingTasks(upcomingTasksWithDates)

      // Generate recent activity
      const activity = generateRecentActivity(tasksData, categoriesData)
      setRecentActivity(activity)

      // Calculate weekly stats
      const weekStats = calculateWeeklyStats(tasksData)
      setWeeklyStats(weekStats)
    } catch (error) {
      console.error("Error fetching overview data:", error)
      toast.error("Failed to load overview data")
    } finally {
      setLoading(false)
    }
  }

  const generateRecentActivity = (tasks, categories) => {
    const activities = []

    // Recent task completions
    const recentCompletions = tasks
      .filter((task) => task.status === "Completed")
      .sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at))
      .slice(0, 3)
      .map((task) => ({
        type: "completion",
        title: `Completed "${task.title}"`,
        time: getRelativeTime(task.updated_at || task.created_at),
        icon: FaCheckCircle,
        color: "text-green-600",
        bgColor: "bg-green-50",
      }))

    // Recent task creations
    const recentCreations = tasks
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 2)
      .map((task) => ({
        type: "creation",
        title: `Created "${task.title}"`,
        time: getRelativeTime(task.created_at),
        icon: FaPlus,
        color: "text-blue-600",
        bgColor: "bg-blue-50",
      }))

    // Recent category creations
    const recentCategoryCreations = categories
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 1)
      .map((category) => ({
        type: "category",
        title: `Created category "${category.name}"`,
        time: getRelativeTime(category.created_at),
        icon: FaFolder,
        color: "text-purple-600",
        bgColor: "bg-purple-50",
      }))

    return [...recentCompletions, ...recentCreations, ...recentCategoryCreations]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 5)
  }

  const calculateWeeklyStats = (tasks) => {
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    const thisWeekTasks = tasks.filter((task) => new Date(task.created_at) >= oneWeekAgo)
    const thisWeekCompleted = tasks.filter(
      (task) => task.status === "Completed" && new Date(task.updated_at || task.created_at) >= oneWeekAgo,
    )

    const lastWeekTasks = tasks.filter((task) => {
      const taskDate = new Date(task.created_at)
      const twoWeeksAgo = new Date()
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)
      return taskDate >= twoWeeksAgo && taskDate < oneWeekAgo
    })

    const productivityTrend =
      lastWeekTasks.length > 0
        ? Math.round(((thisWeekCompleted.length - lastWeekTasks.length) / lastWeekTasks.length) * 100)
        : thisWeekCompleted.length > 0
          ? 100
          : 0

    return {
      tasksCreated: thisWeekTasks.length,
      tasksCompleted: thisWeekCompleted.length,
      productivityTrend,
    }
  }

  const getRelativeTime = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    return `${Math.floor(diffInDays / 7)}w ago`
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 17) return "Good afternoon"
    return "Good evening"
  }

  const getMotivationalMessage = () => {
    const { completionRate, totalTasks } = stats
    if (totalTasks === 0) return "Ready to start your productivity journey?"
    if (completionRate >= 80) return "Outstanding work! You're crushing your goals! 🎉"
    if (completionRate >= 60) return "Great progress! Keep up the momentum! 💪"
    if (completionRate >= 40) return "You're making good headway! Stay focused! 🎯"
    return "Every task completed is a step forward! You've got this! 🚀"
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "Pending":
        return <FaHourglass className="text-yellow-500" />
      case "In Progress":
        return <FaClock className="text-blue-500" />
      case "Completed":
        return <FaCheckCircle className="text-green-500" />
      default:
        return null
    }
  }

  const truncateText = (text, maxLength) => {
    if (!text) return ""
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + "..."
  }

  const handleTaskClick = (task) => {
    if (task.category_id) {
      router.push(`/dashboard/${task.category_id}?taskId=${task.id}`)
    } else {
      router.push('/categories')
    }
  }

  const handleCategoryClick = (category) => {
    router.push(`/dashboard/${category.id}`)
  }

  const handleActivityClick = (activity) => {
    if (activity.type === 'completion' || activity.type === 'creation') {
      // For task-related activities, find the task and navigate to its category
      const task = recentTasks.find(t => t.title === activity.title.split('"')[1])
      if (task && task.category_id) {
        router.push(`/dashboard/${task.category_id}?taskId=${task.id}`)
      } else {
        router.push('/categories')
      }
    } else if (activity.type === 'category') {
      // For category-related activities, find the category and navigate to it
      const category = recentCategories.find(c => c.name === activity.title.split('"')[1])
      if (category) {
        router.push(`/dashboard/${category.id}`)
      } else {
        router.push('/categories')
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-army-light flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-army-light border-t-army-green-800 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium text-sm sm:text-base">Loading your overview...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-army-light">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Welcome Section */}
        <div className="mb-6 sm:mb-8">
          <div className="bg-gradient-to-r from-army-green-800 to-army-green-700 rounded-xl sm:rounded-2xl p-6 sm:p-8 text-white shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="mb-4 sm:mb-0">
                <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                  {getGreeting()}, {user?.username}! 👋
                </h1>
                <p className="text-white/90 text-base sm:text-lg">{getMotivationalMessage()}</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/categories"
                  className="px-4 sm:px-6 py-2.5 sm:py-3 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                >
                  <FaFolder className="text-sm" />
                  <span className="hidden sm:inline">View All Categories</span>
                  <span className="sm:hidden">Categories</span>
                </Link>
                <Link
                  href="/categories"
                  className="px-4 sm:px-6 py-2.5 sm:py-3 bg-white text-army-green-800 hover:bg-gray-100 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                >
                  <FaPlus className="text-sm" />
                  <span className="hidden sm:inline">Create Task</span>
                  <span className="sm:hidden">New Task</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg sm:rounded-xl p-4 sm:p-6 border border-gray-200/50 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-army-light rounded-lg">
                <FaFolder className="text-army-green-800 text-lg sm:text-xl" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-gray-600">Categories</p>
                <p className="text-xl sm:text-2xl font-bold text-army-dark">{stats.totalCategories}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-lg sm:rounded-xl p-4 sm:p-6 border border-gray-200/50 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-50 rounded-lg">
                <FaTasks className="text-blue-600 text-lg sm:text-xl" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-gray-600">Total Tasks</p>
                <p className="text-xl sm:text-2xl font-bold text-army-dark">{stats.totalTasks}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-lg sm:rounded-xl p-4 sm:p-6 border border-gray-200/50 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-yellow-50 rounded-lg">
                <FaHourglass className="text-yellow-600 text-lg sm:text-xl" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-gray-600">Pending</p>
                <p className="text-xl sm:text-2xl font-bold text-army-dark">{stats.pendingTasks}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-lg sm:rounded-xl p-4 sm:p-6 border border-gray-200/50 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-50 rounded-lg">
                <FaClock className="text-blue-600 text-lg sm:text-xl" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-gray-600">In Progress</p>
                <p className="text-xl sm:text-2xl font-bold text-army-dark">{stats.inProgressTasks}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-lg sm:rounded-xl p-4 sm:p-6 border border-gray-200/50 shadow-sm hover:shadow-md transition-all col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="relative w-12 h-12 sm:w-16 sm:h-16">
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
                    stroke="#4b5320"
                    strokeWidth="3"
                    strokeDasharray={`${stats.completionRate}, 100`}
                    className="transition-all duration-500 ease-in-out"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm sm:text-base font-bold text-army-dark">{stats.completionRate}%</span>
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-gray-600">Completion Rate</p>
                <p className="text-lg sm:text-xl font-bold text-army-dark">{stats.completedTasks} Done</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Recent Categories */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-200/50 shadow-sm">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-army-dark flex items-center gap-2">
                <FaFolder className="text-army-green-800" />
                Recent Categories
              </h2>
              <Link
                href="/categories"
                className="text-army-green-800 hover:text-army-green-700 text-sm font-medium flex items-center gap-1"
              >
                View All <FaArrowRight className="text-xs" />
              </Link>
            </div>

            {recentCategories.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FaFolder className="text-gray-400 text-xl" />
                </div>
                <p className="text-gray-500 mb-4">No categories yet</p>
                <Link
                  href="/categories"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-army-green-800 text-white rounded-lg text-sm font-medium hover:bg-army-green-700 transition-all"
                >
                  <FaPlus className="text-xs" /> Create Category
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentCategories.map((category) => (
                  <div
                    key={category.id}
                    onClick={() => handleCategoryClick(category)}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: category.color }} />
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium text-army-dark truncate">{category.name}</h3>
                        <p className="text-xs text-gray-500">
                          {category.task_count || 0} {category.task_count === 1 ? "task" : "tasks"}
                        </p>
                      </div>
                    </div>
                    <div className="p-2 text-gray-400 hover:text-army-green-800 transition-colors">
                      <FaEye className="text-sm" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Tasks */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-200/50 shadow-sm">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-army-dark flex items-center gap-2">
                <FaTasks className="text-army-green-800" />
                Recent Tasks
              </h2>
              <Link
                href="/categories"
                className="text-army-green-800 hover:text-army-green-700 text-sm font-medium flex items-center gap-1"
              >
                View All <FaArrowRight className="text-xs" />
              </Link>
            </div>

            {recentTasks.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FaTasks className="text-gray-400 text-xl" />
                </div>
                <p className="text-gray-500 mb-4">No tasks yet</p>
                <Link
                  href="/categories"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-army-green-800 text-white rounded-lg text-sm font-medium hover:bg-army-green-700 transition-all"
                >
                  <FaPlus className="text-xs" /> Create Task
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentTasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => handleTaskClick(task)}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="flex-shrink-0">{getStatusIcon(task.status)}</div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium text-army-dark truncate">{truncateText(task.title, 30)}</h3>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              task.status === "Pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : task.status === "In Progress"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-green-100 text-green-800"
                            }`}
                          >
                            {task.status}
                          </span>
                          {task.priority && <span className="text-gray-400">• {task.priority} Priority</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Insights Section */}
        <div className="mt-6 sm:mt-8">
          <h2 className="text-lg sm:text-xl font-semibold text-army-dark mb-4 flex items-center gap-2">
            <FaFire className="text-army-green-800" />
            Insights
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {/* Upcoming Tasks */}
            <div className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-200/50 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <FaClock className="text-blue-600 text-lg" />
                </div>
                <h3 className="font-semibold text-army-dark">Upcoming Tasks</h3>
              </div>
              {upcomingTasks.length === 0 ? (
                <div className="text-center py-6">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FaCheckCircle className="text-green-600 text-lg" />
                  </div>
                  <p className="text-gray-500 text-sm">No upcoming tasks!</p>
                  <p className="text-gray-400 text-xs mt-1">You're all caught up 🎉</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingTasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => handleTaskClick(task)}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-shrink-0">{getStatusIcon(task.status)}</div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium text-army-dark text-sm truncate">{truncateText(task.title, 25)}</h3>
                        <div className="flex items-center gap-2 text-xs">
                          <span className={`px-2 py-0.5 rounded-full ${
                            task.daysRemaining <= 1
                              ? "bg-red-100 text-red-800"
                              : task.daysRemaining <= 3
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-blue-100 text-blue-800"
                          }`}>
                            {task.daysRemaining === 0
                              ? "Due today"
                              : task.daysRemaining === 1
                              ? "Due tomorrow"
                              : `Due in ${task.daysRemaining} days`}
                          </span>
                          {task.priority && (
                            <span className={`px-2 py-0.5 rounded-full ${
                              task.priority === "High"
                                ? "bg-red-100 text-red-800"
                                : task.priority === "Medium"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-green-100 text-green-800"
                            }`}>
                              {task.priority} Priority
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Activity Feed */}
            <div className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-200/50 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <FaChartLine className="text-blue-600 text-lg" />
                </div>
                <h3 className="font-semibold text-army-dark">Recent Activity</h3>
              </div>
              {recentActivity.length === 0 ? (
                <div className="text-center py-6">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FaChartLine className="text-gray-400 text-lg" />
                  </div>
                  <p className="text-gray-500 text-sm">No recent activity</p>
                  <p className="text-gray-400 text-xs mt-1">Start creating tasks to see activity</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentActivity.map((activity, index) => (
                    <div
                      key={index}
                      onClick={() => handleActivityClick(activity)}
                      className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                    >
                      <div className={`p-2 ${activity.bgColor} rounded-lg flex-shrink-0`}>
                        <activity.icon className={`${activity.color} text-sm`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-army-dark truncate">{activity.title}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Weekly Insights */}
            <div className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-200/50 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-green-50 rounded-lg">
                  <FaTrophy className="text-green-600 text-lg" />
                </div>
                <h3 className="font-semibold text-army-dark">Weekly Insights</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FaPlus className="text-blue-600 text-sm" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-army-dark">Tasks Created</p>
                      <p className="text-xs text-gray-500">This week</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-army-dark">{weeklyStats.tasksCreated}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <FaCheckCircle className="text-green-600 text-sm" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-army-dark">Tasks Completed</p>
                      <p className="text-xs text-gray-500">This week</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-army-dark">{weeklyStats.tasksCompleted}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${weeklyStats.productivityTrend >= 0 ? "bg-green-100" : "bg-red-100"}`}>
                      <FaChartLine
                        className={`text-sm ${weeklyStats.productivityTrend >= 0 ? "text-green-600" : "text-red-600"}`}
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-army-dark">Productivity Trend</p>
                      <p className="text-xs text-gray-500">vs last week</p>
                    </div>
                  </div>
                  <span className={`text-lg font-bold ${weeklyStats.productivityTrend >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {weeklyStats.productivityTrend >= 0 ? "+" : ""}
                    {weeklyStats.productivityTrend}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
