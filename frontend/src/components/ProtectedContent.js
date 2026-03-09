import React, {useState} from 'react';
import {useAuth} from 'react-oidc-context';

function ProtectedContent() {
    const auth = useAuth();
    const [bookData, setBookData] = useState(null);
    const [videoData, setVideoData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const callAPI = async (endpoint, setData) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`http://localhost:8081/api/${endpoint}`, {
                headers: endpoint !== 'public' ? {
                    'Authorization': `Bearer ${auth.user?.access_token}`
                } : {}
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
            }

            const data = await response.json();
            setData(data);
        } catch (err) {
            setError(`Failed to call ${endpoint} API: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const callBookAPI = () => callAPI('books', setBookData);
    const callVideoAPI = () => callAPI('videos', setVideoData);

    return (
        <div style={{padding: '20px', maxWidth: '800px', margin: '0 auto'}}>
            <h1>Keycloak OIDC Demo</h1>

            <div style={{marginBottom: '20px', padding: '15px', backgroundColor: '#f0f0f0', borderRadius: '5px'}}>
                <h2>User Information</h2>
                <p><strong>Username:</strong> {auth.user?.profile?.preferred_username || 'N/A'}</p>
                <p><strong>Email:</strong> {auth.user?.profile?.email || 'N/A'}</p>
                <p><strong>Name:</strong> {auth.user?.profile?.name || 'N/A'}</p>
            </div>

            <div style={{marginBottom: '20px'}}>
                <h2>Test API Endpoints</h2>

                <div style={{marginBottom: '10px', display: 'flex', flexWrap: 'wrap', gap: '10px'}}>
                    <button
                        onClick={callVideoAPI}
                        disabled={loading}
                        style={{
                            padding: '10px 20px',
                            cursor: 'pointer',
                            backgroundColor: '#2196F3',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px'
                        }}
                    >
                        Read Videos
                    </button>

                    <button
                        onClick={callBookAPI}
                        disabled={loading}
                        style={{
                            padding: '10px 20px',
                            cursor: 'pointer',
                            backgroundColor: '#FF9800',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px'
                        }}
                    >
                        Read Books
                    </button>
                </div>

                {loading && <p>Loading...</p>}
                {error && <p style={{color: 'red'}}>{error}</p>}

                {bookData && (
                    <div style={{marginTop: '15px', padding: '10px', backgroundColor: '#fff3e0', borderRadius: '5px'}}>
                        <h3>Admin Endpoint Response:</h3>
                        <pre style={{fontSize: '12px', overflow: 'auto'}}>{JSON.stringify(bookData, null, 2)}</pre>
                    </div>
                )}

                {videoData && (
                    <div style={{marginTop: '15px', padding: '10px', backgroundColor: '#f3e5f5', borderRadius: '5px'}}>
                        <h3>Admin + User Endpoint Response:</h3>
                        <pre style={{fontSize: '12px', overflow: 'auto'}}>{JSON.stringify(videoData, null, 2)}</pre>
                    </div>
                )}
            </div>

            <div>
                <button
                    onClick={() => auth.signoutRedirect({post_logout_redirect_uri: "http://localhost:3000"})}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#f44336',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer'
                    }}
                >
                    Logout
                </button>
            </div>
        </div>
    );
}

export default ProtectedContent;
