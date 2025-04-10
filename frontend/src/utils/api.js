// Helper functions for API calls

const API_BASE_URL = "http://localhost:8000/api";

// Utility function for API requests with authentication
const apiRequest = async (endpoint, method = "GET", body = null) => {
  // Ensure the token is properly retrieved from localStorage
  const token = localStorage.getItem("token");

  if (!token) {
    console.error("No authentication token found. Redirecting to login...");
    window.location.href = "/login";
    return;
  }

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const options = {
    method,
    headers,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

    if (response.status === 401) {
      console.warn("Unauthorized request. Logging out...");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
      return;
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "An error occurred");
    }

    return await response.json();
  } catch (error) {
    console.error("API request failed:", error);
    throw error;
  }
};

// Fetch all tasks (ensure token exists before calling)
export const fetchTasks = async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    console.warn("Cannot fetch tasks: No token found.");
    return [];
  }
  return apiRequest("/tasks");
};

// Create a new task
export const createTask = async (taskData) => {
  const token = localStorage.getItem("token");
  if (!token) {
    console.warn("Cannot create task: No token found.");
    return null;
  }
  return apiRequest("/tasks", "POST", taskData);
};

// Update an existing task
export const updateTask = async (taskId, taskData) => apiRequest(`/tasks/${taskId}`, "PUT", taskData);

// Delete a task
export const deleteTask = async (taskId) => apiRequest(`/tasks/${taskId}`, "DELETE");