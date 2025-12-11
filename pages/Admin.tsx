import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Users, MessageSquare, AlertCircle, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

// Mock Data
const userGrowthData = [
  { name: 'Jan', users: 400 },
  { name: 'Feb', users: 600 },
  { name: 'Mar', users: 900 },
  { name: 'Apr', users: 1200 },
  { name: 'May', users: 1800 },
  { name: 'Jun', users: 2400 },
];

const diseaseQueriesData = [
  { name: 'Fever', count: 320 },
  { name: 'Dengue', count: 210 },
  { name: 'Cold', count: 180 },
  { name: 'Typhoid', count: 150 },
  { name: 'Malaria', count: 90 },
];

export default function Admin() {
  const { user } = useAuth();

  // Basic security check (already handled by ProtectedRoute mostly, but double check role)
  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
        <div className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full font-semibold uppercase">System Healthy</div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-lg"><Users size={20} /></div>
            <span className="text-green-500 text-sm font-medium flex items-center"><TrendingUp size={14} className="mr-1" /> +12%</span>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white">2,450</h3>
          <p className="text-gray-500 text-sm">Total Users</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
             <div className="p-3 bg-purple-100 text-purple-600 rounded-lg"><MessageSquare size={20} /></div>
             <span className="text-green-500 text-sm font-medium flex items-center"><TrendingUp size={14} className="mr-1" /> +8%</span>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white">14.2k</h3>
          <p className="text-gray-500 text-sm">Total Chat Sessions</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
           <div className="flex items-center justify-between mb-4">
             <div className="p-3 bg-orange-100 text-orange-600 rounded-lg"><AlertCircle size={20} /></div>
             <span className="text-orange-500 text-sm font-medium">Stable</span>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white">856</h3>
          <p className="text-gray-500 text-sm">Symptom Checks Today</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-6">User Growth</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Line type="monotone" dataKey="users" stroke="#22c55e" strokeWidth={3} dot={{r: 4, fill: '#22c55e', strokeWidth: 2, stroke: '#fff'}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-6">Top Disease Queries</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={diseaseQueriesData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={80} tick={{fill: '#4b5563', fontSize: 12}} />
                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Recent Activity Table (Mock) */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white">Recent System Activity</h3>
          </div>
          <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600 dark:text-gray-400">
                  <thead className="bg-gray-50 dark:bg-gray-700/50">
                      <tr>
                          <th className="px-6 py-3 font-medium">User</th>
                          <th className="px-6 py-3 font-medium">Action</th>
                          <th className="px-6 py-3 font-medium">Time</th>
                          <th className="px-6 py-3 font-medium">Status</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      <tr>
                          <td className="px-6 py-4">Ramesh Kumar</td>
                          <td className="px-6 py-4">Vaccination Schedule Generated</td>
                          <td className="px-6 py-4">2 mins ago</td>
                          <td className="px-6 py-4"><span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">Success</span></td>
                      </tr>
                      <tr>
                          <td className="px-6 py-4">Priya Singh</td>
                          <td className="px-6 py-4">Symptom Checker: "High Fever"</td>
                          <td className="px-6 py-4">15 mins ago</td>
                          <td className="px-6 py-4"><span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">Success</span></td>
                      </tr>
                      <tr>
                          <td className="px-6 py-4">Amit Shah</td>
                          <td className="px-6 py-4">Resources Search: "ENT Specialist"</td>
                          <td className="px-6 py-4">32 mins ago</td>
                          <td className="px-6 py-4"><span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">Partial</span></td>
                      </tr>
                  </tbody>
              </table>
          </div>
      </div>
    </div>
  );
}