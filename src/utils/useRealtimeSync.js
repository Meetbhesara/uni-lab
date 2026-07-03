import { useEffect } from 'react';
import api from '../api/axios';

/**
 * Global Realtime Sync hook.
 * Connects to the backend Server-Sent Events (SSE) stream at /api/events.
 * When data changes on another computer or window, it dispatches custom window events
 * so active pages can refresh automatically without manual user action.
 *
 * Two events are dispatched for every incoming SSE event:
 *   1. 'app-realtime-update'         – generic, listened by all pages
 *   2. 'app-realtime-<type>'         – module-specific (e.g. 'app-realtime-vehicle')
 */
export const useRealtimeSync = (user) => {
    useEffect(() => {
        if (!user || !user.isAdmin) return;

        const token = localStorage.getItem('token');
        if (!token) return;

        const baseURL = api.defaults.baseURL || 'http://localhost:5001/api';
        const sseUrl = `${baseURL}/events?token=${encodeURIComponent(token)}`;

        let eventSource = null;
        let reconnectTimeout = null;

        // Dispatch both a generic and a module-specific custom event
        const dispatch = (type, raw) => {
            const detail = { type, data: raw };
            window.dispatchEvent(new CustomEvent('app-realtime-update', { detail }));
            window.dispatchEvent(new CustomEvent(`app-realtime-${type}`, { detail }));
        };

        const connect = () => {
            try {
                eventSource = new EventSource(sseUrl);

                eventSource.onopen = () => {
                    console.log('⚡ [RealtimeSync] Connected to live sync stream');
                };

                // Schedules
                eventSource.addEventListener('schedule-changed', (e) => {
                    console.log('⚡ [RealtimeSync] schedule-changed:', e.data);
                    dispatch('schedule', e.data);
                });

                // Expenses / Attendance
                eventSource.addEventListener('expense-changed', (e) => {
                    console.log('⚡ [RealtimeSync] expense-changed:', e.data);
                    dispatch('expense', e.data);
                });

                // Vehicle Master
                eventSource.addEventListener('vehicle-changed', (e) => {
                    console.log('⚡ [RealtimeSync] vehicle-changed:', e.data);
                    dispatch('vehicle', e.data);
                });

                // Client Master
                eventSource.addEventListener('client-changed', (e) => {
                    console.log('⚡ [RealtimeSync] client-changed:', e.data);
                    dispatch('client', e.data);
                });

                // Employee Master
                eventSource.addEventListener('employee-changed', (e) => {
                    console.log('⚡ [RealtimeSync] employee-changed:', e.data);
                    dispatch('employee', e.data);
                });

                // Instrument Master
                eventSource.addEventListener('instrument-changed', (e) => {
                    console.log('⚡ [RealtimeSync] instrument-changed:', e.data);
                    dispatch('instrument', e.data);
                });

                // Drafting Work
                eventSource.addEventListener('drafting-changed', (e) => {
                    console.log('⚡ [RealtimeSync] drafting-changed:', e.data);
                    dispatch('drafting', e.data);
                });

                eventSource.onerror = () => {
                    eventSource.close();
                    reconnectTimeout = setTimeout(connect, 5000);
                };
            } catch (err) {
                console.error('[RealtimeSync] Failed to initialize SSE:', err);
            }
        };

        connect();

        return () => {
            if (eventSource) eventSource.close();
            if (reconnectTimeout) clearTimeout(reconnectTimeout);
        };
    }, [user]);
};
