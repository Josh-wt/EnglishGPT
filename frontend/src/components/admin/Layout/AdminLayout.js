import React from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { 
  HomeIcon, 
  UsersIcon, 
  ClipboardDocumentListIcon, 
  ChatBubbleLeftRightIcon,
  KeyIcon,
  ChartBarIcon,
  MagnifyingGlassIcon,
  CircleStackIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const navItems = [
  { to: '/admin/dashboard', label: 'Overview', icon: HomeIcon, description: 'Dashboard overview and key metrics' },
  { to: '/admin/users', label: 'Users', icon: UsersIcon, description: 'Manage users and view profiles' },
  { to: '/admin/evaluations', label: 'Evaluations', icon: ClipboardDocumentListIcon, description: 'View and analyze evaluations' },
  { to: '/admin/feedback', label: 'Feedback', icon: ChatBubbleLeftRightIcon, description: 'User feedback and reviews' },
  { to: '/admin/license-keys', label: 'License Keys', icon: KeyIcon, description: 'Manage license keys' },
  { to: '/admin/analytics', label: 'Analytics', icon: ChartBarIcon, description: 'Detailed analytics and insights' },
  { to: '/admin/search', label: 'Search', icon: MagnifyingGlassIcon, description: 'Global search across all data' },
  { to: '/admin/db', label: 'Database', icon: CircleStackIcon, description: 'Database browser and tools' },
];

const AdminLayout = ({ darkMode }) => {
  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="flex min-h-screen">
        {/* Beautiful Sidebar */}
        <aside className={`w-72 hidden md:flex flex-col ${darkMode ? 'bg-gray-800' : 'bg-white'} border-r ${darkMode ? 'border-gray-700' : 'border-gray-200'} shadow-lg`}>
          {/* Header */}
          <div className="px-6 py-6 border-b border-gray-200 dark:border-gray-700">
            <Link to="/admin/dashboard" className="flex items-center space-x-3 group">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-200">
                <SparklesIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  EnglishGPT
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                  Admin Dashboard
                </div>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navItems.map(item => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `group flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25 transform scale-[1.02]' 
                        : `${darkMode ? 'text-gray-300 hover:bg-gray-700 hover:text-white' : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'} hover:transform hover:scale-[1.01]`
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon className={`w-5 h-5 mr-3 transition-colors ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'}`} />
                      <div className="flex-1">
                        <div className="font-medium">{item.label}</div>
                        <div className={`text-xs mt-0.5 ${isActive ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}`}>
                          {item.description}
                        </div>
                      </div>
                      {isActive && (
                        <div className="w-2 h-2 bg-white rounded-full shadow-sm"></div>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>System Online</span>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-h-screen">
          {/* Mobile Header */}
          <div className="md:hidden sticky top-0 z-10 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow-lg">
            <div className="flex items-center space-x-2">
              <SparklesIcon className="w-5 h-5" />
              <span>EnglishGPT Admin</span>
            </div>
          </div>
          
          {/* Content Area */}
          <div className="flex-1 p-4 md:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

