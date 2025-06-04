import api from '../utils/api';

const login = async (credentials) => {
  const formData = new URLSearchParams();
  formData.append('username', credentials.email);
  formData.append('password', credentials.password);

  const response = await api.post('/users/token', formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  
  const { access_token } = response.data;
  localStorage.setItem('token', access_token);
  return response.data;
};

const register = async (userData) => {
  const response = await api.post('/users/register', userData);
  return response.data;
};

const logout = () => {
  localStorage.removeItem('token');
};

const getToken = () => {
  return localStorage.getItem('token');
};

const isAuthenticated = () => {
  return !!getToken();
};

export default {
  login,
  register,
  logout,
  getToken,
  isAuthenticated,
}; 