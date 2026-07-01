import { useState, useEffect } from "react";
import api from "../services/api";

const AdminAbout = () => {
  const [formData, setFormData] = useState({
    name: "",
    roles: "",
    bio: "",
    email: "",
    phone: "",
    address: "",
    github: "",
    linkedin: "",
    instagram: "",
    facebook: "",
    behance: "",
  });
  const [aboutData, setAboutData] = useState(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    fetchAbout();
  }, []);

  const fetchAbout = async () => {
    try {
      const res = await api.get("/portfolio/about");
      if (res.data && Object.keys(res.data).length > 0) {
        const d = res.data;
        setAboutData(d);
        setFormData({
          name: d.name || "",
          roles: d.roles ? d.roles.join(", ") : "",
          bio: d.bio || "",
          email: d.email || "",
          phone: d.phone || "",
          address: d.address || "",
          github: d.social_links?.github || "",
          linkedin: d.social_links?.linkedin || "",
          instagram: d.social_links?.instagram || "",
          facebook: d.social_links?.facebook || "",
          behance: d.social_links?.behance || "",
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setStatus("Uploading photo...");
      const res = await api.post("/portfolio/upload/image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const currentAbout = await api.get("/portfolio/about");
      await api.post("/portfolio/about", {
        ...currentAbout.data,
        photo_url: res.data.url,
      });
      setStatus("Photo uploaded successfully!");
      setTimeout(() => setStatus(""), 3000);
      fetchAbout();
    } catch (err) {
      setStatus("Error uploading photo");
      console.error(err);
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setStatus("Uploading resume...");
      const res = await api.post("/portfolio/upload/resume", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const currentAbout = await api.get("/portfolio/about");
      await api.post("/portfolio/about", {
        ...currentAbout.data,
        resume_url: res.data.url,
      });
      setStatus("Resume uploaded successfully!");
      setTimeout(() => setStatus(""), 3000);
      fetchAbout();
    } catch (err) {
      setStatus("Error uploading resume");
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("Saving...");
    try {
      const currentAbout = await api.get("/portfolio/about");

      const payload = {
        name: formData.name,
        roles: formData.roles.split(",").map((r) => r.trim()),
        bio: formData.bio,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        social_links: {
          github: formData.github,
          linkedin: formData.linkedin,
          instagram: formData.instagram,
          facebook: formData.facebook,
          behance: formData.behance,
        },
      };

      if (currentAbout.data.photo_url) {
        payload.photo_url = currentAbout.data.photo_url;
      }
      if (currentAbout.data.resume_url) {
        payload.resume_url = currentAbout.data.resume_url;
      }

      await api.post("/portfolio/about", payload);
      setStatus("Saved successfully!");
      setTimeout(() => setStatus(""), 3000);
    } catch (err) {
      setStatus("Error saving data");
      console.error(err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Manage About & Hero</h1>

      {status && (
        <div className="mb-4 p-4 bg-blue-100 text-blue-700 rounded-lg">
          {status}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Profile Photo</h2>
          {aboutData?.photo_url && (
            <div className="mb-4">
              <img
                src={
                  aboutData.photo_url.startsWith("http")
                    ? aboutData.photo_url
                    : `http://localhost:8000${aboutData.photo_url}`
                }
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border"
              />
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-gray-700 dark:file:text-gray-300"
          />
        </div>

        <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Resume (PDF)</h2>
          {aboutData?.resume_url && (
            <div className="mb-4">
              <a
                href={aboutData.resume_url}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 hover:underline"
              >
                View Current Resume
              </a>
            </div>
          )}
          <input
            type="file"
            accept="application/pdf"
            onChange={handleResumeUpload}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-gray-700 dark:file:text-gray-300"
          />
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Roles (comma separated)
            </label>
            <input
              name="roles"
              value={formData.roles}
              onChange={handleChange}
              required
              placeholder="e.g. Developer, Designer"
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Bio</label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            required
            rows={4}
            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <h3 className="text-lg font-semibold border-b pb-2 mt-6">
          Contact Info
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Address</label>
            <input
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <h3 className="text-lg font-semibold border-b pb-2 mt-6">
          Social Links
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1">GitHub URL</label>
            <input
              name="github"
              value={formData.github}
              onChange={handleChange}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              LinkedIn URL
            </label>
            <input
              name="linkedin"
              value={formData.linkedin}
              onChange={handleChange}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Instagram URL
            </label>
            <input
              name="instagram"
              value={formData.instagram}
              onChange={handleChange}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Facebook URL
            </label>
            <input
              name="facebook"
              value={formData.facebook}
              onChange={handleChange}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Behance URL
            </label>
            <input
              name="behance"
              value={formData.behance}
              onChange={handleChange}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default AdminAbout;
