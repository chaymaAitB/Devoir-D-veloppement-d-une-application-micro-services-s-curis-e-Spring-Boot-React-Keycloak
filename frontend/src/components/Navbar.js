import { useKeycloak } from '@react-keycloak/web';
import { Link } from 'react-router-dom';

export default function Navbar() {
  const { keycloak } = useKeycloak();

  return (
    <nav className="navbar">
      <div className="nav-brand">Microservices App</div>
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
            <span>Welcome, {keycloak.tokenParsed?.preferred_username}</span>
            <button onClick={() => keycloak.logout()}>Logout</button>
          </>
        ) : (
          <button onClick={() => keycloak.login()}>Login</button>
        )}
      </div>
    </nav>
  );
}