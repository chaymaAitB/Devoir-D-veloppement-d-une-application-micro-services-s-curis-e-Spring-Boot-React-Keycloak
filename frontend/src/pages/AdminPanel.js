import { useKeycloak } from '@react-keycloak/web';

export default function AdminPanel() {
  const { keycloak } = useKeycloak();

  return (
    <div className="admin-panel">
      <h2>🔐 Admin Panel</h2>
      <p>Welcome, Administrator! You have full access to all features.</p>

      <div className="admin-features">
        <div className="feature-card">
          <h3>📊 Dashboard</h3>
          <p>View system statistics and metrics</p>
        </div>

        <div className="feature-card">
          <h3>👥 User Management</h3>
          <p>Manage users and roles in Keycloak</p>
        </div>

        <div className="feature-card">
          <h3>⚙️ System Settings</h3>
          <p>Configure application settings</p>
        </div>

        <div className="feature-card">
          <h3>📈 Data Management</h3>
          <p>Import/Export data, run maintenance</p>
        </div>
      </div>

      <div className="user-info">
        <h4>Your Token Info:</h4>
        <pre>{JSON.stringify(keycloak.tokenParsed, null, 2)}</pre>
      </div>
    </div>
  );
}