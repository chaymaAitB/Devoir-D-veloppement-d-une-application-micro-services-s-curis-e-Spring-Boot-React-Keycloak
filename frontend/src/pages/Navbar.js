import { useKeycloak } from '@react-keycloak/web';
import { Link } from 'react-router-dom';

export default function Navbar() {
  const { keycloak } = useKeycloak();

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>
          🏢 Microservices App
        </Link>
      </div>
      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/companies">Companies</Link>
        <Link to="/stock-markets">Stock Markets</Link>
        {keycloak.hasRealmRole('ADMIN') && (
          <Link to="/admin">Admin Panel</Link>
        )}
      </div>
      <div className="auth-section">
        {keycloak.authenticated ? (
          <>
            <span className="username">
              👤 {keycloak.tokenParsed?.preferred_username || 'User'}
              {keycloak.hasRealmRole('ADMIN') && (
                <span className="role-badge admin">ADMIN</span>
              )}
              {keycloak.hasRealmRole('CLIENT') && (
                <span className="role-badge client">CLIENT</span>
              )}
            </span>
            <button onClick={() => keycloak.logout()} className="logout-btn">
              Logout
            </button>
          </>
        ) : (
          <button onClick={() => keycloak.login()} className="login-btn">
            Login
          </button>
        )}
      </div>
    </nav>
  );
}