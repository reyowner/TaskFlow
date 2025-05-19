const API_BASE_URL = "https://taskflow-ru9t.onrender.com";

// Utility function for API requests with authentication
const apiRequest = async (endpoint, method = "GET", body = null) => {
  // Ensure the token is properly retrieved from localStorage
  const token = localStorage.getItem("token");

  if (!token && endpoint !== "/api/users/register" && endpoint !== "/api/users/token") {
    console.error("No authentication token found. Redirecting to login...");
    window.location.href = "/login";
    return;
  }

  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

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

// Fetch all tasks
export const fetchTasks = async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    console.warn("Cannot fetch tasks: No token found.");
    return [];
  }
  return apiRequest("/api/tasks");
};

// Create a new task
export const createTask = async (taskData) => {
  const token = localStorage.getItem("token");
  if (!token) {
    console.warn("Cannot create task: No token found.");
    return null;
  }
  return apiRequest("/api/tasks", "POST", taskData);
};

// Update an existing task
export const updateTask = async (taskId, taskData) => apiRequest(`/api/tasks/${taskId}`, "PUT", taskData);

// Delete a task
export const deleteTask = async (taskId) => apiRequest(`/api/tasks/${taskId}`, "DELETE");

// Register a user
export const registerUser = async (userData) => {
  return apiRequest("/api/users/register", "POST", userData);
};

// Login a user
export const loginUser = async (credentials) => {
  const formData = new URLSearchParams();
  formData.append('username', credentials.email); // OAuth2 expects 'username' field
  formData.append('password', credentials.password);

  const response = await fetch(`${API_BASE_URL}/api/users/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "An error occurred");
  }

  const data = await response.json();
  if (data.access_token) {
    localStorage.setItem("token", data.access_token);
    
    // Fetch user data using the token
    const userResponse = await fetch(`${API_BASE_URL}/api/users/me`, {
      headers: {
        'Authorization': `Bearer ${data.access_token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!userResponse.ok) {
      throw new Error('Failed to fetch user data');
    }

    const userData = await userResponse.json();
    localStorage.setItem("user", JSON.stringify(userData));
    return { ...data, user: userData };
  }
  return data;
};