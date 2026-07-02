import apiClient from './client';

// ---------------------------------------------------------------------------
// Web Push subscribe/unsubscribe. iOS requires the PWA to be installed to the
// home screen (16.4+); browsers need Notification permission.
// ---------------------------------------------------------------------------

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = window.atob(b64);
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

export const pushApi = {
  supported(): boolean {
    return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
  },

  async currentSubscription(): Promise<PushSubscription | null> {
    if (!this.supported()) return null;
    const reg = await navigator.serviceWorker.ready;
    return reg.pushManager.getSubscription();
  },

  /** Request permission, subscribe with the server's VAPID key, persist. */
  async enable(): Promise<boolean> {
    if (!this.supported()) return false;
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return false;
    const { data } = await apiClient.get('/api/push/vapid-public-key');
    const key = (data as { key: string }).key;
    if (!key) return false;
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(key) as BufferSource,
    });
    await apiClient.post('/api/push/subscribe', sub.toJSON());
    return true;
  },

  async disable(): Promise<void> {
    const sub = await this.currentSubscription();
    if (!sub) return;
    await apiClient.post('/api/push/unsubscribe', { endpoint: sub.endpoint }).catch(() => {});
    await sub.unsubscribe();
  },
};
