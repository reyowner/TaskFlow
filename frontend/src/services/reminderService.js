import api from '../utils/api';

const getReminders = async () => {
  try {
    const response = await api.get('/reminders');
    return response.data;
  } catch (error) {
    throw error;
  }
};

const createReminder = async (reminderData) => {
  try {
    const response = await api.post('/reminders', reminderData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const updateReminder = async (id, reminderData) => {
  try {
    const response = await api.put(`/reminders/${id}`, reminderData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const deleteReminder = async (id) => {
  try {
    const response = await api.delete(`/reminders/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default {
  getReminders,
  createReminder,
  updateReminder,
  deleteReminder,
}; 