import { useState, useEffect } from 'react';
import api from '../services/api';
import { FiTrash2, FiPlus, FiEdit2 } from 'react-icons/fi';

const AdminExperience = () => {
  const [experiences, setExperiences] = useState([]);
  const [status, setStatus] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const initialFormState = {
    role: '',
    company: '',
    location: '',
    start_date: '',
    end_date: '',
    description: ''
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchExperiences();
  }, []);

  const fetchExperiences = async () => {
    try {
      const res = await api.get('/portfolio/experience');
      setExperiences(res.data);
    } catch (err) {
      console.error(err);
      setStatus('Error loading experiences.');
    }
  };

  const handleAddNewClick = () => {
    setEditingId(null);
    setFormData(initialFormState);
    setIsFormOpen(!isFormOpen);
  };

  const handleEditClick = (exp) => {
    setEditingId(exp.id);
    setFormData({
      role: exp.role || '',
      company: exp.company || '',
      location: exp.location || '',
      start_date: exp.start_date || '',
      end_date: exp.end_date || '',
      description: Array.isArray(exp.description)
        ? exp.description.join('\n')
        : (exp.description || '')
    });
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this experience entry?')) return;
    try {
      await api.delete(`/portfolio/experience/${id}`);
      setExperiences(experiences.filter(exp => exp.id !== id));
      setStatus('Experience deleted successfully!');
      setTimeout(() => setStatus(''), 3000);
    } catch (err) {
      console.error(err);
      setStatus('Error deleting experience.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setStatus(editingId ? 'Updating experience...' : 'Adding experience...');
      const payload = {
        role: formData.role,
        company: formData.company,
        location: formData.location,
        start_date: formData.start_date,
        end_date: formData.end_date,
        description: formData.description
          .split('\n')
          .map(d => d.trim())
          .filter(d => d)
      };

      if (editingId) {
        await api.put(`/portfolio/experience/${editingId}`, payload);
        setStatus('Experience updated successfully!');
      } else {
        await api.post('/portfolio/experience', payload);
        setStatus('Experience added successfully!');
      }

      setIsFormOpen(false);
      setEditingId(null);
      setFormData(initialFormState);
      fetchExperiences();
      setTimeout(() => setStatus(''), 3000);
    } catch (err) {
      console.error(err);
      setStatus('Error saving experience.');
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
          onClick={handleAddNewClick}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <FiPlus />
          <span>{isFormOpen && !editingId ? 'Cancel' : 'Add Experience'}</span>
        </button>
      </div>
      
      {status && (
        <div className={`mb-4 p-4 rounded-lg ${status.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
          {status}
        </div>
      )}

      {isFormOpen && (
        <form onSubmit={handleSubmit} className="mb-8 bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              {editingId ? 'Edit Experience' : 'Add New Experience'}
            </h2>
            {editingId && (
              <button 
                type="button" 
                onClick={handleAddNewClick}
                className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                Cancel Edit
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Job Role</label>
              <input 
                name="role" 
                value={formData.role} 
                onChange={handleChange} 
                required 
                placeholder="e.g. Full Stack Developer"
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 outline-none focus:ring-2 focus:ring-blue-500" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Company</label>
              <input 
                name="company" 
                value={formData.company} 
                onChange={handleChange} 
                required 
                placeholder="e.g. Acme Corp"
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 outline-none focus:ring-2 focus:ring-blue-500" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Location</label>
              <input 
                name="location" 
                value={formData.location} 
                onChange={handleChange} 
                required 
                placeholder="e.g. Noida, India"
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 outline-none focus:ring-2 focus:ring-blue-500" 
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium mb-1">Start Date</label>
                <input 
                  name="start_date" 
                  value={formData.start_date} 
                  onChange={handleChange} 
                  required 
                  placeholder="e.g. Jan 2023" 
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 outline-none focus:ring-2 focus:ring-blue-500" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">End Date</label>
                <input 
                  name="end_date" 
                  value={formData.end_date} 
                  onChange={handleChange} 
                  required 
                  placeholder="e.g. Present" 
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 outline-none focus:ring-2 focus:ring-blue-500" 
                />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description (One bullet point per line)</label>
            <textarea 
              name="description" 
              value={formData.description} 
              onChange={handleChange} 
              required 
              rows={5} 
              placeholder="Architected and launched full-stack applications...&#10;Built robust REST APIs using FastAPI and MongoDB..." 
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 outline-none focus:ring-2 focus:ring-blue-500" 
            />
          </div>
          <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
            {editingId ? 'Save Changes' : 'Save Experience'}
          </button>
        </form>
      )}

      <div className="grid gap-4">
        {experiences.map(exp => (
          <div key={exp.id} className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex justify-between items-start">
            <div className="flex-1 pr-4">
              <h3 className="text-xl font-bold">{exp.role}</h3>
              <h4 className="text-lg text-blue-600 dark:text-blue-400 font-medium">{exp.company}</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{exp.start_date} - {exp.end_date} | {exp.location}</p>
              {exp.description && exp.description.length > 0 && (
                <ul className="mt-3 space-y-1 list-disc pl-5">
                  {exp.description.map((desc, i) => (
                    <li key={i} className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{desc}</li>
                  ))}
                </ul>
              )}
            </div>
            <div className="flex items-center space-x-2 shrink-0">
              <button 
                onClick={() => handleEditClick(exp)}
                className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
                title="Edit Experience"
              >
                <FiEdit2 size={20} />
              </button>
              <button 
                onClick={() => handleDelete(exp.id)}
                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                title="Delete Experience"
              >
                <FiTrash2 size={20} />
              </button>
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
