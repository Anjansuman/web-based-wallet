// pages/Connect/Connect.tsx
import { useState, useEffect } from 'react';
import { useHashedStore } from '../../store/hashed-store';

interface ConnectRequest {
    origin: string;
    title: string;
    favicon?: string;
    timestamp: number;
}

interface ConnectProps {
    onApprove: () => void;
    onReject: () => void;
}

export default function Connect({ onApprove, onReject }: ConnectProps) {
    const [connectRequest, setConnectRequest] = useState<ConnectRequest | null>(null);
    const [loading, setLoading] = useState(false);
    const { hashed } = useHashedStore();

    useEffect(() => {
        // Get pending connection request from storage
        chrome.storage.local.get('pendingRequest', (data) => {
            if (data.pendingRequest && data.pendingRequest.type === 'connection') {
                setConnectRequest({
                    origin: data.pendingRequest.origin || 'Unknown dApp',
                    title: data.pendingRequest.title || 'Unknown dApp',
                    favicon: data.pendingRequest.favicon,
                    timestamp: data.pendingRequest.timestamp
                });
            }
        });
    }, []);

    const handleApprove = async () => {
        setLoading(true);
        try {
            const selectedAddress = hashed?.getSelectedAccount?.();

            // Store approval response
            await chrome.storage.local.set({
                requestResponse: {
                    approved: true,
                    accounts: selectedAddress ? [selectedAddress] : []
                }
            });

            onApprove();
        } catch (error) {
            console.error('Error approving connection:', error);
            setLoading(false);
        }
    };

    const handleReject = async () => {
        setLoading(true);
        try {
            // Store rejection response
            await chrome.storage.local.set({
                requestResponse: {
                    approved: false,
                    error: 'User rejected the request'
                }
            });

            onReject();
        } catch (error) {
            console.error('Error rejecting connection:', error);
            setLoading(false);
        }
    };

    const selectedAddress = hashed?.getSelectedAccount?.().publicKey;
    const shortAddress = selectedAddress
        ? `${selectedAddress.slice(0, 6)}...${selectedAddress.slice(-4)}`
        : 'No account selected';

    if (!connectRequest) {
        return (
            <div className="w-full h-full flex justify-center items-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading connection request...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full flex flex-col bg-white">
            {/* Header */}
            <div className="bg-blue-600 text-white p-4 text-center">
                <h1 className="text-lg font-semibold">Connection Request</h1>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 flex flex-col">
                {/* dApp Info */}
                <div className="text-center mb-6">
                    {connectRequest.favicon && (
                        <img
                            src={connectRequest.favicon}
                            alt="dApp icon"
                            className="w-16 h-16 mx-auto mb-4 rounded-lg"
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                            }}
                        />
                    )}
                    <h2 className="text-xl font-bold text-gray-800 mb-2">
                        {connectRequest.title}
                    </h2>
                    <p className="text-gray-600 text-sm mb-2">
                        {connectRequest.origin}
                    </p>
                    <p className="text-gray-500 text-xs">
                        wants to connect to your wallet
                    </p>
                </div>

                {/* Account Info */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">
                        Account to connect:
                    </h3>
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">
                                {selectedAddress ? selectedAddress.toUpperCase() : '?'}
                            </span>
                        </div>
                        <div>
                            <p className="font-mono text-sm text-gray-800">{shortAddress}</p>
                            <p className="text-xs text-gray-500">Account 1</p>
                        </div>
                    </div>
                </div>

                {/* Permissions */}
                <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">
                        This dApp will be able to:
                    </h3>
                    <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <span className="text-green-500">✓</span>
                            <span>View your account address and balance</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <span className="text-green-500">✓</span>
                            <span>Request approval for transactions</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <span className="text-green-500">✓</span>
                            <span>Request approval for message signing</span>
                        </div>
                    </div>
                </div>

                {/* Warning */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
                    <div className="flex items-start space-x-2">
                        <span className="text-yellow-600 text-sm">⚠️</span>
                        <div>
                            <p className="text-xs text-yellow-800 font-medium">
                                Only connect to websites you trust
                            </p>
                            <p className="text-xs text-yellow-700 mt-1">
                                This site will be able to view your public address and request transactions.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Buttons */}
                <div className="mt-auto flex space-x-3">
                    <button
                        onClick={handleReject}
                        disabled={loading}
                        className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {loading ? 'Processing...' : 'Reject'}
                    </button>
                    <button
                        onClick={handleApprove}
                        disabled={loading || !selectedAddress}
                        className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {loading ? 'Connecting...' : 'Connect'}
                    </button>
                </div>
            </div>
        </div>
    );
}