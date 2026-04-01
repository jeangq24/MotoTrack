'use client';

import { useEffect, useState } from 'react';
import { syncManager } from '../utils/syncManager';
import { Wifi, WifiOff } from 'lucide-react';

export default function OfflineSyncProvider() {
    const [isOnline, setIsOnline] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const [pendingCount, setPendingCount] = useState(0);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setIsOnline(navigator.onLine);
            setPendingCount(syncManager.getQueue().length);

            const handleOnline = async () => {
                setIsOnline(true);
                const count = syncManager.getQueue().length;
                if (count > 0) {
                    setIsSyncing(true);
                    setPendingCount(count);
                    await syncManager.flush(() => {
                        setPendingCount(syncManager.getQueue().length);
                        window.dispatchEvent(new Event('mototrack_synced'));
                    });
                    setIsSyncing(false);
                    setShowSuccess(true);
                    setTimeout(() => setShowSuccess(false), 3000);
                }
            };

            const handleOffline = () => {
                setIsOnline(false);
            };

            window.addEventListener('online', handleOnline);
            window.addEventListener('offline', handleOffline);

            // Register Service Worker
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.register('/sw.js').catch(err => console.log('SW registration failed:', err));
            }

            // Attempt flush on mount if online
            if (navigator.onLine) {
                handleOnline();
            }

            return () => {
                window.removeEventListener('online', handleOnline);
                window.removeEventListener('offline', handleOffline);
            };
        }
    }, []);

    // Also update pending count on an interval just in case queue gets filled
    useEffect(() => {
        if (!isOnline) {
            const interval = setInterval(() => {
                setPendingCount(syncManager.getQueue().length);
            }, 2000);
            return () => clearInterval(interval);
        }
    }, [isOnline]);

    if (isOnline && pendingCount === 0 && !isSyncing && !showSuccess) return null;

    return (
        <div className="fixed top-2 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-4 fade-in duration-300 mt-safe pt-2">
            <div className={`px-4 py-2 rounded-full shadow-lg backdrop-blur-md border text-xs font-bold flex items-center gap-2 transition-all duration-500 ${
                !isOnline 
                  ? 'bg-red-500/20 text-red-400 border-red-500/30' 
                  : isSyncing 
                    ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                    : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
            }`}>
               {!isOnline ? (
                   <><WifiOff className="w-4 h-4" /> Sin conexión ({pendingCount} pendientes)</>
               ) : isSyncing ? (
                   <><div className="w-3 h-3 rounded-full border-2 border-blue-400 border-t-transparent animate-spin"></div> Sincronizando {pendingCount}...</>
               ) : (
                   <><Wifi className="w-4 h-4" /> ¡Sincronizado!</>
               )}
            </div>
        </div>
    );
}
