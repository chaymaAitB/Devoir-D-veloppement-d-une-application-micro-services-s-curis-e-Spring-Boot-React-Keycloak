import { ReactKeycloakProvider } from '@react-keycloak/web';
import keycloak from './keycloak';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useKeycloak } from '@react-keycloak/web';
import './App.css';

// Import components
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Companies from './pages/Companies';
import StockMarkets from './pages/StockMarkets';
import AdminPanel from './pages/AdminPanel';
import Login from './pages/Login';

// Private Route Component
const PrivateRoute = ({ children, role }) => {
  const { keycloak } = useKeycloak();

  if (!keycloak.authenticated) {
    return <Navigate to="/login" />;
  }

  if (role && !keycloak.hasRealmRole(role)) {
    return <Navigate to="/" />;
  }

  return children;
};

function App() {
  return (
    <ReactKeycloakProvider
      authClient={keycloak}
      initOptions={{ onLoad: 'login-required' }}
      LoadingComponent={<div className="loading">Loading...</div>}
    >
      <Router>
        <AppContent />
      </Router>
    </ReactKeycloakProvider>
  );
}

// Separate component to use hooks
function AppContent() {
  const { keycloak, initialized } = useKeycloak();

  if (!initialized) {
    return <div className="loading">Loading Keycloak...</div>;
  }

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/companies" element={<Companies />} />
        <Route path="/stock-markets" element={<StockMarkets />} />
        <Route path="/admin" element={
          <PrivateRoute role="ADMIN">
            <AdminPanel />
          </PrivateRoute>
        } />
      </Routes>
    </>
  );
}

export default App;