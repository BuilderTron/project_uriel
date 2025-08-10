import { useAuth } from '../contexts/AuthContext';

export const Admin = () => {
  const { user, isAdmin, signInWithGoogle, logout } = useAuth();

  if (!user) {
    return (
      <div style={{ padding: '20px', backgroundColor: 'white', minHeight: '100vh' }}>
        <h1 style={{ color: 'black' }}>Admin Login</h1>
        <p style={{ color: 'black' }}>Admin access required</p>
        
        <div style={{ margin: '20px 0' }}>
          <button 
            onClick={signInWithGoogle}
            style={{ 
              padding: '15px 30px', 
              fontSize: '18px', 
              backgroundColor: '#4285f4',
              color: 'white',
              border: '2px solid #4285f4',
              borderRadius: '8px',
              cursor: 'pointer',
              margin: '10px 0',
              display: 'block',
              width: '400px',
              textAlign: 'center' as const
            }}
          >
            🔐 Sign in with Google (@josejulianlopez.com)
          </button>
        </div>
        
        <p style={{ color: 'red', fontSize: '14px' }}>
          ↑ Click the button above to sign in ↑
        </p>
        
        <br />
        <a href="/" style={{ color: 'blue' }}>← Back to Home</a>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div>
        <h1>Access Denied</h1>
        <p>Admin access is restricted to @josejulianlopez.com domain</p>
        <p>Your email: {user.email}</p>
        <button 
          onClick={logout}
          style={{ 
            padding: '8px 16px', 
            fontSize: '14px', 
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            margin: '10px 0'
          }}
        >
          Sign Out
        </button>
        <br />
        <a href="/">← Back to Home</a>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Admin Dashboard</h1>
      <p>Welcome, {user.displayName || user.email}</p>
      
      <div>
        <h2>Admin Actions</h2>
        <nav>
          <a href="/admin/projects">Manage Projects</a> | 
          <a href="/admin/messages">View Messages</a> | 
          <a href="/admin/settings">Settings</a>
        </nav>
      </div>
      
      <div>
        <h3>Quick Stats</h3>
        <p>Dashboard functionality will be implemented here</p>
      </div>
      
      <button 
        onClick={logout}
        style={{ 
          padding: '8px 16px', 
          fontSize: '14px', 
          backgroundColor: '#dc3545',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          margin: '10px 0'
        }}
      >
        Sign Out
      </button>
      <br />
      <a href="/">← Back to Home</a>
    </div>
  );
};