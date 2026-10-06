import { useEffect, useState } from 'react';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000';

type ApiStatus = 'checking' | 'online' | 'offline';

export function App() {
  const [status, setStatus] = useState<ApiStatus>('checking');

  useEffect(() => {
    const controller = new AbortController();

    fetch(`${apiBaseUrl}/health`, { signal: controller.signal })
      .then((response) => setStatus(response.ok ? 'online' : 'offline'))
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }
        setStatus('offline');
      });

    return () => controller.abort();
  }, []);

  return (
    <main className="app">
      <h1>OpsFlow</h1>
      <p>Web app is running.</p>
      <p>
        API health: <strong data-status={status}>{status}</strong>
      </p>
      <p className="app__hint">
        API base URL: <code>{apiBaseUrl}</code>
      </p>
    </main>
  );
}
