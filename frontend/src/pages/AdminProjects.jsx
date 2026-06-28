import { useState, useEffect } from 'react';
import api from '../services/api';
import { FiTrash2, FiPlus, FiEdit2 } from 'react-icons/fi';

const AdminProjects = () => {
  const [projects, setProjects] = useState([]);
  const [status, setStatus] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [importGithubUrl, setImportGithubUrl] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  
  const initialFormState = {
    title: '',
    description: '',
    technologies: '',
    github_link: '',
    live_demo: '',
    image_url: ''
  };
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await api.get('/portfolio/projects');
      setProjects(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleGithubImport = async () => {
    if (!importGithubUrl) return;
    
    try {
      setIsImporting(true);
      setStatus('Importing from GitHub...');
      
      const match = importGithubUrl.match(/github\.com\/([^/]+\/[^/]+)/);
      if (!match) {
        throw new Error('Invalid GitHub URL format');
      }
      
      const repoPath = match[1].replace(/\/$/, '');
      
      const res = await fetch(`https://api.github.com/repos/${repoPath}`);
      if (!res.ok) throw new Error('Repository not found or API limit exceeded');
      
      const data = await res.json();
      
      let technologies = [];
      if (data.languages_url) {
        const langRes = await fetch(data.languages_url);
        if (langRes.ok) {
          const langData = await langRes.json();
          technologies = Object.keys(langData);
        }
      }
      
      const formattedTitle = data.name.replace(/-/g, ' ').replace(/(^\w|\s\w)/g, m => m.toUpperCase());
      
      setFormData(prev => ({
        ...prev,
        title: formattedTitle || prev.title,
        description: data.description || prev.description,
        github_link: data.html_url || prev.github_link,
        live_demo: data.homepage || prev.live_demo,
        technologies: technologies.length > 0 ? technologies.join(', ') : prev.technologies
      }));
      
      setImportGithubUrl('');
      setStatus('GitHub project imported successfully! You can now review and edit details.');
    } catch (err) {
      console.error(err);
      setStatus(`Error: ${err.message}`);
    } finally {
      setIsImporting(false);
      setTimeout(() => setStatus(''), 5000);
    }
  };

  const handleEditClick = (project) => {
    setEditingId(project.id);
    setFormData({
      title: project.title,
      description: project.description,
      technologies: project.technologies.join(', '),
      github_link: project.github_link || '',
      live_demo: project.live_demo || '',
      image_url: project.image_url || ''
    });
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddNewClick = () => {
    setEditingId(null);
    setFormData(initialFormState);
    setIsFormOpen(!isFormOpen);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      await api.delete(`/portfolio/projects/${id}`);
      setProjects(projects.filter(p => p.id !== id));
      setStatus('Project deleted.');
      setTimeout(() => setStatus(''), 3000);
    } catch (err) {
      console.error(err);
      setStatus('Error deleting project.');
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const uploadData = new FormData();
    uploadData.append('file', file);
    
    try {
      setStatus('Uploading image...');
      const res = await api.post('/portfolio/upload/image', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData(prev => ({ ...prev, image_url: res.data.url }));
      setStatus('Image uploaded successfully!');
      setTimeout(() => setStatus(''), 3000);
    } catch (err) {
      setStatus('Error uploading image');
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setStatus(editingId ? 'Updating project...' : 'Adding project...');
      const payload = {
        title: formData.title,
        description: formData.description,
        technologies: formData.technologies.split(',').map(t => t.trim()),
        github_link: formData.github_link,
        live_demo: formData.live_demo,
        image_url: formData.image_url
      };

      if (editingId) {
        await api.put(`/portfolio/projects/${editingId}`, payload);
        setStatus('Project updated successfully!');
      } else {
        await api.post('/portfolio/projects', payload);
        setStatus('Project added successfully!');
      }
      
      setIsFormOpen(false);
      setEditingId(null);
      setFormData(initialFormState);
      fetchProjects();
      setTimeout(() => setStatus(''), 3000);
    } catch (err) {
      console.error(err);
      setStatus('Error saving project.');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Projects</h1>
        <button 
          onClick={handleAddNewClick}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <FiPlus />
          <span>{isFormOpen && !editingId ? 'Cancel' : 'Add Project'}</span>
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
              {editingId ? 'Edit Project' : 'Add New Project'}
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

          <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-200 dark:border-gray-600 mb-6">
            <label className="block text-sm font-medium mb-2">Import from GitHub (Auto-fill)</label>
            <div className="flex gap-2">
              <input 
                type="url" 
                placeholder="https://github.com/username/repository" 
                value={importGithubUrl}
                onChange={(e) => setImportGithubUrl(e.target.value)}
                className="flex-1 p-2 border rounded dark:bg-white/5 dark:border-gray-600 outline-none focus:ring-2 focus:ring-blue-500 text-sm" 
              />
              <button 
                type="button" 
                onClick={handleGithubImport}
                disabled={isImporting || !importGithubUrl}
                className="px-4 py-2 bg-gray-800 dark:bg-gray-600 text-white text-sm rounded hover:bg-gray-900 dark:hover:bg-gray-500 disabled:opacity-50 transition"
              >
                {isImporting ? 'Fetching...' : 'Fetch Details'}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Project Preview Image</label>
            <div className="flex items-center gap-4">
              {formData.image_url && (
                <img src={`http://localhost:8000${formData.image_url}`} alt="Preview" className="h-16 w-16 object-cover rounded shadow" />
              )}
              <input type="file" accept="image/*" onChange={handleImageUpload} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-gray-700 dark:file:text-gray-300" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Project Title</label>
            <input name="title" value={formData.title} onChange={handleChange} required className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} required rows={3} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Technologies (comma separated)</label>
            <input name="technologies" value={formData.technologies} onChange={handleChange} required placeholder="e.g. React, Node.js, MongoDB" className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">GitHub URL (Optional)</label>
              <input name="github_link" value={formData.github_link} onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Live Demo URL (Optional)</label>
              <input name="live_demo" value={formData.live_demo} onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
            {editingId ? 'Save Changes' : 'Save Project'}
          </button>
        </form>
      )}

      <div className="grid gap-4">
        {projects.map(project => (
          <div key={project.id} className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex justify-between items-start">
            <div className="flex gap-4 items-start">
              {project.image_url ? (
                <img src={`http://localhost:8000${project.image_url}`} alt={project.title} className="w-20 h-20 object-cover rounded-lg shadow-sm hidden sm:block" />
              ) : (
                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center hidden sm:flex text-gray-400 text-xs text-center p-2">
                  No Image
                </div>
              )}
              <div>
                <h3 className="text-xl font-bold">{project.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 mt-1">{project.description}</p>
                <div className="flex gap-2 mt-3 flex-wrap">
                  {project.technologies.map((tech, i) => (
                    <span key={i} className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-md">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => handleEditClick(project)}
                className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
                title="Edit Project"
              >
                <FiEdit2 size={20} />
              </button>
              <button 
                onClick={() => handleDelete(project.id)}
                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                title="Delete Project"
              >
                <FiTrash2 size={20} />
              </button>
            </div>
          </div>
        ))}
        {projects.length === 0 && (
          <p className="text-gray-500 italic">No projects found. Add one above!</p>
        )}
      </div>
    </div>
  );
};

export default AdminProjects;
