'use client';

import { useState, useEffect } from 'react';
import { showToast } from './Toast';
import { getOwners, addOwner, removeOwner } from '@/lib/aptos';

interface AdminManagementProps {
  account?: any;
  signTransaction?: any;
  currentUserAddress?: string;
  isAdmin: boolean;
}

export function AdminManagement({
  account,
  signTransaction,
  currentUserAddress,
  isAdmin,
}: AdminManagementProps) {
  const [owners, setOwners] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAdminAddress, setNewAdminAddress] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    // Only load owners if user is an admin
    if (isAdmin && currentUserAddress) {
      loadOwners();
    }
  }, [isAdmin, currentUserAddress]);

  const loadOwners = async () => {
    // Double-check admin status before making RPC calls
    if (!isAdmin || !currentUserAddress) {
      return;
    }

    setLoading(true);
    try {
      const adminAddresses = await getOwners();
      setOwners(adminAddresses);
    } catch (error) {
      console.error('Error loading owners:', error);
      showToast('Failed to load admin addresses', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAdmin = async () => {
    if (!account || !signTransaction || !newAdminAddress.trim()) return;

    // Basic validation
    if (!newAdminAddress.startsWith('0x') || newAdminAddress.length !== 66) {
      showToast('Invalid address format. Must be 0x followed by 64 hex characters', 'error');
      return;
    }

    setProcessing(true);
    try {
      const success = await addOwner(account, signTransaction, newAdminAddress);
      if (success) {
        await loadOwners();
        setNewAdminAddress('');
        setShowAddModal(false);
        showToast('Admin added successfully!', 'success');
      } else {
        showToast('Failed to add admin', 'error');
      }
    } catch (error) {
      console.error('Error adding admin:', error);
      showToast('Error adding admin', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleRemoveAdmin = async (addressToRemove: string) => {
    if (!account || !signTransaction) return;

    if (owners.length === 1) {
      showToast('Cannot remove the last admin', 'error');
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to remove this admin?\n\n${addressToRemove}\n\nThis action cannot be undone.`
    );
    if (!confirmed) return;

    setProcessing(true);
    try {
      const success = await removeOwner(account, signTransaction, addressToRemove);
      if (success) {
        await loadOwners();
        showToast('Admin removed successfully', 'success');
      } else {
        showToast('Failed to remove admin', 'error');
      }
    } catch (error) {
      console.error('Error removing admin:', error);
      showToast('Error removing admin', 'error');
    } finally {
      setProcessing(false);
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Admin Management
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage admin/owner addresses for the registry
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          disabled={processing}
          className="px-4 py-2 bg-guild-green-600 hover:bg-guild-green-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          + Add Admin
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin text-2xl mb-2">⏳</div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Loading admins...</p>
        </div>
      ) : (
        <div className="space-y-2">
          {owners.map((address, index) => (
            <div
              key={address}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center gap-3">
                <div className="text-2xl">
                  {address === currentUserAddress ? '👤' : '👥'}
                </div>
                <div>
                  <code className="text-xs font-mono text-gray-900 dark:text-gray-100">
                    {address}
                  </code>
                  {address === currentUserAddress && (
                    <span className="ml-2 text-xs bg-guild-green-500 text-white px-2 py-0.5 rounded-md">
                      You
                    </span>
                  )}
                  {index === 0 && owners.length > 1 && (
                    <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-0.5 rounded-md">
                      Primary
                    </span>
                  )}
                </div>
              </div>
              {owners.length > 1 && (
                <button
                  onClick={() => handleRemoveAdmin(address)}
                  disabled={processing}
                  className="px-3 py-1 text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Admin Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => !processing && setShowAddModal(false)}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-xl p-6 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
              Add New Admin
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Enter the wallet address of the user you want to grant admin privileges:
            </p>
            <input
              type="text"
              value={newAdminAddress}
              onChange={(e) => setNewAdminAddress(e.target.value)}
              placeholder="0x..."
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-mono"
            />
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              Address must start with 0x and be 66 characters long
            </p>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => !processing && setShowAddModal(false)}
                disabled={processing}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddAdmin}
                disabled={!newAdminAddress.trim() || processing}
                className="flex-1 px-4 py-2 bg-guild-green-600 hover:bg-guild-green-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? 'Adding...' : 'Add Admin'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
