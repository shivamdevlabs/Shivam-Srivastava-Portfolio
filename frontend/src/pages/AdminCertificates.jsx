import { useState, useEffect } from 'react';
import api from '../services/api';
import { FiTrash2, FiPlus, FiEdit2 } from 'react-icons/fi';

const AdminCertificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [status, setStatus] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const initialFormState = {
    title: '',
    issued_by: '',
    pdf_url: ''
  };
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      const res = await api.get('/portfolio/certificates');
      setCertificates(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditClick = (cert) => {
    setEditingId(cert.id);
    setFormData({
      title: cert.title,
      issued_by: cert.issued_by || '',
      pdf_url: cert.pdf_url || ''
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
    if (!window.confirm('Are you sure you want to delete this certificate?')) return;
    try {
      await api.delete(`/portfolio/certificates/${id}`);
      setCertificates(certificates.filter(c => c.id !== id));
      setStatus('Certificate deleted.');
      setTimeout(() => setStatus(''), 3000);
    } catch (err) {
      console.error(err);
      setStatus('Error deleting certificate.');
    }
  };

  const handlePdfUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const uploadData = new FormData();
    uploadData.append('file', file);
    
    try {
      setStatus('Uploading certificate file...');
      const res = await api.post('/portfolio/upload/pdf', uploadData);
      setFormData(prev => ({ ...prev, pdf_url: res.data.url }));
      setStatus('File uploaded successfully!');
      setTimeout(() => setStatus(''), 3000);
    } catch (err) {
      setStatus('Error uploading file');
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setStatus(editingId ? 'Updating certificate...' : 'Adding certificate...');
      const payload = {
        title: formData.title,
        issued_by: formData.issued_by,
        pdf_url: formData.pdf_url
      };

      if (editingId) {
        await api.put(`/portfolio/certificates/${editingId}`, payload);
        setStatus('Certificate updated successfully!');
      } else {
        await api.post('/portfolio/certificates', payload);
        setStatus('Certificate added successfully!');
      }
      
      setIsFormOpen(false);
      setEditingId(null);
      setFormData(initialFormState);
      fetchCertificates();
      setTimeout(() => setStatus(''), 3000);
    } catch (err) {
      console.error(err);
      setStatus('Error saving certificate.');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Certificates</h1>
        <button 
          onClick={handleAddNewClick}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <FiPlus />
          <span>{isFormOpen && !editingId ? 'Cancel' : 'Add Certificate'}</span>
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
              {editingId ? 'Edit Certificate' : 'Add New Certificate'}
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

          <div>
            <label className="block text-sm font-medium mb-1">Upload Certificate (PDF or Image)</label>
            <div className="flex items-center gap-4">
              {formData.pdf_url && (
                <div className="text-sm text-blue-600 truncate max-w-xs">
                  <a href={formData.pdf_url} target="_blank" rel="noreferrer">View Current File</a>
                </div>
              )}
              <input type="file" accept="application/pdf,image/*" onChange={handlePdfUpload} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-gray-700 dark:file:text-gray-300" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Certificate Title</label>
              <input name="title" value={formData.title} onChange={handleChange} required className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Issued By</label>
              <input name="issued_by" value={formData.issued_by} onChange={handleChange} required className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
            {editingId ? 'Save Changes' : 'Save Certificate'}
          </button>
        </form>
      )}

      <div className="grid gap-4">
        {certificates.map(cert => (
          <div key={cert.id} className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex justify-between items-start">
            <div className="flex gap-4 items-start">
              <div>
                <h3 className="text-xl font-bold">{cert.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Issued by: {cert.issued_by || 'Unknown'}</p>
                {cert.pdf_url && (
                   <a href={cert.pdf_url} target="_blank" rel="noreferrer" className="text-sm text-blue-500 hover:underline mt-2 inline-block">
                     View Certificate File
                   </a>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => handleEditClick(cert)}
                className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
                title="Edit Certificate"
              >
                <FiEdit2 size={20} />
              </button>
              <button 
                onClick={() => handleDelete(cert.id)}
                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                title="Delete Certificate"
              >
                <FiTrash2 size={20} />
              </button>
            </div>
          </div>
        ))}
        {certificates.length === 0 && (
          <p className="text-gray-500 italic">No certificates found. Add one above!</p>
        )}
      </div>
    </div>
  );
};

export default AdminCertificates;
