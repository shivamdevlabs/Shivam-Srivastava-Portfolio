import { useState, useEffect } from 'react';
import api from '../services/api';
import { FiTrash2, FiPlus } from 'react-icons/fi';

const AdminExperience = () => {
  const [experiences, setExperiences] = useState([]);
  const [status, setStatus] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    role: '',
    company: '',
    location: '',
    start_date: '',
    end_date: '',
    description: ''
  });

  useEffect(() => {
    fetchExperiences();
  }, []);

  const fetchExperiences = async () => {
    try {
      const res = await api.get('/portfolio/experience');
      setExperiences(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setStatus('Adding experience...');
      const payload = {
        role: formData.role,
        company: formData.company,
        location: formData.location,
        start_date: formData.start_date,
        end_date: formData.end_date,
        description: formData.description.split('\n').map(d => d.trim()).filter(d => d)
      };
      await api.post('/portfolio/experience', payload);
      setStatus('Experience added successfully!');
      setIsAdding(false);
      setFormData({ role: '', company: '', location: '', start_date: '', end_date: '', description: '' });
      fetchExperiences();
      setTimeout(() => setStatus(''), 3000);
    } catch (err) {
      console.error(err);
      setStatus('Error adding experience.');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Experience</h1>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <FiPlus />
          <span>{isAdding ? 'Cancel' : 'Add Experience'}</span>
        </button>
      </div>
      
      {status && (
        <div className="mb-4 p-4 bg-blue-100 text-blue-700 rounded-lg">
          {status}
        </div>
      )}

      {isAdding && (
        <form onSubmit={handleSubmit} className="mb-8 bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-4">
          <h2 className="text-xl font-semibold mb-4">Add New Experience</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Job Role</label>
              <input name="role" value={formData.role} onChange={handleChange} required className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Company</label>
              <input name="company" value={formData.company} onChange={handleChange} required className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Location</label>
              <input name="location" value={formData.location} onChange={handleChange} required className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium mb-1">Start Date</label>
                <input name="start_date" value={formData.start_date} onChange={handleChange} required placeholder="e.g. Jan 2021" className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">End Date</label>
                <input name="end_date" value={formData.end_date} onChange={handleChange} required placeholder="e.g. Present" className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description (One bullet point per line)</label>
            <textarea name="description" value={formData.description} onChange={handleChange} required rows={5} placeholder="Worked on React frontend...&#10;Built REST APIs in Node.js..." className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
            Save Experience
          </button>
        </form>
      )}

      <div className="grid gap-4">
        {experiences.map(exp => (
          <div key={exp.id} className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold">{exp.role}</h3>
                <h4 className="text-lg text-blue-600 dark:text-blue-400">{exp.company}</h4>
                <p className="text-sm text-gray-500 mt-1">{exp.start_date} - {exp.end_date} | {exp.location}</p>
                <ul className="mt-3 space-y-1 list-disc pl-5">
                  {exp.description.map((desc, i) => (
                    <li key={i} className="text-gray-600 dark:text-gray-400 text-sm">{desc}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
        {experiences.length === 0 && (
          <p className="text-gray-500 italic">No experience found. Add one above!</p>
        )}
      </div>
    </div>
  );
};

export default AdminExperience;
