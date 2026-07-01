import { Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  FiHome,
  FiUser,
  FiBriefcase,
  FiAward,
  FiSettings,
  FiLogOut,
  FiImage,
  FiCode,
} from "react-icons/fi";

const AdminLayout = () => {
  const { logout } = useAuth();
  const location = useLocation();

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
      <aside className="w-64 bg-white dark:bg-gray-800 shadow-md h-full flex flex-col">
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

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8 text-gray-800 dark:text-gray-100">
        <div className="max-w-6xl mx-auto glass p-6 rounded-2xl shadow-sm">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
