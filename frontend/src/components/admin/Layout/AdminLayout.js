import React from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';

const navItems = [
  { to: '/admin/dashboard', label: 'Overview' },
  { to: '/admin/users', label: 'Users' },
  { to: '/admin/evaluations', label: 'Evaluations' },
  { to: '/admin/feedback', label: 'Feedback' },
  { to: '/admin/analytics', label: 'Analytics' },
  { to: '/admin/search', label: 'Search' },
  { to: '/admin/db', label: 'Database' },
];

const AdminLayout = ({ darkMode }) => {
  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="flex min-h-screen">
        <aside className={`w-64 hidden md:flex flex-col ${darkMode ? 'bg-gray-800' : 'bg-white'} border-r border-gray-200`}>
          <div className="px-6 py-4 border-b border-gray-200">
            <Link to="/admin/dashboard" className="font-bold text-lg">EnglishGPT Admin</Link>
          </div>
          <nav className="flex-1 p-2 space-y-1">
            {navItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-md text-sm font-medium ${isActive ? 'bg-indigo-600 text-white' : (darkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100')}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <main className="flex-1">
          <div className="md:hidden sticky top-0 z-10 px-4 py-3 bg-indigo-600 text-white font-semibold">EnglishGPT Admin</div>
          <div className="p-4 md:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

