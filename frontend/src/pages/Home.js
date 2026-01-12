import { useKeycloak } from '@react-keycloak/web';

export default function Home() {
  const { keycloak } = useKeycloak();

  return (
    <div className="home">
      <h1>Welcome to Microservices Dashboard</h1>

      {keycloak.authenticated ? (
        <div className="user-info">
          <h3>Logged in as: {keycloak.tokenParsed?.preferred_username}</h3>
          <p>Email: {keycloak.tokenParsed?.email || 'N/A'}</p>
          <p>Roles: {keycloak.tokenParsed?.realm_access?.roles?.join(', ') || 'No roles'}</p>
        </div>
      ) : (
        <p>Please login to access the application.</p>
      )}

      <div className="features">
        <h3>Features:</h3>
        <ul>
          <li>Company Management (CRUD)</li>
          <li>Stock Market Data</li>
          <li>Role-based Access Control</li>
          <li>Secure Authentication with Keycloak</li>
        </ul>
      </div>
    </div>
  );
}