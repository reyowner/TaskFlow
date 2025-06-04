import api from '../utils/api';

const getTasks = async (categoryId = null) => {
  try {
    console.log('Fetching tasks...');
    const token = localStorage.getItem('token');
    console.log('Token:', token ? 'Present' : 'Not present');
    
    const params = {};
    if (categoryId) {
      params.category_id = categoryId;
    }
    
    const response = await api.get('/api/tasks', {
      params,
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
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

const createTask = async (taskData) => {
  try {
    console.log('Creating task:', taskData);
    const token = localStorage.getItem('token');
    const response = await api.post('/api/tasks', taskData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
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

const updateTask = async (taskId, taskData) => {
  try {
    console.log('Updating task:', taskId, taskData);
    const token = localStorage.getItem('token');
    const response = await api.put(`/api/tasks/${taskId}`, taskData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
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

const deleteTask = async (taskId) => {
  try {
    console.log('Deleting task:', taskId);
    const token = localStorage.getItem('token');
    const response = await api.delete(`/api/tasks/${taskId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
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

const updateTaskStatus = async (taskId, status) => {
  try {
    console.log('Updating task status:', taskId, status);
    const token = localStorage.getItem('token');
    const response = await api.patch(`/api/tasks/${taskId}/status`, { status }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('Update status response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating task status:', error);
    if (error.response) {
      console.error('Error response:', error.response.data);
      console.error('Error status:', error.response.status);
    }
    throw error;
  }
};

export default {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  updateTaskStatus
}; 