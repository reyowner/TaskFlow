import axios from 'axios';
import { API_URL } from '../config/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false
});

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    console.log('Making request to:', config.url);
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Authorization header added');
    } else {
      console.log('No token found');
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => {
    console.log('Response received:', response.status);
    return response;
  },
  (error) => {
    console.error('Response error:', error);
    if (error.response) {
      console.error('Error status:', error.response.status);
      console.error('Error data:', error.response.data);
      
      // Handle 401 Unauthorized
      if (error.response.status === 401) {
        console.log('Unauthorized access, clearing auth data');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Don't redirect here, let the component handle the error
      }
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error setting up request:', error.message);
    }
    return Promise.reject(error);
  }
);

// Fetch all tasks
export const fetchTasks = async () => {
  try {
    console.log('Fetching tasks...');
    const response = await api.get('/api/tasks');
    console.log('Tasks response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching tasks:', error);
    if (error.response) {
      console.error('Error response:', error.response.data);
      console.error('Error status:', error.response.status);
    }
    throw error;
  }
};

// Create a new task
export const createTask = async (taskData) => {
  try {
    console.log('Creating task:', taskData);
    const response = await api.post('/api/tasks', taskData);
    console.log('Create task response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating task:', error);
    if (error.response) {
      console.error('Error response:', error.response.data);
      console.error('Error status:', error.response.status);
    }
    throw error;
  }
};

// Update an existing task
export const updateTask = async (taskId, taskData) => {
  try {
    console.log('Updating task:', taskId, taskData);
    const response = await api.put(`/api/tasks/${taskId}`, taskData);
    console.log('Update task response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating task:', error);
    if (error.response) {
      console.error('Error response:', error.response.data);
      console.error('Error status:', error.response.status);
    }
    throw error;
  }
};

// Delete a task
export const deleteTask = async (taskId) => {
  try {
    console.log('Deleting task:', taskId);
    const response = await api.delete(`/api/tasks/${taskId}`);
    console.log('Delete task response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error deleting task:', error);
    if (error.response) {
      console.error('Error response:', error.response.data);
      console.error('Error status:', error.response.status);
    }
    throw error;
  }
};

// Register a user
export const registerUser = async (userData) => {
  try {
    console.log('Registering user:', userData);
    const response = await api.post('/api/users/register', userData);
    console.log('Register response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error registering user:', error);
    if (error.response) {
      console.error('Error response:', error.response.data);
      console.error('Error status:', error.response.status);
    }
    throw error;
  }
};

// Login a user
export const loginUser = async (credentials) => {
  try {
    console.log('Logging in user:', credentials.email);
    const formData = new URLSearchParams();
    formData.append('username', credentials.email);
    formData.append('password', credentials.password);

    const response = await api.post('/api/users/token', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    console.log('Login response:', response.data);
    const { access_token } = response.data;
    if (access_token) {
      localStorage.setItem('token', access_token);
      console.log('Token stored in localStorage');
      
      // Fetch user data using the token
      console.log('Fetching user data...');
      const userResponse = await api.get('/api/users/me');
      const userData = userResponse.data;
      console.log('User data:', userData);
      localStorage.setItem('user', JSON.stringify(userData));
      return { ...response.data, user: userData };
    }
    return response.data;
  } catch (error) {
    console.error('Error logging in:', error);
    if (error.response) {
      console.error('Error response:', error.response.data);
      console.error('Error status:', error.response.status);
    }
    throw error;
  }
};

export default api;