import { useState, useEffect, useCallback } from 'react';
import { safegoldService } from '../services/api';

const Row = ({ label, value }) => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      gap: '1rem',
      padding: '0.5rem 0',
      borderBottom: '1px solid rgba(0,0,0,0.06)'
    }}
  >
    <span style={{ color: 'var(--muted)' }}>{label}</span>
    <span style={{ fontWeight: 600, wordBreak: 'break-all', textAlign: 'right' }}>
      {value ?? '—'}
    </span>
  </div>
);

const SafeGoldTestPage = () => {
  const [status, setStatus] = useState(null);
  const [result, setResult] = useState(null);
  const [testing, setTesting] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(true);

  const loadStatus = useCallback(async () => {
    setLoadingStatus(true);
    try {
      const res = await safegoldService.getStatus();
      setStatus(res.data);
    } catch {
      setStatus(null);
    } finally {
      setLoadingStatus(false);
    }
  }, []);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  const runTest = async () => {
    setTesting(true);
    setResult(null);
    try {
      const res = await safegoldService.testConnection();
      setResult(res.data);
    } catch (error) {
      // testConnection returns 502 on failure → axios throws; use the response body if present.
      const data = error.response?.data;
      if (data && typeof data === 'object') {
        // Backend returned a structured result — force ok:false and keep every field.
        setResult({ ...data, ok: false });
      } else {
        setResult({
          ok: false,
          tested: false,
          message:
            (typeof data === 'string' && data) ||
            error.message ||
            'Could not reach the backend to run the SafeGold test. Is the API server running?',
          reason: error.response
            ? `The backend responded with HTTP ${error.response.status} but not the expected SafeGold test payload. The /api/safegold/test-connection route may be missing — make sure the backend is updated and restarted.`
            : 'The request to the backend never completed (no response). Check that the API server is running and reachable.',
          code: error.response ? `HTTP_${error.response.status}` : 'REQUEST_FAILED',
          statusCode: error.response?.status,
          rawError: data ?? null
        });
      }
    } finally {
      setTesting(false);
    }
  };

  const ok = result?.ok;
  const isMockMode = result?.code === 'SAFEGOLD_MOCK_MODE';

  return (
    <div className="page">
      <div className="page-hero">
        <h1 className="page-hero-title">SafeGold Connection Test</h1>
        <p className="page-hero-desc">
          Verify the server-to-server SafeGold partner API connection and view any errors clearly.
        </p>
      </div>

      <section className="panel page-feature" style={{ maxWidth: 760, margin: '0 auto' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '1rem'
          }}
        >
          <h2 style={{ margin: 0 }}>Current Configuration</h2>
          <button type="button" className="btn-secondary" onClick={loadStatus} disabled={loadingStatus}>
            {loadingStatus ? 'Loading...' : 'Reload'}
          </button>
        </div>

        {status ? (
          <div style={{ marginBottom: '1.5rem' }}>
            <Row label="Mode" value={status.mode} />
            <Row label="Base URL" value={status.baseUrl} />
            <Row label="Path prefix" value={status.pathPrefix} />
            <Row label="Buy-price URL" value={status.buyPriceUrl} />
            <Row label="API key configured" value={status.hasApiKey ? 'Yes' : 'No'} />
            <Row label="Mock mode" value={status.mock ? 'ON' : 'OFF'} />
          </div>
        ) : (
          <p style={{ color: 'var(--muted)' }}>
            {loadingStatus ? 'Loading configuration...' : 'Could not load configuration from backend.'}
          </p>
        )}

        <button
          type="button"
          className="btn-primary"
          onClick={runTest}
          disabled={testing}
          style={{ width: '100%' }}
        >
          {testing ? 'Testing connection...' : 'Test SafeGold Connection'}
        </button>

        {result && (
          <div
            style={{
              marginTop: '1.5rem',
              padding: '1.25rem',
              borderRadius: 12,
              border: `2px solid ${ok ? '#16a34a' : isMockMode ? '#f59e0b' : '#dc2626'}`,
              background: ok
                ? 'rgba(22,163,74,0.08)'
                : isMockMode
                  ? 'rgba(245,158,11,0.08)'
                  : 'rgba(220,38,38,0.07)'
            }}
            role="alert"
          >
            <h3
              style={{
                margin: '0 0 0.5rem 0',
                color: ok ? '#16a34a' : isMockMode ? '#b45309' : '#dc2626'
              }}
            >
              {ok
                ? '✓ Connection Successful'
                : isMockMode
                  ? '⚠ Mock Mode — Live Connection Not Tested'
                  : '✕ Connection Failed'}
            </h3>

            <p style={{ margin: '0 0 0.75rem 0' }}>{result.message}</p>

            {!ok && result.reason && (
              <p
                style={{
                  margin: '0 0 0.75rem 0',
                  padding: '0.75rem',
                  borderRadius: 8,
                  background: 'rgba(0,0,0,0.04)',
                  fontSize: '0.92rem'
                }}
              >
                <strong>Reason: </strong>
                {result.reason}
              </p>
            )}

            <div>
              {result.code && <Row label="Error code" value={result.code} />}
              {result.statusCode && <Row label="HTTP status" value={result.statusCode} />}
              {typeof result.latencyMs === 'number' && (
                <Row label="Latency" value={`${result.latencyMs} ms`} />
              )}
              {result.sample?.current_price !== undefined && (
                <Row label="Live buy price" value={`₹${result.sample.current_price}`} />
              )}
              {result.sample?.rate_id && <Row label="Rate ID" value={result.sample.rate_id} />}
            </div>

            {result.request && (
              <div style={{ marginTop: '0.75rem' }}>
                <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '0.95rem' }}>Request sent</h4>
                <Row label="Method" value={result.request.method} />
                <Row label="URL" value={result.request.url} />
                <Row label="Authorization" value={result.request.authorization} />
                {result.request.timeoutMs && (
                  <Row label="Timeout" value={`${result.request.timeoutMs} ms`} />
                )}
              </div>
            )}

            {result.response && (
              <div style={{ marginTop: '0.75rem' }}>
                <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '0.95rem' }}>Response received</h4>
                <Row
                  label="Status"
                  value={`${result.response.status}${
                    result.response.statusText ? ` ${result.response.statusText}` : ''
                  }`}
                />
                {result.response.server && <Row label="Server" value={result.response.server} />}
                {result.response.body !== undefined && (
                  <details style={{ marginTop: '0.5rem' }} open>
                    <summary style={{ cursor: 'pointer', color: 'var(--muted)' }}>
                      Response body
                    </summary>
                    <pre
                      style={{
                        marginTop: '0.5rem',
                        padding: '0.75rem',
                        background: 'rgba(0,0,0,0.05)',
                        borderRadius: 8,
                        overflowX: 'auto',
                        fontSize: '0.8rem',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word'
                      }}
                    >
                      {typeof result.response.body === 'string'
                        ? result.response.body
                        : JSON.stringify(result.response.body, null, 2)}
                    </pre>
                  </details>
                )}
                {result.response.headers && (
                  <details style={{ marginTop: '0.5rem' }}>
                    <summary style={{ cursor: 'pointer', color: 'var(--muted)' }}>
                      Response headers
                    </summary>
                    <pre
                      style={{
                        marginTop: '0.5rem',
                        padding: '0.75rem',
                        background: 'rgba(0,0,0,0.05)',
                        borderRadius: 8,
                        overflowX: 'auto',
                        fontSize: '0.8rem'
                      }}
                    >
                      {JSON.stringify(result.response.headers, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            )}

            {!ok && (
              <details style={{ marginTop: '0.75rem' }} open>
                <summary style={{ cursor: 'pointer', color: 'var(--muted)' }}>
                  Full server response
                </summary>
                <pre
                  style={{
                    marginTop: '0.5rem',
                    padding: '0.75rem',
                    background: 'rgba(0,0,0,0.05)',
                    borderRadius: 8,
                    overflowX: 'auto',
                    fontSize: '0.8rem',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word'
                  }}
                >
                  {JSON.stringify(result, null, 2)}
                </pre>
              </details>
            )}

            {result.code === 'SAFEGOLD_FORBIDDEN' && (
              <div style={{ marginTop: '0.75rem', fontSize: '0.9rem', color: 'var(--muted)' }}>
                <strong>How to fix:</strong> Ask SafeGold to whitelist this server&apos;s outbound
                public IP for the host shown above, and confirm the partner API token is for the
                correct environment.
              </div>
            )}
            {result.code === 'SAFEGOLD_NETWORK_ERROR' && (
              <div style={{ marginTop: '0.75rem', fontSize: '0.9rem', color: 'var(--muted)' }}>
                <strong>How to fix:</strong> The server could not reach SafeGold. Check the base URL,
                outbound HTTPS/firewall, and DNS for the host shown above.
              </div>
            )}
            {result.code === 'SAFEGOLD_MOCK_MODE' && (
              <div style={{ marginTop: '0.75rem', fontSize: '0.9rem', color: 'var(--muted)' }}>
                <strong>How to enable live test:</strong> Set <code>SAFEGOLD_USE_MOCK=0</code> and a
                valid <code>SAFEGOLD_API_KEY</code> in the backend environment, then restart.
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default SafeGoldTestPage;
