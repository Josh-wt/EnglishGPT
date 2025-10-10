import React from 'react';

const getAdminEmails = () => {
  const str = process.env.REACT_APP_ADMIN_EMAILS || '';
  return str.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
};

const AdminGuard = ({ user, children }) => {
  const admins = getAdminEmails();
  const userEmail = (user?.email || '').toLowerCase();
  const isAdmin = userEmail && admins.includes(userEmail);

  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center">
        <h1 className="text-2xl font-bold mb-2">Not Authorized</h1>
        <p className="text-gray-500">This section is restricted to administrators.</p>
      </div>
    );
  }

  return <>{children}</>;
};

export default AdminGuard;

