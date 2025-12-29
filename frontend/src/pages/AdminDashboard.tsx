import React, { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import { User, PaginationInfo } from '../types';
import Button from '../components/Button';
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
  const [modal, setModal] = useState<{
    isOpen: boolean;
    userId: string;
    action: 'activate' | 'deactivate';
    userName: string;
  }>({
    isOpen: false,
    userId: '',
    action: 'activate',
    userName: '',
  });

  const { showToast } = useToast();

  const fetchUsers = useCallback(async (page: number = 1) => {
    setLoading(true);
    try {
      const response = await adminAPI.getUsers(page, 10);
      setUsers(response.data.data.users);
      setPagination(response.data.data.pagination);
    } catch (error: any) {
      showToast(error.response?.data?.error || 'Failed to fetch users', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleStatusChange = (user: User) => {
    setModal({
      isOpen: true,
      userId: user.id,
      action: user.status === 'active' ? 'deactivate' : 'activate',
      userName: user.fullName,
    });
  };

  const confirmStatusChange = async () => {
    setActionLoading(modal.userId);
    try {
      if (modal.action === 'activate') {
        await adminAPI.activateUser(modal.userId);
        showToast('User activated successfully', 'success');
      } else {
        await adminAPI.deactivateUser(modal.userId);
        showToast('User deactivated successfully', 'success');
      }
      setUsers((prev) =>
        prev.map((u) =>
          u.id === modal.userId
            ? { ...u, status: modal.action === 'activate' ? 'active' : 'inactive' }
            : u
        )
      );
    } catch (error: any) {
      showToast(error.response?.data?.error || 'Action failed', 'error');
    } finally {
      setActionLoading(null);
      setModal({ ...modal, isOpen: false });
    }
  };

  const handlePageChange = (page: number) => {
    fetchUsers(page);
  };

  if (loading) {
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

      <div className="table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Full Name</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.email}</td>
                <td>{user.fullName}</td>
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
                <td>
                  <Button
                    variant={user.status === 'active' ? 'danger' : 'primary'}
                    onClick={() => handleStatusChange(user)}
                    disabled={actionLoading === user.id}
                  >
                    {user.status === 'active' ? 'Deactivate' : 'Activate'}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {users.length === 0 && (
        <div className="empty-state">
          <p>No users found</p>
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
        onConfirm={confirmStatusChange}
        title={`${modal.action === 'activate' ? 'Activate' : 'Deactivate'} User`}
        message={`Are you sure you want to ${modal.action} ${modal.userName}?`}
        confirmText={modal.action === 'activate' ? 'Activate' : 'Deactivate'}
        confirmVariant={modal.action === 'activate' ? 'primary' : 'danger'}
        loading={actionLoading !== null}
      />
    </div>
  );
};

export default AdminDashboard;
