import { useState, useEffect } from 'react';
import { useKeycloak } from '@react-keycloak/web';
import api from '../api';
import './Companies.css';

export default function Companies() {
  const { keycloak, initialized } = useKeycloak();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    sector: '',
    country: ''
  });
  const [editingId, setEditingId] = useState(null);

  const isAdmin = keycloak.hasRealmRole('ADMIN');

  useEffect(() => {
    if (initialized && keycloak.authenticated) {
      loadCompanies();
    }
  }, [initialized, keycloak.authenticated]);

  const loadCompanies = async () => {
    try {
      console.log('🔍 Loading companies from /api/companies');
      const response = await api.get('/api/companies');

      const companies =
        response.data?._embedded?.companies ?? [];

      console.log('📋 Extracted companies:', companies);
      setCompanies(companies);
      setError('');
    } catch (error) {
      console.error('❌ Failed to load companies:', error);
      setError('Failed to load companies');
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!isAdmin) {
      setError('Only admins can create companies');
      return;
    }

    // Validate required fields
    if (!formData.name.trim()) {
      setError('Company name is required');
      return;
    }

    try {
      // Prepare payload matching Java entity
      const payload = {
        name: formData.name.trim(),
        sector: formData.sector.trim(),
        country: formData.country.trim()
      };

      console.log('📤 Sending payload:', payload);
      console.log('📤 Editing mode?', editingId);

      let response;
      if (editingId) {
        // UPDATE
        console.log(`🔄 Updating company with ID: ${editingId}`);
        response = await api.put(`/api/companies/${editingId}`, payload);
        console.log('✅ Update response:', response.data);
        setSuccess('Company updated successfully!');
      } else {
        // CREATE
        console.log('🆕 Creating new company...');
        response = await api.post('/api/companies', payload);
        console.log('✅ Create response:', response.data);
        console.log('✅ Response has ID?', 'id' in response.data);
        console.log('✅ Response ID value:', response.data?.id);
        setSuccess('Company created successfully!');
      }

      // Reset form
      setFormData({ name: '', sector: '', country: '' });
      setEditingId(null);

      // Reload companies
      console.log('🔄 Reloading companies list...');
      loadCompanies();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);

    } catch (error) {
      console.error('❌ Operation failed:', error);
      console.error('❌ Error response:', error.response);

      let errorMessage = 'Operation failed';

      if (error.response) {
        if (error.response.status === 409) {
          errorMessage = 'A company with this name already exists';
        } else if (error.response.status === 400) {
          errorMessage = 'Invalid data. Please check your input.';
        } else if (error.response.data) {
          console.error('❌ Error response data:', error.response.data);
          errorMessage = typeof error.response.data === 'string'
            ? error.response.data
            : JSON.stringify(error.response.data);
        }
      } else {
        errorMessage = error.message;
      }

      setError(`Error: ${errorMessage}`);
    }
  };

  const handleEdit = (company) => {
    if (!isAdmin) return;

    setFormData({
      name: company.name || '',
      sector: company.sector || '',
      country: company.country || ''
    });
    setEditingId(company.id);
    setError('');
    setSuccess('');
  };

  const handleDelete = async (id) => {
    console.log('🗑️ Delete called with ID:', id, 'Type:', typeof id, 'Value:', id);

    // Convert to string and check
    const idStr = String(id);
    if (!id || idStr === 'undefined' || idStr === 'null' || idStr === 'NaN') {
      console.error('Invalid ID detected:', id);
      setError('Cannot delete: Invalid company ID (' + id + ')');
      return;
    }

    if (!isAdmin || !window.confirm('Are you sure you want to delete this company?\nThis action cannot be undone.')) {
      return;
    }

    try {
      setError('');
      setSuccess('');

      console.log('📤 Sending DELETE request for ID:', id);

      await api.delete(`/api/companies/${id}`);
      setSuccess('Company deleted successfully!');

      // Reload companies
      loadCompanies();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);

    } catch (error) {
      console.error('Delete failed:', error);

      let errorMessage = 'Failed to delete company';

      if (error.response) {
        if (error.response.status === 400) {
          errorMessage = 'Invalid company ID';
        } else if (error.response.status === 409) {
          errorMessage = 'Cannot delete company: It may have associated records';
        } else if (error.response.status === 404) {
          errorMessage = 'Company not found';
        } else if (error.response.data) {
          errorMessage = typeof error.response.data === 'string'
            ? error.response.data
            : 'Delete failed: ' + error.response.status;
        }
      }

      setError(errorMessage);
    }
  };

  const handleCancel = () => {
    setFormData({ name: '', sector: '', country: '' });
    setEditingId(null);
    setError('');
    setSuccess('');
  };

  if (loading) return <div className="loading">Loading companies...</div>;

  return (
    <div className="companies-container">
      <h2>🏢 Companies Management</h2>
      <p className="role-info">
        Logged in as: <strong>{keycloak.tokenParsed?.preferred_username}</strong> |
        Role: <span className={isAdmin ? 'role-admin' : 'role-client'}>
          {isAdmin ? 'ADMIN' : 'CLIENT'}
        </span>
      </p>

      {error && <div className="error-message">⚠️ {error}</div>}
      {success && <div className="success-message">✅ {success}</div>}

      {/* CREATE/UPDATE FORM (Admin only) */}
      {isAdmin && (
        <div className="form-container">
          <h3>{editingId ? '✏️ Edit Company' : '➕ Add New Company'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Company Name *</label>
              <input
                id="name"
                type="text"
                placeholder="e.g., Tech Corp"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="sector">Sector</label>
              <input
                id="sector"
                type="text"
                placeholder="e.g., Technology"
                value={formData.sector}
                onChange={e => setFormData({...formData, sector: e.target.value})}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="country">Country</label>
              <input
                id="country"
                type="text"
                placeholder="e.g., USA"
                value={formData.country}
                onChange={e => setFormData({...formData, country: e.target.value})}
                className="form-input"
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary">
                {editingId ? 'Update Company' : 'Add Company'}
              </button>
              {editingId && (
                <button type="button" onClick={handleCancel} className="btn-secondary">
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* COMPANIES LIST */}
      <div className="companies-list">
        <h3>📋 Companies List ({companies.length})</h3>

        {companies.length === 0 ? (
          <div className="empty-state">
            <p>No companies found. {isAdmin && 'Add your first company above!'}</p>
          </div>
        ) : (
          <div className="companies-grid">
            {companies.map(company => {
              console.log(`Rendering company:`, company);



              return (
                <div key={company.id} className="company-card">
                  <div className="company-header">
                    <h4>{company.name || 'Unnamed Company'}</h4>
                    <small>ID: {company.id || 'NO ID FOUND'}</small>
                    {isAdmin && (
                      <div className="company-actions">
                        <button
                          onClick={() => handleEdit(company)}
                          className="btn-edit"
                          title="Edit"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDelete(company.id)}
                          className="btn-delete"
                          title="Delete"
                          disabled={!company.id}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="company-details">
                    <p><strong>Sector:</strong> {company.sector || 'N/A'}</p>
                    <p><strong>Country:</strong> {company.country || 'N/A'}</p>
                    <p><strong>ID:</strong> {company.id || 'N/A'}</p>
                  </div>
                  <div className="company-links">
                    <a
                      href={company._links?.self.href || `#`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-view"
                    >
                      🔗 View API Details
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}