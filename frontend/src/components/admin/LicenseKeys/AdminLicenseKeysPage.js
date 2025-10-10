import React, { useMemo, useState } from 'react';
import DataTable from '../tables/DataTable';
import { useLicenseKeys } from '../../../hooks/admin/useLicenseKeys';
import LicenseKeyDetailModal from './LicenseKeyDetailModal';
import CreateLicenseKeyModal from './CreateLicenseKeyModal';

const AdminLicenseKeysPage = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const pageSize = 25;
  const [selectedLicenseKeyId, setSelectedLicenseKeyId] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data, isLoading, refetch } = useLicenseKeys({ 
    page, 
    pageSize, 
    search, 
    status: statusFilter,
    license_type: typeFilter
  });

  const columns = useMemo(() => ([
    { 
      header: 'License Key', 
      accessor: 'license_key', 
      cell: (row) => (
        <span className="cursor-pointer text-blue-600 hover:underline font-mono text-sm" onClick={() => setSelectedLicenseKeyId(row.id)}>
          {row.license_key}
        </span>
      )
    },
    { 
      header: 'Type', 
      accessor: 'license_type', 
      cell: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          row.license_type === 'trial' ? 'bg-blue-100 text-blue-800' :
          row.license_type === 'basic' ? 'bg-green-100 text-green-800' :
          row.license_type === 'premium' ? 'bg-purple-100 text-purple-800' :
          row.license_type === 'enterprise' ? 'bg-orange-100 text-orange-800' :
          row.license_type === 'lifetime' ? 'bg-yellow-100 text-yellow-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {row.license_type}
        </span>
      )
    },
    { 
      header: 'Status', 
      accessor: 'status', 
      cell: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          row.status === 'active' ? 'bg-green-100 text-green-800' :
          row.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
          row.status === 'expired' ? 'bg-red-100 text-red-800' :
          row.status === 'revoked' ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {row.status}
        </span>
      )
    },
    { 
      header: 'Assigned To', 
      accessor: 'assigned_to', 
      cell: (row) => row.assigned_to ? (
        <span className="text-sm text-gray-600">{row.assigned_to}</span>
      ) : (
        <span className="text-sm text-gray-400">Unassigned</span>
      )
    },
    { 
      header: 'Times Used', 
      accessor: 'times_used', 
      cell: (row) => (
        <span className="text-sm">
          {row.times_used} / {row.max_uses}
        </span>
      )
    },
    { 
      header: 'Expires', 
      accessor: 'expires_at', 
      cell: (row) => row.expires_at ? (
        <span className="text-sm text-gray-600">
          {new Date(row.expires_at).toLocaleDateString()}
        </span>
      ) : (
        <span className="text-sm text-gray-400">Never</span>
      )
    },
    { 
      header: 'Created', 
      accessor: 'created_at', 
      cell: (row) => (
        <span className="text-sm text-gray-600">
          {new Date(row.created_at).toLocaleDateString()}
        </span>
      )
    },
    { 
      header: 'Last Used', 
      accessor: 'last_used_at', 
      cell: (row) => row.last_used_at ? (
        <span className="text-sm text-gray-600">
          {new Date(row.last_used_at).toLocaleDateString()}
        </span>
      ) : (
        <span className="text-sm text-gray-400">Never</span>
      )
    }
  ]), []);

  const toolbar = (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <input 
          className="border rounded px-3 py-2 w-64" 
          placeholder="Search license keys..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
        />
        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="expired">Expired</option>
          <option value="revoked">Revoked</option>
        </select>
        <select 
          value={typeFilter} 
          onChange={(e) => setTypeFilter(e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="">All Types</option>
          <option value="trial">Trial</option>
          <option value="basic">Basic</option>
          <option value="premium">Premium</option>
          <option value="enterprise">Enterprise</option>
          <option value="lifetime">Lifetime</option>
        </select>
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Create License Key
        </button>
        <div className="text-sm text-gray-500">Total: {data?.count ?? '—'}</div>
      </div>
    </div>
  );

  const footer = (
    <div className="flex items-center justify-between">
      <button 
        disabled={page === 1} 
        onClick={() => setPage(p => Math.max(1, p - 1))} 
        className="px-3 py-1 rounded border disabled:opacity-50"
      >
        Prev
      </button>
      <div className="text-sm">Page {page}</div>
      <button 
        disabled={(data?.count || 0) <= page * pageSize} 
        onClick={() => setPage(p => p + 1)} 
        className="px-3 py-1 rounded border disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">License Keys</h1>
      </div>
      
      <DataTable 
        columns={columns} 
        data={data?.data} 
        loading={isLoading} 
        toolbar={toolbar} 
        footer={footer} 
        emptyMessage="No license keys found"
        onRowClick={(row) => setSelectedLicenseKeyId(row.id)}
      />
      
      {selectedLicenseKeyId && (
        <LicenseKeyDetailModal 
          licenseKeyId={selectedLicenseKeyId} 
          onClose={() => setSelectedLicenseKeyId(null)}
          onRefresh={refetch}
        />
      )}
      
      {showCreateModal && (
        <CreateLicenseKeyModal 
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            refetch();
          }}
        />
      )}
    </div>
  );
};

export default AdminLicenseKeysPage;
