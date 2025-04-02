'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from "@/contexts/AuthContext";
import { fetchTasks, createTask, updateTask, deleteTask } from '@/utils/api';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { FaPlus, FaTimes, FaEye, FaEdit, FaTrash, FaCheck, FaClock, FaHourglass } from 'react-icons/fa';

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [editingTask, setEditingTask] = useState(null);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [viewingTask, setViewingTask] = useState(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(null);
  
  const router = useRouter();
  const { user, logout } = useAuth();

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    loadTasks();
  }, [user, router]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const data = await fetchTasks();
      setTasks(data || []);
      setError('');
    } catch (err) {
      setError('Failed to load tasks. Please try again.');
      console.error(err);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setButtonLoading(true);
    
    if (!title.trim()) {
      setError('Title is required');
      setButtonLoading(false);
      return;
    }
    
    try {
      if (editingTask) {
        const updatedTask = await updateTask(editingTask.id, {
          title,
          description,
          status: editingTask.status
        });
        if (updatedTask) {
          setTasks(tasks.map(task => task.id === editingTask.id ? updatedTask : task));
        }
      } else {
        const newTask = await createTask({ title, description, status: 'Pending' });
        if (newTask) {
          setTasks([...tasks, newTask]);
        }
      }
      resetForm();
    } catch (err) {
      setError('Failed to save task. Please try again.');
      console.error(err);
    } finally {
      setButtonLoading(false);
    }
  };

  const handleEditTask = (task) => {
    setTitle(task.title);
    setDescription(task.description || '');
    setEditingTask(task);
    setShowForm(true);
    window.scrollTo(0, 0);
  };

  const initiateDeleteTask = (taskId) => {
    setShowConfirmDelete(taskId);
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await deleteTask(taskId);
      setTasks(tasks.filter(task => task.id !== taskId));
      setShowConfirmDelete(null);
    } catch (err) {
      setError('Failed to delete task. Please try again.');
      console.error(err);
    }
  };

  const handleViewTask = (task) => {
    setViewingTask(task);
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setEditingTask(null);
    setShowForm(false);
    setError('');
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Pending': return <FaHourglass className="text-yellow-500" />;
      case 'In Progress': return <FaClock className="text-blue-500" />;
      case 'Completed': return <FaCheck className="text-green-500" />;
      default: return null;
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-army-dark">
              {user ? `${user.username}'s Tasks` : 'My Tasks'}
            </h1>
            <p className="text-gray-500 mt-1">Manage and organize your workflow</p>
          </div>
          <button 
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              showForm 
                ? "btn btn-secondary" 
                : "btn btn-primary"
            }`}
            onClick={() => {
              if (showForm) resetForm();
              setShowForm(!showForm);
            }}
            disabled={buttonLoading}
          >
            {showForm 
              ? <><FaTimes /> Cancel</> 
              : <><FaPlus /> Add Task</>
            }
          </button>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-6 flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError('')}><FaTimes /></button>
          </div>
        )}

        {showForm && (
          <div className="bg-white p-6 rounded-lg shadow-lg mb-8 border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">
              {editingTask ? "Edit Task" : "Create New Task"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="title">
                  Task Title
                </label>
                <input
                  id="title"
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-army-light"
                  placeholder="Enter task title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="description">
                  Task Description
                </label>
                <textarea
                  id="description"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-army-light min-h-32"
                  placeholder="Enter task details"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={6}
                />
              </div>
              <div className="flex justify-end">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={resetForm}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={buttonLoading}
                >
                  {buttonLoading ? "Saving..." : editingTask ? "Update Task" : "Save Task"}
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-pulse flex flex-col items-center">
              <div className="w-16 h-16 border-4 border-army-light border-t-army-dark rounded-full animate-spin mb-4"></div>
              <p className="text-gray-500">Loading your tasks...</p>
            </div>
          </div>
        ) : tasks.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-gray-400 text-5xl mb-4">📝</div>
            <h3 className="text-xl font-semibold mb-2">No tasks found</h3>
            <p className="text-gray-500 mb-4">Create your first task to get started!</p>
            <button 
              className="px-4 py-2 bg-army-green-800 hover:bg-army-green-700 text-white rounded-lg inline-flex items-center gap-2"
              onClick={() => setShowForm(true)}
            >
              <FaPlus /> Create Task
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {["Pending", "In Progress", "Completed"].map(status => (
              <TaskColumn 
                key={status}
                status={status}
                icon={getStatusIcon(status)}
                tasks={tasks.filter(task => task && task.status === status)}
                setTasks={setTasks}
                onEditTask={handleEditTask}
                onDeleteTask={initiateDeleteTask}
                onViewTask={handleViewTask}
              />
            ))}
          </div>
        )}

        {/* Task Viewing Modal */}
        {viewingTask && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-auto">
              <div className="flex justify-between items-center border-b p-4">
                <div className="flex items-center gap-2">
                  {getStatusIcon(viewingTask.status)}
                  <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                    viewingTask.status === "Pending" ? "bg-yellow-100 text-yellow-800" :
                    viewingTask.status === "In Progress" ? "bg-blue-100 text-blue-800" :
                    "bg-green-100 text-green-800"
                  }`}>
                    {viewingTask.status}
                  </span>
                </div>
                <button 
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={() => setViewingTask(null)}
                >
                  <FaTimes />
                </button>
              </div>
              <div className="p-6">
                <h2 className="text-2xl font-semibold mb-4">{viewingTask.title}</h2>
                {viewingTask.description ? (
                  <div className="text-gray-700 whitespace-pre-wrap">
                    {viewingTask.description}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No description provided</p>
                )}
              </div>
              <div className="border-t p-4 flex justify-end gap-2">
                <button 
                  className="flex items-center gap-1 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700"
                  onClick={() => setViewingTask(null)}
                >
                  Close
                </button>
                <button 
                  className="flex items-center gap-1 px-3 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700"
                  onClick={() => {
                    handleEditTask(viewingTask);
                    setViewingTask(null);
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
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full">
              <h3 className="text-lg font-semibold mb-2">Confirm Deletion</h3>
              <p className="text-gray-600 mb-4">
                Are you sure you want to delete this task? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button 
                  className="btn btn-secondary"
                  onClick={() => setShowConfirmDelete(null)}
                >
                  Cancel
                </button>
                <button 
                  className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded"
                  onClick={() => handleDeleteTask(showConfirmDelete)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DndProvider>
  );
}

function TaskColumn({ status, tasks, setTasks, onEditTask, onDeleteTask, onViewTask, icon }) {
  const [{ isOver }, drop] = useDrop({
    accept: "TASK",
    drop: (item) => moveTask(item.id, status),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  const moveTask = async (taskId, newStatus) => {
    try {
      const updatedTask = await updateTask(taskId, { status: newStatus });
      if (updatedTask) {
        setTasks(prevTasks => prevTasks.map(task => task.id === taskId ? updatedTask : task));
      }
    } catch (err) {
      console.error("Failed to move task", err);
    }
  };

  const getColumnColor = (status) => {
    switch(status) {
      case 'Pending': return { bg: 'bg-yellow-50', border: 'border-yellow-200' };
      case 'In Progress': return { bg: 'bg-blue-50', border: 'border-blue-200' };
      case 'Completed': return { bg: 'bg-green-50', border: 'border-green-200' };
      default: return { bg: 'bg-gray-50', border: 'border-gray-200' };
    }
  };

  const colors = getColumnColor(status);

  return (
    <div 
      ref={drop} 
      className={`rounded-lg border ${colors.border} ${isOver ? 'ring-2 ring-army-light' : ''} 
        transition-all h-full flex flex-col`}
    >
      <div className={`p-4 ${colors.bg} rounded-t-lg border-b ${colors.border}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon}
            <h2 className="text-lg font-medium">{status}</h2>
          </div>
          <span className="bg-white text-sm py-1 px-2 rounded-full shadow-sm">
            {tasks.length}
          </span>
        </div>
      </div>
      <div className="p-3 bg-white rounded-b-lg flex-grow overflow-auto max-h-[70vh]">
        {tasks && tasks.length > 0 ? (
          tasks.map(task => (
            <TaskCard 
              key={task.id} 
              task={task} 
              onEditTask={onEditTask}
              onDeleteTask={onDeleteTask}
              onViewTask={onViewTask}
            />
          ))
        ) : (
          <div className="text-center py-8 text-gray-400">
            <p>No tasks in this column</p>
            <p className="text-sm">Drag and drop tasks here</p>
          </div>
        )}
      </div>
    </div>
  );
}

function TaskCard({ task, onEditTask, onDeleteTask, onViewTask }) {
  const [{ isDragging }, drag] = useDrag({
    type: "TASK",
    item: { id: task.id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  const [showActions, setShowActions] = useState(false);

  const getBorderColor = (status) => {
    switch(status) {
      case 'Pending': return 'border-yellow-500';
      case 'In Progress': return 'border-blue-500';
      case 'Completed': return 'border-green-500';
      default: return 'border-gray-300';
    }
  };

  return (
    <div
      ref={drag}
      className={`p-4 bg-white rounded-lg shadow-sm mb-3 border-l-4 ${getBorderColor(task.status)} 
        ${isDragging ? "opacity-50" : ""} hover:shadow-md transition-shadow cursor-grab`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex justify-between items-start gap-2">
        <h3 
          className="font-medium truncate cursor-pointer hover:text-army-dark transition-colors"
          onClick={() => onViewTask(task)}
        >
          {task.title}
        </h3>
      </div>
      
      {task.description && (
        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
          {task.description}
        </p>
      )}
      
      <div className={`mt-3 flex justify-end gap-1 transition-opacity ${showActions ? 'opacity-100' : 'opacity-0'}`}>
        <button 
          onClick={() => onViewTask(task)} 
          className="p-1.5 text-sm rounded-md text-gray-600 hover:bg-gray-100"
          title="View task"
        >
          <FaEye />
        </button>
        <button 
          onClick={() => onEditTask(task)} 
          className="p-1.5 text-sm rounded-md text-gray-600 hover:bg-gray-100"
          title="Edit task"
        >
          <FaEdit />
        </button>
        <button 
          onClick={() => onDeleteTask(task.id)} 
          className="p-1.5 text-sm rounded-md text-gray-600 hover:bg-red-100 hover:text-red-600"
          title="Delete task"
        >
          <FaTrash />
        </button>
      </div>
    </div>
  );
}