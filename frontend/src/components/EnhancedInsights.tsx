import React, { useEffect, useState } from 'react';
import { getInsights, InsightsResponse, HighPriorityTask, Activity, WeeklyInsights } from '../services/insightsService';
import { formatDistanceToNow } from 'date-fns';
import { FiAlertCircle, FiCheckCircle, FiPlusCircle, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

const EnhancedInsights: React.FC = () => {
  const [insights, setInsights] = useState<InsightsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const data = await getInsights();
        setInsights(data);
      } catch (err) {
        setError('Failed to load insights');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, []);

  if (loading) return <div className="animate-pulse">Loading insights...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!insights) return null;

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'task_completion':
        return <FiCheckCircle className="text-green-500" />;
      case 'task_creation':
        return <FiPlusCircle className="text-blue-500" />;
      case 'category_addition':
        return <FiPlusCircle className="text-purple-500" />;
      default:
        return <FiPlusCircle className="text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6 p-4">
      {/* High Priority Tasks Section */}
      <section className="bg-white rounded-lg shadow p-4">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <FiAlertCircle className="text-red-500 mr-2" />
          High Priority Tasks
        </h2>
        {insights.high_priority_tasks.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No high priority tasks! 🎉</p>
          </div>
        ) : (
          <div className="space-y-3">
            {insights.high_priority_tasks.map((task) => (
              <div
                key={task.id}
                className="border-l-4 border-red-500 pl-3 py-2 hover:bg-gray-50"
              >
                <h3 className="font-medium">{task.title}</h3>
                {task.days_remaining !== null && (
                  <p className="text-sm text-gray-500">
                    Due in {task.days_remaining} days
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Recent Activity Feed */}
      <section className="bg-white rounded-lg shadow p-4">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <div className="space-y-3">
          {insights.recent_activities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3">
              {getActivityIcon(activity.type)}
              <div>
                <p className="text-sm">{activity.description}</p>
                <p className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Weekly Insights */}
      <section className="bg-white rounded-lg shadow p-4">
        <h2 className="text-xl font-semibold mb-4">Weekly Insights</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600">Tasks Created</p>
            <p className="text-2xl font-bold">{insights.weekly_insights.tasks_created_this_week}</p>
          </div>
          <div className="p-3 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-600">Tasks Completed</p>
            <p className="text-2xl font-bold">{insights.weekly_insights.tasks_completed_this_week}</p>
          </div>
          <div className="col-span-2 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Productivity Trend</p>
            <div className="flex items-center">
              {insights.weekly_insights.productivity_trend >= 0 ? (
                <FiTrendingUp className="text-green-500 mr-2" />
              ) : (
                <FiTrendingDown className="text-red-500 mr-2" />
              )}
              <p className="text-xl font-bold">
                {Math.abs(insights.weekly_insights.productivity_trend).toFixed(1)}%
                {insights.weekly_insights.productivity_trend >= 0 ? ' increase' : ' decrease'}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default EnhancedInsights; 