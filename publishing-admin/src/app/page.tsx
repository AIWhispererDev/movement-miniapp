'use client';

import { AdminManagement } from '@/components/AdminManagement';
import { AppCard } from '@/components/AppCard';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ToastContainer, showToast } from '@/components/Toast';
import { TreasuryManagement } from '@/components/TreasuryManagement';
import { WalletButton } from '@/components/WalletButton';
import {
  approveApp,
  approveRejectedApp,
  approveUpdate,
  checkIsOwner,
  getAllApps,
  getPendingChange,
  getStats,
  hasPendingChange,
  rejectApp,
  revertToPending,
} from '@/lib/aptos';
import { AppMetadata, AppStatus } from '@/types/app';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { useEffect, useState } from 'react';

type TabType = 'all' | 'pending' | 'approved' | 'rejected' | 'updates';

export default function Dashboard() {
  const { account, signTransaction } = useWallet();
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [apps, setApps] = useState<AppMetadata[]>([]);
  const [pendingUpdates, setPendingUpdates] = useState<Set<number>>(new Set());
  const [pendingChanges, setPendingChanges] = useState<Map<number, any>>(new Map());
  const [stats, setStats] = useState({ total: 0, approved: 0, pending: 0 });
  const [loading, setLoading] = useState(true);
  const [processingApp, setProcessingApp] = useState<number | null>(null);
  const [userIsAdmin, setUserIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  // Check if connected wallet is an on-chain owner
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!account?.address) {
        setUserIsAdmin(false);
        setCheckingAdmin(false);
        return;
      }
      setCheckingAdmin(true);
      try {
        const isOwner = await checkIsOwner(account.address);
        setUserIsAdmin(isOwner);
      } catch (error) {
        console.error('Error checking admin status:', error);
        setUserIsAdmin(false);
      } finally {
        setCheckingAdmin(false);
      }
    };
    checkAdminStatus();
  }, [account?.address]);

  useEffect(() => {
    // Only load data if user is logged in AND is an admin
    if (account?.address && userIsAdmin) {
      loadData();
    } else {
      setLoading(false);
      setApps([]);
      setStats({ total: 0, approved: 0, pending: 0 });
      setPendingUpdates(new Set());
      setPendingChanges(new Map());
    }
  }, [account?.address, userIsAdmin]); // Reload when wallet connects/disconnects or admin status changes

  const loadData = async () => {
    // Double-check admin status before making RPC calls
    if (!account?.address || !userIsAdmin) {
      return;
    }

    setLoading(true);
    try {
      const [allApps, registryStats] = await Promise.all([
        getAllApps(account.address),
        getStats(),
      ]);

      console.log('Loaded apps:', allApps);
      console.log('Apps count:', allApps.length);
      console.log('Stats:', registryStats);

      allApps.forEach((app, index) => {
        console.log(`App ${index}:`, {
          name: app.name,
          status: app.status,
          developer: app.developer_address
        });
      });

      setApps(allApps);
      setStats(registryStats);

      // Check for pending updates and fetch change details
      const updates = new Set<number>();
      const changes = new Map<number, any>();
      await Promise.all(
        allApps.map(async (app) => {
          if (app.app_id !== undefined) {
            const hasPending = await hasPendingChange(app.app_id);
            if (hasPending) {
              updates.add(app.app_id);
              const change = await getPendingChange(app.app_id);
              if (change) {
                changes.set(app.app_id, change);
              }
            }
          }
        })
      );
      setPendingUpdates(updates);
      setPendingChanges(changes);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (appId: number) => {
    if (!userIsAdmin || !account || !signTransaction) return;

    setProcessingApp(appId);
    try {
      const success = await approveApp(account, signTransaction, appId);
      if (success) {
        await loadData();
        showToast('App approved successfully!', 'success');
      } else {
        showToast('Failed to approve app', 'error');
      }
    } catch (error) {
      console.error('Error approving app:', error);
      showToast('Error approving app', 'error');
    } finally {
      setProcessingApp(null);
    }
  };

  const handleReject = async (appId: number, reason: string) => {
    if (!userIsAdmin || !account || !signTransaction) return;

    setProcessingApp(appId);
    try {
      const success = await rejectApp(account, signTransaction, appId, reason);
      if (success) {
        await loadData();
        showToast('App rejected successfully', 'success');
      } else {
        showToast('Failed to reject app', 'error');
      }
    } catch (error) {
      console.error('Error rejecting app:', error);
      showToast('Error rejecting app', 'error');
    } finally {
      setProcessingApp(null);
    }
  };

  const handleApproveUpdate = async (appId: number) => {
    if (!userIsAdmin || !account || !signTransaction) return;

    setProcessingApp(appId);
    try {
      const success = await approveUpdate(account, signTransaction, appId);
      if (success) {
        await loadData();
        showToast('Update approved successfully!', 'success');
      } else {
        showToast('Failed to approve update', 'error');
      }
    } catch (error) {
      console.error('Error approving update:', error);
      showToast('Error approving update', 'error');
    } finally {
      setProcessingApp(null);
    }
  };

  const handleApproveRejected = async (appId: number) => {
    if (!userIsAdmin || !account || !signTransaction) return;

    setProcessingApp(appId);
    try {
      const success = await approveRejectedApp(account, signTransaction, appId);
      if (success) {
        await loadData();
        showToast('Rejected app approved successfully!', 'success');
      } else {
        showToast('Failed to approve rejected app', 'error');
      }
    } catch (error) {
      console.error('Error approving rejected app:', error);
      showToast('Error approving rejected app', 'error');
    } finally {
      setProcessingApp(null);
    }
  };

  const handleRevertToPending = async (appId: number) => {
    if (!userIsAdmin || !account || !signTransaction) return;

    setProcessingApp(appId);
    try {
      const success = await revertToPending(account, signTransaction, appId);
      if (success) {
        await loadData();
        showToast('App reverted to pending for re-review', 'success');
      } else {
        showToast('Failed to revert app to pending', 'error');
      }
    } catch (error) {
      console.error('Error reverting app to pending:', error);
      showToast('Error reverting app to pending', 'error');
    } finally {
      setProcessingApp(null);
    }
  };

  const filteredApps = apps.filter((app) => {
    let shouldInclude = false;
    switch (activeTab) {
      case 'pending':
        shouldInclude = app.status === AppStatus.PENDING;
        console.log(`App ${app.name}: status=${app.status}, PENDING=${AppStatus.PENDING}, included=${shouldInclude}`);
        return shouldInclude;
      case 'approved':
        shouldInclude = app.status === AppStatus.APPROVED;
        return shouldInclude;
      case 'rejected':
        shouldInclude = app.status === AppStatus.REJECTED;
        return shouldInclude;
      case 'updates':
        shouldInclude = app.app_id !== undefined && pendingUpdates.has(app.app_id);
        return shouldInclude;
      case 'all':
      default:
        return true;
    }
  });

  console.log(`Active tab: ${activeTab}, Total apps: ${apps.length}, Filtered: ${filteredApps.length}`);

  const tabs: { key: TabType; label: string; count?: number }[] = [
    { key: 'all', label: 'All Apps', count: stats.total },
    { key: 'pending', label: 'Pending', count: stats.pending },
    { key: 'approved', label: 'Approved', count: stats.approved },
    { key: 'rejected', label: 'Rejected', count: stats.total - stats.approved - stats.pending },
    { key: 'updates', label: 'Updates', count: pendingUpdates.size },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <ToastContainer />
      {/* Clean Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Movement Publishing Admin
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Manage mini app submissions and approvals
              </p>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <WalletButton />
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!account ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔐</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Connect Your Wallet
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Connect your admin wallet to access the dashboard
            </p>
            <div className="max-w-md mx-auto mt-6 p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-900 dark:text-blue-100 font-medium mb-2">
                ⚠️ Important: Configure Your Wallet
              </p>
              <p className="text-xs text-blue-800 dark:text-blue-200">
                Make sure your wallet is configured for <strong>Movement Network Testnet</strong> before connecting.
              </p>
            </div>
          </div>
        ) : checkingAdmin ? (
          <div className="text-center py-20">
            <div className="animate-spin text-4xl mb-4">⏳</div>
            <p className="text-gray-600 dark:text-gray-400">Checking admin status...</p>
          </div>
        ) : !userIsAdmin ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Unauthorized Access
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              Your wallet address is not authorized as an admin.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 font-mono">
              {account.address}
            </p>
          </div>
        ) : (
          <>
            {/* Admin Management */}
            <AdminManagement
              account={account}
              signTransaction={signTransaction}
              currentUserAddress={account.address}
              isAdmin={userIsAdmin}
            />

            {/* Treasury & Fee Management */}
            <TreasuryManagement
              account={account}
              signTransaction={signTransaction}
              isAdmin={userIsAdmin}
            />

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <StatCard label="Total Apps" value={stats.total} icon="📱" />
              <StatCard label="Pending Review" value={stats.pending} icon="⏳" color="orange" />
              <StatCard label="Approved" value={stats.approved} icon="✅" color="green" />
              <StatCard label="Updates" value={pendingUpdates.size} icon="🔄" color="blue" />
            </div>

            {/* Clean Tabs */}
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 mb-6 overflow-hidden">
              <nav className="flex overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`
                      px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors
                      ${activeTab === tab.key
                        ? 'border-guild-green-500 text-guild-green-600 dark:text-guild-green-400 bg-guild-green-50 dark:bg-guild-green-950'
                        : 'border-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
                      }
                    `}
                  >
                    <span className="flex items-center gap-2">
                      {tab.label}
                      {tab.count !== undefined && (
                        <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${activeTab === tab.key
                            ? 'bg-guild-green-500 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }`}>
                          {tab.count}
                        </span>
                      )}
                    </span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Apps Grid */}
            {loading ? (
              <div className="text-center py-20">
                <div className="animate-spin text-4xl mb-4">⏳</div>
                <p className="text-gray-600 dark:text-gray-400">Loading apps...</p>
              </div>
            ) : filteredApps.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">📭</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  No apps found
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {activeTab === 'pending'
                    ? 'No apps pending review'
                    : activeTab === 'updates'
                      ? 'No pending updates'
                      : 'No apps in this category'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredApps.map((app) => (
                  <AppCard
                    key={app.app_id ?? app.developer_address}
                    app={app}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    onApproveUpdate={handleApproveUpdate}
                    onApproveRejected={handleApproveRejected}
                    onRevertToPending={handleRevertToPending}
                    hasPendingUpdate={app.app_id !== undefined && pendingUpdates.has(app.app_id)}
                    pendingChange={app.app_id !== undefined ? pendingChanges.get(app.app_id) : null}
                    isAdmin={userIsAdmin}
                    isProcessing={app.app_id !== undefined && processingApp === app.app_id}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  color = 'gray',
}: {
  label: string;
  value: number;
  icon: string;
  color?: 'gray' | 'orange' | 'green' | 'blue';
}) {
  const colorClasses = {
    gray: {
      bg: 'bg-gray-50 dark:bg-gray-800',
      text: 'text-gray-900 dark:text-gray-100',
      border: 'border-gray-200 dark:border-gray-700',
    },
    orange: {
      bg: 'bg-orange-50 dark:bg-orange-950',
      text: 'text-orange-700 dark:text-orange-400',
      border: 'border-orange-200 dark:border-orange-800',
    },
    green: {
      bg: 'bg-green-50 dark:bg-green-950',
      text: 'text-green-700 dark:text-green-400',
      border: 'border-green-200 dark:border-green-800',
    },
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-950',
      text: 'text-blue-700 dark:text-blue-400',
      border: 'border-blue-200 dark:border-blue-800',
    },
  };

  const styles = colorClasses[color];

  return (
    <div className={`rounded-lg p-5 border ${styles.bg} ${styles.text} ${styles.border}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">{label}</p>
          <p className="text-3xl font-bold">{value}</p>
        </div>
        <div className="text-3xl opacity-70">{icon}</div>
      </div>
    </div>
  );
}
