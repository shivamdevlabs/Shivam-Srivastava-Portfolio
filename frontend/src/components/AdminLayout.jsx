import { useState, useEffect, useRef } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import {
  FiHome,
  FiUser,
  FiBriefcase,
  FiAward,
  FiSettings,
  FiLogOut,
  FiImage,
  FiCode,
  FiChevronDown,
  FiExternalLink,
} from "react-icons/fi";

const AdminLayout = () => {
  const { logout } = useAuth();
  const location = useLocation();
  const [adminUser, setAdminUser] = useState({ name: "Admin", email: "" });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const fetchAdminUser = async () => {
    try {
      const res = await api.get("/auth/me");
      if (res.data) {
        setAdminUser(res.data);
      }
    } catch {
      // fallback to default
    }
  };

  useEffect(() => {
    fetchAdminUser();

    const handleProfileUpdated = () => {
      fetchAdminUser();
    };

    window.addEventListener("admin-profile-updated", handleProfileUpdated);
    return () => {
      window.removeEventListener("admin-profile-updated", handleProfileUpdated);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const navItems = [
    { name: "Dashboard", path: "/admin", icon: <FiHome /> },
    { name: "About & Hero", path: "/admin/about", icon: <FiUser /> },
    { name: "Projects", path: "/admin/projects", icon: <FiBriefcase /> },
    { name: "Skills", path: "/admin/skills", icon: <FiCode /> },
    { name: "Experience", path: "/admin/experience", icon: <FiAward /> },
    { name: "Certificates", path: "/admin/certificates", icon: <FiAward /> },
    { name: "Graphic Designs", path: "/admin/designs", icon: <FiImage /> },
    { name: "Settings", path: "/admin/settings", icon: <FiSettings /> },
  ];

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 shadow-md h-full flex flex-col shrink-0">
        <div className="p-6">
          <h2 className="text-2xl font-bold gradient-text">Admin Panel</h2>
        </div>
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto py-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t dark:border-gray-700">
          <button
            onClick={logout}
            className="flex items-center space-x-3 px-4 py-3 w-full rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <FiLogOut />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Area with Topbar and Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-8 flex items-center justify-between shadow-xs shrink-0 z-20">
          <div className="flex items-center space-x-3">
            <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">
              Admin Workspace
            </span>
            <span className="text-gray-300 dark:text-gray-600">|</span>
            <Link
              to="/"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <span>View Live Portfolio</span>
              <FiExternalLink size={12} />
            </Link>
          </div>

          {/* Admin User Profile Button & Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-3 p-1.5 pr-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700/60 transition cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-gray-600"
              aria-label="Admin Profile Menu"
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
                <FiUser size={18} />
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-sm font-semibold leading-tight text-gray-800 dark:text-gray-100">
                  {adminUser.name || "Admin"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Administrator
                </p>
              </div>
              <FiChevronDown
                size={16}
                className={`text-gray-400 transition-transform duration-200 ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {adminUser.name || "Admin"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                    {adminUser.email || "admin@admin.com"}
                  </p>
                </div>
                <div className="py-1">
                  <Link
                    to="/admin/settings"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition font-medium"
                  >
                    <FiSettings size={17} className="text-gray-400" />
                    <span>Settings</span>
                  </Link>
                </div>
                <div className="border-t border-gray-100 dark:border-gray-700 pt-1">
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      logout();
                    }}
                    className="flex items-center space-x-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 w-full text-left transition font-medium"
                  >
                    <FiLogOut size={17} />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto p-8 text-gray-800 dark:text-gray-100">
          <div className="max-w-6xl mx-auto glass p-6 rounded-2xl shadow-sm">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
