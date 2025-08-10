export const AdminDebug = () => {
  return (
    <div style={{ padding: '20px', backgroundColor: 'white', color: 'black' }}>
      <h1>Admin Debug Page</h1>
      <p>If you can see this, React routing works</p>
      <p>This is a test page without Firebase dependencies</p>
      <button style={{ 
        padding: '15px 30px', 
        backgroundColor: 'red', 
        color: 'white',
        border: 'none',
        fontSize: '18px'
      }}>
        TEST BUTTON - Can you see this?
      </button>
      <br />
      <a href="/">← Back to Home</a>
    </div>
  );
};