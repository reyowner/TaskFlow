import api from '../utils/api';

const getCategories = async () => {
  try {
    console.log('Fetching categories...');
    const token = localStorage.getItem('token');
    const response = await api.get('/api/categories', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('Categories response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    if (error.response) {
      console.error('Error response:', error.response.data);
      console.error('Error status:', error.response.status);
    }
    throw error;
  }
};

const getCategory = async (id) => {
  try {
    console.log('Fetching category:', id);
    const token = localStorage.getItem('token');
    const response = await api.get(`/api/categories/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('Category response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching category:', error);
    if (error.response) {
      console.error('Error response:', error.response.data);
      console.error('Error status:', error.response.status);
    }
    throw error;
  }
};

const createCategory = async (categoryData) => {
  try {
    console.log('Creating category:', categoryData);
    const token = localStorage.getItem('token');
    const response = await api.post('/api/categories', categoryData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('Create category response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating category:', error);
    if (error.response) {
      console.error('Error response:', error.response.data);
      console.error('Error status:', error.response.status);
    }
    throw error;
  }
};

const updateCategory = async (id, categoryData) => {
  try {
    console.log('Updating category:', id, categoryData);
    const token = localStorage.getItem('token');
    const response = await api.put(`/api/categories/${id}`, categoryData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('Update category response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating category:', error);
    if (error.response) {
      console.error('Error response:', error.response.data);
      console.error('Error status:', error.response.status);
    }
    throw error;
  }
};

const deleteCategory = async (id) => {
  try {
    console.log('Deleting category:', id);
    const token = localStorage.getItem('token');
    const response = await api.delete(`/api/categories/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('Delete category response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error deleting category:', error);
    if (error.response) {
      console.error('Error response:', error.response.data);
      console.error('Error status:', error.response.status);
    }
    throw error;
  }
};

export default {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory
}; 