import axios from 'axios';
import { API_URL } from '../config/api';

export const tagService = {
  async getTags() {
    const response = await axios.get(`${API_URL}/tags/`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.data;
  },

  async createTag(tag) {
    const response = await axios.post(
      `${API_URL}/tags/`,
      tag,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );
    return response.data;
  },

  async updateTag(id, tag) {
    const response = await axios.put(
      `${API_URL}/tags/${id}`,
      tag,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );
    return response.data;
  },

  async deleteTag(id) {
    const response = await axios.delete(
      `${API_URL}/tags/${id}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );
    return response.data;
  },
}; 