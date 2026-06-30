import { useState, useEffect } from "react";
import api from "../services/api";
import { FiTrash2, FiPlus, FiEdit2 } from "react-icons/fi";

const AdminGraphicDesigns = () => {
  const [designs, setDesigns] = useState([]);
  const [status, setStatus] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const initialFormState = {
    title: "",
    description: "",
    media_url: "",
    media_type: "",
  };
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchDesigns();
  }, []);

  const fetchDesigns = async () => {
    try {
      const res = await api.get("/portfolio/graphic-designs");
      setDesigns(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditClick = (design) => {
    setEditingId(design.id);
    setFormData({
      title: design.title,
      description: design.description,
      media_url: design.media_url,
      media_type: design.media_type,
    });
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAddNewClick = () => {
    setEditingId(null);
    setFormData(initialFormState);
    setIsFormOpen(!isFormOpen);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this design?")) return;
    try {
      await api.delete(`/portfolio/graphic-designs/${id}`);
      setDesigns(designs.filter((d) => d.id !== id));
      setStatus("Design deleted.");
      setTimeout(() => setStatus(""), 3000);
    } catch (err) {
      console.error(err);
      setStatus("Error deleting design.");
    }
  };

  const handleMediaUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append("file", file);

    try {
      setStatus("Uploading media...");
      const res = await api.post("/portfolio/upload/design", uploadData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setFormData((prev) => ({
        ...prev,
        media_url: res.data.url,
        media_type: res.data.media_type,
      }));
      setStatus("Media uploaded successfully!");
      setTimeout(() => setStatus(""), 3000);
    } catch (err) {
      const errorMessage =
        err.response?.data?.detail || err.message || "Unknown error";
      setStatus(`Error uploading media: ${errorMessage}`);
      console.error("Upload error details:", err.response || err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setStatus(editingId ? "Updating design..." : "Adding design...");

      if (editingId) {
        await api.put(`/portfolio/graphic-designs/${editingId}`, formData);
        setStatus("Design updated successfully!");
      } else {
        await api.post("/portfolio/graphic-designs", formData);
        setStatus("Design added successfully!");
      }

      setIsFormOpen(false);
      setEditingId(null);
      setFormData(initialFormState);
      fetchDesigns();
      setTimeout(() => setStatus(""), 3000);
    } catch (err) {
      console.error(err);
      setStatus("Error saving design.");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Graphic Designs</h1>
        <button
          onClick={handleAddNewClick}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <FiPlus />
          <span>{isFormOpen && !editingId ? "Cancel" : "Add Design"}</span>
        </button>
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
              {editingId ? "Edit Design" : "Add New Design"}
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
            <label className="block text-sm font-medium mb-1">
              Design Media (Image or Video)
            </label>
            <div className="flex flex-col gap-4">
              <input
                type="file"
                accept="image/*,video/*"
                onChange={handleMediaUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-gray-700 dark:file:text-gray-300"
              />
              <p className="text-xs text-gray-500">
                Upload images (jpg, png, webp) or videos (mp4, webm) of your
                graphic designs or reels.
              </p>

              {formData.media_url &&
                (formData.media_type === "video" ? (
                  <video
                    src={
                      formData.media_url?.startsWith("http")
                        ? formData.media_url
                        : `http://localhost:8000${formData.media_url}`
                    }
                    className="w-full h-auto max-h-48 object-cover rounded shadow"
                    controls
                    muted
                  />
                ) : (
                  <img
                    src={
                      formData.media_url?.startsWith("http")
                        ? formData.media_url
                        : `http://localhost:8000${formData.media_url}`
                    }
                    alt="Preview"
                    className="w-full h-auto max-h-48 object-cover rounded shadow"
                  />
                ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Description (Optional)
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={!formData.media_url}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
          >
            {editingId ? "Save Changes" : "Save Design"}
          </button>
        </form>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {designs.map((design) => (
          <div
            key={design.id}
            className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col"
          >
            <div className="w-full h-48 mb-4 bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center">
              {design.media_type === "video" ? (
                <video
                  src={
                    design.media_url?.startsWith("http")
                      ? design.media_url
                      : `http://localhost:8000${design.media_url}`
                  }
                  className="w-full h-full object-cover"
                  controls
                  muted
                />
              ) : (
                <img
                  src={
                    design.media_url?.startsWith("http")
                      ? design.media_url
                      : `http://localhost:8000${design.media_url}`
                  }
                  alt={design.title}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold">{design.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">
                {design.description}
              </p>
            </div>
            <div className="flex items-center space-x-2 mt-4 pt-4 border-t dark:border-gray-700">
              <button
                onClick={() => handleEditClick(design)}
                className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition ml-auto"
                title="Edit Design"
              >
                <FiEdit2 size={20} />
              </button>
              <button
                onClick={() => handleDelete(design.id)}
                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                title="Delete Design"
              >
                <FiTrash2 size={20} />
              </button>
            </div>
          </div>
        ))}
        {designs.length === 0 && (
          <p className="text-gray-500 italic col-span-full">
            No designs found. Add one above!
          </p>
        )}
      </div>
    </div>
  );
};

export default AdminGraphicDesigns;
