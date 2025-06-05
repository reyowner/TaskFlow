import axios from 'axios';
import { API_URL } from '../config/api';

export interface HighPriorityTask {
  id: number;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  due_date: string | null;
  days_remaining: number | null;
  category: {
    id: number;
    name: string;
    color: string;
  } | null;
}

export interface Activity {
  id: number;
  type: string;
  description: string;
  timestamp: string;
}

export interface WeeklyInsights {
  tasks_created_this_week: number;
  tasks_completed_this_week: number;
  productivity_trend: number;
  high_priority_tasks: number;
}

export interface InsightsResponse {
  high_priority_tasks: HighPriorityTask[];
  recent_activities: Activity[];
  weekly_insights: WeeklyInsights;
}

export const getInsights = async (): Promise<InsightsResponse> => {
  const response = await axios.get(`${API_URL}/insights/`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });
  return response.data;
}; 