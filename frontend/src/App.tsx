import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Home } from './pages/Home';
import { Projects } from './pages/Projects';
import { Contact } from './pages/Contact';
import { Admin } from './pages/Admin';
import { Debug } from './pages/Debug';
import { AdminDebug } from './pages/AdminDebug';
import { AdminSimple } from './pages/AdminSimple';

function App() {
  try {
    return (
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/debug" element={<Debug />} />
            <Route path="/admin-debug" element={<AdminDebug />} />
            <Route path="/admin-simple" element={<AdminSimple />} />
            <Route path="/" element={<Home />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </Router>
      </AuthProvider>
    );
  } catch (error) {
    return <div>Error loading app: {String(error)}</div>;
  }
}

export default App
