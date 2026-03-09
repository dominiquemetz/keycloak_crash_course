import React from 'react';
import { useAuth } from 'react-oidc-context';
import ProtectedContent from './components/ProtectedContent';

function App() {
  const auth = useAuth();

  // Handle authentication states
  if (auth.isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>
          <h2>Loading...</h2>
          <p>Initializing authentication...</p>
        </div>
      </div>
    );
  }

  if (auth.error) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div style={{ textAlign: 'center', maxWidth: '600px', padding: '20px' }}>
          <h2 style={{ color: '#f44336' }}>Authentication Error</h2>
          <p>{auth.error.message}</p>
          <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#fff3cd', borderRadius: '5px', textAlign: 'left' }}>
          </div>
          <button
            onClick={() => window.location.reload()}
            style={{ marginTop: '20px', padding: '10px 20px', cursor: 'pointer' }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!auth.isAuthenticated) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f5f5f5' }}>
        <div style={{ textAlign: 'center', padding: '40px', backgroundColor: 'white', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <h1>Keycloak Crash Course Demo</h1>
          <p style={{ marginTop: '20px', marginBottom: '30px', color: '#666' }}>
            Please sign in to access the protected content
          </p>
          <button
            onClick={() => auth.signinRedirect()}
            style={{
              padding: '12px 30px',
              fontSize: '16px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              transition: 'background-color 0.3s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#45a049'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#4CAF50'}
          >
            Sign In with Keycloak
          </button>

          <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#e3f2fd', borderRadius: '5px', textAlign: 'left' }}>
            <strong>Setup Checklist:</strong>
            <ul style={{ marginTop: '10px', fontSize: '14px' }}>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return <ProtectedContent />;
}

export default App;
