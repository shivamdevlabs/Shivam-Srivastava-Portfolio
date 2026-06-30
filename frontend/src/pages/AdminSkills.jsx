import { useState, useEffect } from "react";
import api from "../services/api";
import { FiTrash2, FiPlus, FiEdit2 } from "react-icons/fi";

const AdminSkills = () => {
  const [skills, setSkills] = useState([]);
  const [status, setStatus] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({ name: "", category: "technical" });

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      const res = await api.get("/portfolio/skills");
      setSkills(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddNewClick = (category = "technical") => {
    setEditingId(null);
    setFormData({ name: "", category });
    setIsFormOpen(true);
  };

  const handleEditClick = (skill) => {
    setEditingId(skill.id);
    setFormData({ name: skill.name, category: skill.category || "technical" });
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this skill?")) return;
    try {
      await api.delete(`/portfolio/skills/${id}`);
      setSkills(skills.filter((s) => s.id !== id));
      setStatus("Skill deleted.");
      setTimeout(() => setStatus(""), 3000);
    } catch (err) {
      console.error(err);
      setStatus("Error deleting skill.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    
    try {
      setStatus(editingId ? "Updating skill..." : "Adding skill...");
      
      if (editingId) {
        await api.put(`/portfolio/skills/${editingId}`, formData);
        setStatus("Skill updated successfully!");
      } else {
        await api.post("/portfolio/skills", formData);
        setStatus("Skill added successfully!");
      }

      setIsFormOpen(false);
      setEditingId(null);
      setFormData({ name: "", category: "technical" });
      fetchSkills();
      setTimeout(() => setStatus(""), 3000);
    } catch (err) {
      console.error(err);
      setStatus("Error saving skill.");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Skills</h1>
        <div className="flex space-x-2 flex-wrap gap-y-2">
          <button
            onClick={() => setIsFormOpen(false)}
            className={`px-4 py-2 rounded-lg transition ${isFormOpen && !editingId ? "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200" : "hidden"}`}
          >
            Cancel
          </button>
          <button
            onClick={() => handleAddNewClick('technical')}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <FiPlus />
            <span>Add Technical Skill</span>
          </button>
          <button
            onClick={() => handleAddNewClick('designing')}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            <FiPlus />
            <span>Add Designing Skill</span>
          </button>
          <button
            onClick={() => handleAddNewClick('other')}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            <FiPlus />
            <span>Add Other Skill</span>
          </button>
        </div>
      </div>

      {status && (
        <div
          className={`mb-4 p-4 rounded-lg ${status.includes("Error") ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`}
        >
          {status}
        </div>
      )}

      {isFormOpen && (
        <form
          onSubmit={handleSubmit}
          className="mb-8 bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-4"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              {editingId ? 'Edit Skill' : 'Add New Skill'}
            </h2>
            {editingId && (
              <button 
                type="button" 
                onClick={() => setIsFormOpen(false)}
                className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                Cancel Edit
              </button>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Skill Name (e.g. Python, React.js)</label>
            <input
              name="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="technical">Technical Skill</option>
              <option value="designing">Designing Skill</option>
              <option value="other">Other Skill</option>
            </select>
          </div>
          
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            {editingId ? "Save Changes" : "Save Skill"}
          </button>
        </form>
      )}

      {["technical", "designing", "other"].map((category) => {
        const categorySkills = skills.filter((s) => (s.category || "technical") === category);
        const titles = { technical: "Technical Skills", designing: "Designing Skills", other: "Other Skills" };
        
        return (
          <div key={category} className="mb-8">
            <h2 className="text-xl font-bold mb-4">{titles[category]}</h2>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
              <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                {categorySkills.map((skill) => (
                  <li key={skill.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                    <span className="font-medium text-lg">{skill.name}</span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditClick(skill)}
                        className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
                        title="Edit Skill"
                      >
                        <FiEdit2 size={20} />
                      </button>
                      <button
                        onClick={() => handleDelete(skill.id)}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                        title="Delete Skill"
                      >
                        <FiTrash2 size={20} />
                      </button>
                    </div>
                  </li>
                ))}
                {categorySkills.length === 0 && (
                  <li className="p-8 text-center text-gray-500 italic">
                    No skills found in this category.
                  </li>
                )}
              </ul>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AdminSkills;
