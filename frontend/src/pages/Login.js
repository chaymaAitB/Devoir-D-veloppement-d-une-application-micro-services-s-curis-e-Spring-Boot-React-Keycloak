import { useKeycloak } from '@react-keycloak/web';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const { keycloak } = useKeycloak();
  const navigate = useNavigate();

  useEffect(() => {
    if (keycloak.authenticated) {
      navigate('/');
    }
  }, [keycloak.authenticated, navigate]);

  return (
    <div className="login-page">
      <div className="login-container">
        <h2>🔐 Login Required</h2>
        <p>You need to authenticate to access this application.</p>

        <div className="login-options">
          <button
            className="login-btn"
            onClick={() => keycloak.login()}
          >
            Login with Keycloak
          </button>

          <button
            className="register-btn"
            onClick={() => keycloak.register()}
          >
            Register New Account
          </button>
        </div>

        <div className="test-credentials">
          <h4>Test Credentials:</h4>
          <p><strong>Admin:</strong> admin / admin</p>
          <p><strong>Client:</strong> client / client</p>
        </div>
      </div>
    </div>
  );
}