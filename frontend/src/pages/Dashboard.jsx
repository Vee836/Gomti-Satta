import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Helmet } from 'react-helmet-async';
import { Users, FileText, Activity, Clock } from 'lucide-react';
import { format } from 'date-fns';

const StatCard = ({ title, value, icon, bgColor, textColor }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4 transition-transform hover:-translate-y-1">
    <div className={`p-4 rounded-xl ${bgColor} ${textColor}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
    </div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const config = {
          headers: { Authorization: `Bearer ${user.token}` }
        };
        const { data } = await axios.get('/api/dashboard/stats', config);
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [user]);

  if (loading) {
    return <div className="flex h-full items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div></div>;
  }

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Dashboard | Admin Panel</title>
        <meta name="description" content="View platform statistics and activity logs." />
      </Helmet>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Welcome back, {user?.name}</h1>
        <p className="text-gray-500 mt-1">Here is what's happening today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Users" 
          value={stats?.totalUsers || 0} 
          icon={<Users size={24} />} 
          bgColor="bg-blue-50" 
          textColor="text-blue-600" 
        />
        <StatCard 
          title="Active Users" 
          value={stats?.activeUsers || 0} 
          icon={<Activity size={24} />} 
          bgColor="bg-green-50" 
          textColor="text-green-600" 
        />
        <StatCard 
          title="Pending Results" 
          value={stats?.pendingResults || 0} 
          icon={<Clock size={24} />} 
          bgColor="bg-amber-50" 
          textColor="text-amber-600" 
        />
        <StatCard 
          title="Daily Updates" 
          value={stats?.dailyUpdates || 0} 
          icon={<FileText size={24} />} 
          bgColor="bg-purple-50" 
          textColor="text-purple-600" 
        />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 overflow-hidden">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {stats?.recentActivities?.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-gray-500">No recent activity</td>
                </tr>
              ) : (
                stats?.recentActivities?.map((activity) => (
                  <tr key={activity._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {activity.userId?.name || 'System Admin'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        {activity.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {activity.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(activity.timestamp), 'MMM dd, yyyy HH:mm')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
