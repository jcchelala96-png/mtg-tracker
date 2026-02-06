import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface QueuedMutation {
    id: string;
    url: string;
    method: string;
    body: any;
    timestamp: number;
}

export function useOfflineMutation() {
    const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            processQueue();
        };
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const processQueue = async () => {
        const queue: QueuedMutation[] = JSON.parse(localStorage.getItem('offlineQueue') || '[]');
        if (queue.length === 0) return;

        toast.info(`Syncing ${queue.length} offline actions...`);

        const remainingQueue: QueuedMutation[] = [];

        for (const item of queue) {
            try {
                const res = await fetch(item.url, {
                    method: item.method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(item.body),
                });
                if (!res.ok) throw new Error('Failed to sync');
            } catch (err) {
                console.error('Sync failed for item', item, err);
                remainingQueue.push(item); // Keep in queue if failed (maybe retry later)
            }
        }

        localStorage.setItem('offlineQueue', JSON.stringify(remainingQueue));

        if (remainingQueue.length === 0) {
            toast.success('All offline changes synced!');
            // Optional: trigger re-fetch of data
            window.location.reload();
        } else {
            toast.warning(`${remainingQueue.length} items failed to sync.`);
        }
    };

    const performMutation = async (url: string, method: string, body: any) => {
        if (!isOnline) {
            const queue: QueuedMutation[] = JSON.parse(localStorage.getItem('offlineQueue') || '[]');
            queue.push({
                id: crypto.randomUUID(),
                url,
                method,
                body,
                timestamp: Date.now(),
            });
            localStorage.setItem('offlineQueue', JSON.stringify(queue));
            toast.warning('Offline: Saved to queue. Will sync when online.');
            return { success: true, offline: true };
        }

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            if (!res.ok) throw new Error('Request failed');
            return await res.json();
        } catch (error) {
            // If fetch fails (maybe connection dropped mid-request), queue it
            console.error('Fetch failed, queuing', error);
            const queue: QueuedMutation[] = JSON.parse(localStorage.getItem('offlineQueue') || '[]');
            queue.push({
                id: crypto.randomUUID(),
                url,
                method,
                body,
                timestamp: Date.now(),
            });
            localStorage.setItem('offlineQueue', JSON.stringify(queue));
            toast.warning('Network error: Saved to queue.');
            return { success: true, offline: true };
        }
    };

    return { performMutation, isOnline };
}
