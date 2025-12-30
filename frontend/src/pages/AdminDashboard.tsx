import React, { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { User, PaginationInfo } from '../types';
import Button from '../components/Button';
import Input from '../components/Input';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';
import Pagination from '../components/Pagination';
import './AdminDashboard.css';

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [modal, setModal] = useState<{
    isOpen: boolean;
    userId: string;
    action: 'activate' | 'deactivate' | 'delete';
    userName: string;
  }>({
    isOpen: false,
    userId: '',
    action: 'activate',
    userName: '',
  });

  const { user: currentUser } = useAuth();
  const { showToast } = useToast();
  const isSuperAdmin = currentUser?.role === 'superadmin';

  const fetchUsers = useCallback(async (page: number = 1, search: string = '') => {
    setLoading(true);
    try {
      const response = await adminAPI.getUsers(page, 10, search);
      setUsers(response.data.data.users);
      setPagination(response.data.data.pagination);
    } catch (error: any) {
      showToast(error.response?.data?.error || 'Failed to fetch users', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchUsers(1, searchTerm);
  }, [fetchUsers, searchTerm]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchTerm(searchInput);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setSearchTerm('');
  };

  const handleStatusChange = (user: User) => {
    setModal({
      isOpen: true,
      userId: user.id,
      action: user.status === 'active' ? 'deactivate' : 'activate',
      userName: user.fullName,
    });
  };

  const handleDelete = (user: User) => {
    setModal({
      isOpen: true,
      userId: user.id,
      action: 'delete',
      userName: user.fullName,
    });
  };

  const confirmAction = async () => {
    setActionLoading(modal.userId);
    try {
      if (modal.action === 'activate') {
        await adminAPI.activateUser(modal.userId);
        showToast('User activated successfully', 'success');
        setUsers((prev) =>
          prev.map((u) =>
            u.id === modal.userId ? { ...u, status: 'active' } : u
          )
        );
      } else if (modal.action === 'deactivate') {
        await adminAPI.deactivateUser(modal.userId);
        showToast('User deactivated successfully', 'success');
        setUsers((prev) =>
          prev.map((u) =>
            u.id === modal.userId ? { ...u, status: 'inactive' } : u
          )
        );
      } else if (modal.action === 'delete') {
        await adminAPI.deleteUser(modal.userId);
        showToast('User deleted successfully', 'success');
        setUsers((prev) => prev.filter((u) => u.id !== modal.userId));
      }
    } catch (error: any) {
      showToast(error.response?.data?.error || 'Action failed', 'error');
    } finally {
      setActionLoading(null);
      setModal({ ...modal, isOpen: false });
    }
  };

  const handlePageChange = (page: number) => {
    fetchUsers(page, searchTerm);
  };

  const canModifyUser = (user: User) => {
    // Superadmin can modify anyone except themselves and other superadmins
    if (isSuperAdmin) {
      return user.role !== 'superadmin' && user.id !== currentUser?.id;
    }
    // Admin can only modify users (not admins or superadmins)
    return user.role === 'user';
  };

  const getModalConfig = () => {
    switch (modal.action) {
      case 'activate':
        return {
          title: 'Activate User',
          message: `Are you sure you want to activate ${modal.userName}?`,
          confirmText: 'Activate',
          confirmVariant: 'primary' as const,
        };
      case 'deactivate':
        return {
          title: 'Deactivate User',
          message: `Are you sure you want to deactivate ${modal.userName}?`,
          confirmText: 'Deactivate',
          confirmVariant: 'danger' as const,
        };
      case 'delete':
        return {
          title: 'Delete User',
          message: `Are you sure you want to permanently delete ${modal.userName}? This action cannot be undone.`,
          confirmText: 'Delete',
          confirmVariant: 'danger' as const,
        };
    }
  };

  const modalConfig = getModalConfig();

  if (loading && users.length === 0) {
    return (
      <div className="dashboard-loading">
        <Spinner size="large" />
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>User Management</h1>
        <p className="dashboard-subtitle">Manage all users in the system</p>
      </div>

      <div className="dashboard-controls">
        <form onSubmit={handleSearch} className="search-form">
          <Input
            type="text"
            placeholder="Search by name or email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <Button type="submit">Search</Button>
          {searchTerm && (
            <Button type="button" variant="secondary" onClick={handleClearSearch}>
              Clear
            </Button>
          )}
        </form>
      </div>

      <div className="table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.fullName}</td>
                <td>{user.email}</td>
                <td>
                  <span className={`badge badge-${user.role}`}>
                    {user.role}
                  </span>
                </td>
                <td>
                  <span className={`badge badge-${user.status}`}>
                    {user.status}
                  </span>
                </td>
                <td className="actions-cell">
                  {canModifyUser(user) && (
                    <>
                      <Button
                        variant={user.status === 'active' ? 'danger' : 'primary'}
                        onClick={() => handleStatusChange(user)}
                        disabled={actionLoading === user.id}
                      >
                        {user.status === 'active' ? 'Deactivate' : 'Activate'}
                      </Button>
                      {isSuperAdmin && (
                        <Button
                          variant="danger"
                          onClick={() => handleDelete(user)}
                          disabled={actionLoading === user.id}
                        >
                          Delete
                        </Button>
                      )}
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {users.length === 0 && (
        <div className="empty-state">
          <p>{searchTerm ? 'No users found matching your search' : 'No users found'}</p>
        </div>
      )}

      <Pagination
        currentPage={pagination.page}
        totalPages={pagination.pages}
        onPageChange={handlePageChange}
      />

      <Modal
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        onConfirm={confirmAction}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmText={modalConfig.confirmText}
        confirmVariant={modalConfig.confirmVariant}
        loading={actionLoading !== null}
      />
    </div>
  );
};

export default AdminDashboard;
