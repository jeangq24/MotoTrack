export interface SyncAction {
    id: string;
    endpoint: string;
    method: 'POST' | 'PATCH' | 'DELETE';
    payload?: any;
    timestamp: number;
}

const STORAGE_KEY = 'mototrack_sync_queue';

function getQueue(): SyncAction[] {
    if (typeof window === 'undefined') return [];
    try {
        const item = localStorage.getItem(STORAGE_KEY);
        return item ? JSON.parse(item) : [];
    } catch {
        return [];
    }
}

function setQueue(q: SyncAction[]) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(q));
}

export const syncManager = {
    getQueue,
    addAction: (action: Omit<SyncAction, 'id' | 'timestamp'>) => {
        const q = getQueue();
        q.push({ ...action, id: Date.now().toString(36) + Math.random().toString(36).slice(2), timestamp: Date.now() });
        setQueue(q);
    },
    removeAction: (id: string) => {
        const q = getQueue().filter(a => a.id !== id);
        setQueue(q);
    },
    flush: async (onSuccess?: () => void) => {
        if (typeof window === 'undefined' || !navigator.onLine) return;
        const q = getQueue();
        if (q.length === 0) return;

        let anyFlushed = false;
        for (const action of q) {
            try {
                const res = await fetch(action.endpoint, {
                    method: action.method,
                    headers: { 'Content-Type': 'application/json' },
                    body: action.payload ? JSON.stringify(action.payload) : undefined,
                });
                
                // If it succeeds, or it's a 4xx error (won't succeed later anyway), remove from queue
                if (res.ok || (res.status >= 400 && res.status < 500)) {
                    syncManager.removeAction(action.id);
                    anyFlushed = true;
                } 
            } catch (error) {
                // Network error, break queue to maintain order and retry later
                break;
            }
        }

        if (anyFlushed && onSuccess) {
            onSuccess();
        }
    }
}
