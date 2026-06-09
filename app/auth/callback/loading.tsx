export default function Loading() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#141523',
      color: '#ffffff',
      gap: '24px',
    }}>
      <div style={{
        width: '48px',
        height: '48px',
        border: '4px solid rgba(1, 214, 118, 0.2)',
        borderTop: '4px solid #01D676',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
      }} />
      <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#a9a9ca' }}>
        Signing you in...
      </h2>
      <p style={{ margin: 0, fontSize: '0.875rem', color: 'rgba(169, 169, 202, 0.7)' }}>
        Please wait while we complete the authentication
      </p>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}} />
    </div>
  );
}
