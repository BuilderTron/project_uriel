import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../lib/firebase';

export const AdminSimple = () => {
  const handleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      hd: 'josejulianlopez.com'
    });
    
    try {
      const result = await signInWithPopup(auth, provider);
      console.log('Signed in:', result.user.email);
      alert(`Signed in as: ${result.user.email}`);
    } catch (error) {
      console.error('Sign in error:', error);
      alert('Sign in failed: ' + error);
    }
  };

  return (
    <div style={{ padding: '20px', backgroundColor: 'white', color: 'black' }}>
      <h1>Simple Admin Page</h1>
      <p>This bypasses the Auth context</p>
      
      <button 
        onClick={handleSignIn}
        style={{ 
          padding: '15px 30px', 
          fontSize: '18px', 
          backgroundColor: '#4285f4',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          margin: '10px 0',
          display: 'block'
        }}
      >
        🔐 Sign in with Google
      </button>
      
      <a href="/">← Back to Home</a>
    </div>
  );
};