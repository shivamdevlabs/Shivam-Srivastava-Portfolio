import { useEffect, useState } from 'react';
import api from '../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ projects: 0, certificates: 0, experience: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [projRes, certRes, expRes] = await Promise.all([
          api.get('/portfolio/projects'),
          api.get('/portfolio/certificates'),
          api.get('/portfolio/experience')
        ]);
        setStats({
          projects: projRes.data.length,
          certificates: certRes.data.length,
          experience: expRes.data.length
        });
      } catch (err) {
        console.error("Failed to fetch stats", err);
      }
    };
    fetchStats();
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Projects</h3>
          <p className="text-4xl font-bold mt-2 text-blue-600">{stats.projects}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Certificates</h3>
          <p className="text-4xl font-bold mt-2 text-purple-600">{stats.certificates}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Experience Entries</h3>
          <p className="text-4xl font-bold mt-2 text-green-600">{stats.experience}</p>
        </div>
      </div>
      
      <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl">
        <h2 className="text-xl font-semibold mb-2">Welcome to the Admin Portal</h2>
        <p className="text-gray-600 dark:text-gray-300">
          Use the sidebar to manage your portfolio content, add new projects, update your experience, and handle your settings. All changes will be reflected live on your public portfolio!
        </p>
      </div>
    </div>
  );
};

export default AdminDashboard;
