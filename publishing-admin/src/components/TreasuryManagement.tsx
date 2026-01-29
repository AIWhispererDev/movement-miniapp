'use client';

import { useState, useEffect } from 'react';
import { showToast } from './Toast';
import { getTreasuryAddress, getSubmitFee, updateTreasuryAddress, updateSubmitFee } from '@/lib/aptos';

interface TreasuryManagementProps {
  account?: any;
  signTransaction?: any;
  isAdmin: boolean;
}

export function TreasuryManagement({
  account,
  signTransaction,
  isAdmin,
}: TreasuryManagementProps) {
  const [treasuryAddress, setTreasuryAddress] = useState('');
  const [submitFeeOctas, setSubmitFeeOctas] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showTreasuryModal, setShowTreasuryModal] = useState(false);
  const [showFeeModal, setShowFeeModal] = useState(false);
  const [newTreasuryAddress, setNewTreasuryAddress] = useState('');
  const [newFeeMOVE, setNewFeeMOVE] = useState('1');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      loadTreasuryInfo();
    }
  }, [isAdmin]);

  const loadTreasuryInfo = async () => {
    if (!isAdmin) return;

    setLoading(true);
    try {
      const [treasury, fee] = await Promise.all([
        getTreasuryAddress(),
        getSubmitFee(),
      ]);
      setTreasuryAddress(treasury);
      setSubmitFeeOctas(fee);
    } catch (error) {
      console.error('Error loading treasury info:', error);
      showToast('Failed to load treasury information', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTreasury = async () => {
    if (!account || !signTransaction || !newTreasuryAddress.trim()) return;

    // Basic validation
    if (!newTreasuryAddress.startsWith('0x') || newTreasuryAddress.length !== 66) {
      showToast('Invalid address format. Must be 0x followed by 64 hex characters', 'error');
      return;
    }

    setProcessing(true);
    try {
      const success = await updateTreasuryAddress(account, signTransaction, newTreasuryAddress);
      if (success) {
        await loadTreasuryInfo();
        setNewTreasuryAddress('');
        setShowTreasuryModal(false);
        showToast('Treasury address updated successfully!', 'success');
      } else {
        showToast('Failed to update treasury address', 'error');
      }
    } catch (error) {
      console.error('Error updating treasury:', error);
      showToast('Error updating treasury address', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleUpdateFee = async () => {
    if (!account || !signTransaction || !newFeeMOVE.trim()) return;

    const feeFloat = parseFloat(newFeeMOVE);
    if (isNaN(feeFloat) || feeFloat < 0) {
      showToast('Invalid fee amount', 'error');
      return;
    }

    // Convert MOVE to octas (1 MOVE = 100,000,000 octas)
    const feeInOctas = Math.floor(feeFloat * 100000000);

    setProcessing(true);
    try {
      const success = await updateSubmitFee(account, signTransaction, feeInOctas);
      if (success) {
        await loadTreasuryInfo();
        setShowFeeModal(false);
        showToast('Submission fee updated successfully!', 'success');
      } else {
        showToast('Failed to update submission fee', 'error');
      }
    } catch (error) {
      console.error('Error updating fee:', error);
      showToast('Error updating submission fee', 'error');
    } finally {
      setProcessing(false);
    }
  };

  if (!isAdmin) return null;

  const feeMOVE = (submitFeeOctas / 100000000).toFixed(2);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 mb-8">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Treasury & Fees</h2>

      {loading ? (
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      ) : (
        <div className="space-y-4">
          {/* Treasury Address */}
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Treasury Address</h3>
              <button
                onClick={() => {
                  setNewTreasuryAddress(treasuryAddress);
                  setShowTreasuryModal(true);
                }}
                className="text-xs bg-guild-green-600 hover:bg-guild-green-700 text-white px-3 py-1 rounded-md transition-colors"
              >
                Update
              </button>
            </div>
            <code className="text-xs bg-white dark:bg-gray-900 px-3 py-2 rounded font-mono block">
              {treasuryAddress || 'Not set'}
            </code>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              All submission fees are sent to this address
            </p>
          </div>

          {/* Submission Fee */}
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Submission Fee</h3>
              <button
                onClick={() => {
                  setNewFeeMOVE(feeMOVE);
                  setShowFeeModal(true);
                }}
                className="text-xs bg-guild-green-600 hover:bg-guild-green-700 text-white px-3 py-1 rounded-md transition-colors"
              >
                Update
              </button>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">{feeMOVE} MOVE</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                ({submitFeeOctas.toLocaleString()} octas)
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              One-time fee charged when developers submit apps
            </p>
          </div>
        </div>
      )}

      {/* Update Treasury Modal */}
      {showTreasuryModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowTreasuryModal(false)}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-xl p-6 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
              Update Treasury Address
            </h3>
            <input
              type="text"
              value={newTreasuryAddress}
              onChange={(e) => setNewTreasuryAddress(e.target.value)}
              placeholder="0x..."
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-mono"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 mb-4">
              All future submission fees will be sent to this address
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowTreasuryModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateTreasury}
                disabled={processing}
                className="flex-1 px-4 py-2 bg-guild-green-600 hover:bg-guild-green-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? 'Updating...' : 'Update'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Fee Modal */}
      {showFeeModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowFeeModal(false)}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-xl p-6 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
              Update Submission Fee
            </h3>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                min="0"
                value={newFeeMOVE}
                onChange={(e) => setNewFeeMOVE(e.target.value)}
                placeholder="1.00"
                className="w-full p-3 pr-16 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-medium">
                MOVE
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 mb-4">
              Fee charged to developers for each app submission
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowFeeModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateFee}
                disabled={processing}
                className="flex-1 px-4 py-2 bg-guild-green-600 hover:bg-guild-green-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? 'Updating...' : 'Update'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
